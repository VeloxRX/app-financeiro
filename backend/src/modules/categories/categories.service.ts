import { query } from '../../config/database';
import { v4 as uuid } from 'uuid';

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  monthly_budget: number | null;
  is_system: boolean;
}

export async function listCategories(userId: string): Promise<Category[]> {
  return query<Category>(
    'SELECT * FROM categories WHERE user_id = $1 OR is_system = TRUE ORDER BY is_system DESC, name',
    [userId]
  );
}

export async function createCategory(userId: string, data: Partial<Category>): Promise<Category> {
  const id = uuid();
  const rows = await query<Category>(
    `INSERT INTO categories (id, user_id, name, icon, color, monthly_budget)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, userId, data.name, data.icon || '📦', data.color || '#AEB6BF', data.monthly_budget || null]
  );
  return rows[0];
}

export async function updateCategory(userId: string, id: string, data: Partial<Category>): Promise<Category | null> {
  const existing = await query<Category>('SELECT * FROM categories WHERE id = $1', [id]);
  if (!existing[0]) return null;
  if (existing[0].is_system && existing[0].user_id === null) {
    throw new Error('SYSTEM_CATEGORY');
  }

  const rows = await query<Category>(
    `UPDATE categories SET name = COALESCE($1, name), icon = COALESCE($2, icon),
     color = COALESCE($3, color), monthly_budget = COALESCE($4, monthly_budget)
     WHERE id = $5 AND (user_id = $6 OR is_system = TRUE) RETURNING *`,
    [data.name, data.icon, data.color, data.monthly_budget, id, userId]
  );
  return rows[0] || null;
}

export async function deleteCategory(userId: string, id: string): Promise<void> {
  const existing = await query<Category>('SELECT * FROM categories WHERE id = $1', [id]);
  if (existing[0]?.is_system) throw new Error('SYSTEM_CATEGORY');

  // Move transactions to "Outros"
  const outros = await query<Category>(
    "SELECT id FROM categories WHERE name = 'Outros' AND is_system = TRUE LIMIT 1"
  );
  if (outros[0]) {
    await query('UPDATE transactions SET category_id = $1 WHERE category_id = $2 AND user_id = $3',
      [outros[0].id, id, userId]);
  }
  await query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
}
