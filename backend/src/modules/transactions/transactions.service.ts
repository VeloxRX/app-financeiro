import { query } from '../../config/database';
import { v4 as uuid } from 'uuid';
import { invalidatePattern } from '../../config/redis';
import * as aiService from '../ai/ai.service';

interface TransactionInput {
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description?: string;
  category_id?: string;
  date: string;
  recurrence?: string;
  tags?: string[];
  notes?: string;
}

interface TransactionRow {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  date: string;
  recurrence: string;
  tags: string[];
  notes: string;
  created_at: Date;
}

interface ListFilters {
  type?: string;
  category_id?: string;
  from?: string;
  to?: string;
  search?: string;
  page: number;
  limit: number;
}

export async function listTransactions(userId: string, filters: ListFilters) {
  const conditions: string[] = ['t.user_id = $1'];
  const params: any[] = [userId];
  let idx = 2;

  if (filters.type) {
    conditions.push(`t.type = $${idx}`);
    params.push(filters.type);
    idx++;
  }
  if (filters.category_id) {
    conditions.push(`t.category_id = $${idx}`);
    params.push(filters.category_id);
    idx++;
  }
  if (filters.from) {
    conditions.push(`t.date >= $${idx}`);
    params.push(filters.from);
    idx++;
  }
  if (filters.to) {
    conditions.push(`t.date <= $${idx}`);
    params.push(filters.to);
    idx++;
  }
  if (filters.search) {
    conditions.push(`t.description ILIKE $${idx}`);
    params.push(`%${filters.search}%`);
    idx++;
  }

  const where = conditions.join(' AND ');
  const offset = (filters.page - 1) * filters.limit;

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM transactions t WHERE ${where}`, params
  );

  params.push(filters.limit, offset);
  const rows = await query<TransactionRow>(
    `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE ${where}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    params
  );

  return {
    data: rows,
    total: parseInt(countResult[0].count),
    page: filters.page,
    limit: filters.limit,
    pages: Math.ceil(parseInt(countResult[0].count) / filters.limit),
  };
}

export async function createTransaction(userId: string, input: TransactionInput) {
  // Auto-categorize if no category provided
  let categoryId: string | undefined | null = input.category_id;
  if (!categoryId && input.description) {
    const suggestion = await aiService.autoCategorizeTransaction(input.description, input.amount, userId);
    categoryId = suggestion.category_id;
  }

  const id = uuid();
  const rows = await query<TransactionRow>(
    `INSERT INTO transactions (id, user_id, type, amount, description, category_id, date, recurrence, tags, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [id, userId, input.type, input.amount, input.description || '', categoryId || null,
     input.date, input.recurrence || 'none', input.tags || [], input.notes || null]
  );

  // Invalidate dashboard cache
  await invalidatePattern(`dashboard:${userId}:*`);

  // Check budget alerts
  if (input.type === 'expense' && categoryId) {
    await checkBudgetAlert(userId, categoryId);
  }

  // Add gamification points
  await query('UPDATE users SET gamification_score = gamification_score + 10 WHERE id = $1', [userId]);

  return rows[0];
}

export async function updateTransaction(userId: string, id: string, input: Partial<TransactionInput>) {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const allowedFields = ['type', 'amount', 'description', 'category_id', 'date', 'recurrence', 'tags', 'notes'];
  for (const [key, value] of Object.entries(input)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) return null;

  values.push(id, userId);
  const rows = await query<TransactionRow>(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
    values
  );

  await invalidatePattern(`dashboard:${userId}:*`);
  return rows[0] || null;
}

export async function deleteTransaction(userId: string, id: string) {
  await query('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
  await invalidatePattern(`dashboard:${userId}:*`);
}

export async function generateMonthlyRecurring(userId: string) {
  await query(
    `INSERT INTO transactions (id, user_id, type, amount, description, category_id, date, recurrence, tags, notes)
     SELECT DISTINCT ON (t.description)
       gen_random_uuid(),
       t.user_id,
       t.type,
       t.amount,
       t.description,
       t.category_id,
       CURRENT_DATE,
       'monthly',
       t.tags,
       'Gerado automaticamente'
     FROM transactions t
     WHERE t.user_id = $1 
       AND t.recurrence = 'monthly'
       AND NOT EXISTS (
         SELECT 1 FROM transactions t2 
         WHERE t2.user_id = $1 
           AND t2.description = t.description 
           AND EXTRACT(MONTH FROM t2.date) = EXTRACT(MONTH FROM CURRENT_DATE)
           AND EXTRACT(YEAR FROM t2.date) = EXTRACT(YEAR FROM CURRENT_DATE)
       )
     ORDER BY t.description, t.date DESC`,
    [userId]
  );
}

export async function exportTransactions(userId: string, opts: { format: string; from?: string; to?: string; categories?: string }) {
  const conditions: string[] = ['t.user_id = $1'];
  const params: any[] = [userId];
  let idx = 2;

  if (opts.from) { conditions.push(`t.date >= $${idx}`); params.push(opts.from); idx++; }
  if (opts.to) { conditions.push(`t.date <= $${idx}`); params.push(opts.to); idx++; }
  if (opts.categories) {
    const catIds = opts.categories.split(',');
    conditions.push(`t.category_id = ANY($${idx})`);
    params.push(catIds);
    idx++;
  }

  const rows = await query<TransactionRow>(
    `SELECT t.*, c.name as category_name FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE ${conditions.join(' AND ')} ORDER BY t.date DESC`,
    params
  );

  if (opts.format === 'csv') {
    const header = 'Data,Tipo,Descrição,Categoria,Valor,Tags\n';
    const lines = rows.map(r =>
      `${r.date},${r.type},${r.description},${r.category_name || ''},${r.amount},${(r.tags || []).join(';')}`
    ).join('\n');
    return header + lines;
  }

  return JSON.stringify(rows, null, 2);
}

async function checkBudgetAlert(userId: string, categoryId: string) {
  const budget = await query<{ monthly_budget: number; name: string }>(
    'SELECT monthly_budget, name FROM categories WHERE id = $1', [categoryId]
  );
  if (!budget[0]?.monthly_budget) return;

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const spent = await query<{ total: string }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = $1 AND category_id = $2 AND type = 'expense' AND date >= $3`,
    [userId, categoryId, monthStart]
  );

  const totalSpent = parseFloat(spent[0].total);
  const pct = (totalSpent / budget[0].monthly_budget) * 100;

  if (pct >= 100) {
    await query(
      `INSERT INTO alerts (id, user_id, type, title, message, metadata) VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuid(), userId, 'BUDGET_EXCEEDED', `Orçamento de ${budget[0].name} ultrapassado!`,
       `Você já gastou R$ ${totalSpent.toFixed(2)} de R$ ${budget[0].monthly_budget.toFixed(2)} em ${budget[0].name}.`,
       JSON.stringify({ category_id: categoryId, spent: totalSpent, budget: budget[0].monthly_budget })]
    );
  } else if (pct >= 80) {
    await query(
      `INSERT INTO alerts (id, user_id, type, title, message, metadata) VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuid(), userId, 'BUDGET_WARNING', `${budget[0].name}: ${pct.toFixed(0)}% do orçamento utilizado`,
       `Você já gastou R$ ${totalSpent.toFixed(2)} de R$ ${budget[0].monthly_budget.toFixed(2)} em ${budget[0].name}.`,
       JSON.stringify({ category_id: categoryId, spent: totalSpent, budget: budget[0].monthly_budget, pct })]
    );
  }
}
