"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransactions = listTransactions;
exports.createTransaction = createTransaction;
exports.updateTransaction = updateTransaction;
exports.deleteTransaction = deleteTransaction;
exports.exportTransactions = exportTransactions;
const database_1 = require("../../config/database");
const uuid_1 = require("uuid");
const redis_1 = require("../../config/redis");
const aiService = __importStar(require("../ai/ai.service"));
async function listTransactions(userId, filters) {
    const conditions = ['t.user_id = $1'];
    const params = [userId];
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
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) as count FROM transactions t WHERE ${where}`, params);
    params.push(filters.limit, offset);
    const rows = await (0, database_1.query)(`SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE ${where}
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`, params);
    return {
        data: rows,
        total: parseInt(countResult[0].count),
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(parseInt(countResult[0].count) / filters.limit),
    };
}
async function createTransaction(userId, input) {
    // Auto-categorize if no category provided
    let categoryId = input.category_id;
    if (!categoryId && input.description) {
        const suggestion = await aiService.autoCategorizeTransaction(input.description, input.amount, userId);
        categoryId = suggestion.category_id;
    }
    const id = (0, uuid_1.v4)();
    const rows = await (0, database_1.query)(`INSERT INTO transactions (id, user_id, type, amount, description, category_id, date, recurrence, tags, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [id, userId, input.type, input.amount, input.description || '', categoryId || null,
        input.date, input.recurrence || 'none', input.tags || [], input.notes || null]);
    // Invalidate dashboard cache
    await (0, redis_1.invalidatePattern)(`dashboard:${userId}:*`);
    // Check budget alerts
    if (input.type === 'expense' && categoryId) {
        await checkBudgetAlert(userId, categoryId);
    }
    // Add gamification points
    await (0, database_1.query)('UPDATE users SET gamification_score = gamification_score + 10 WHERE id = $1', [userId]);
    return rows[0];
}
async function updateTransaction(userId, id, input) {
    const fields = [];
    const values = [];
    let idx = 1;
    const allowedFields = ['type', 'amount', 'description', 'category_id', 'date', 'recurrence', 'tags', 'notes'];
    for (const [key, value] of Object.entries(input)) {
        if (allowedFields.includes(key) && value !== undefined) {
            fields.push(`${key} = $${idx}`);
            values.push(value);
            idx++;
        }
    }
    if (fields.length === 0)
        return null;
    values.push(id, userId);
    const rows = await (0, database_1.query)(`UPDATE transactions SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values);
    await (0, redis_1.invalidatePattern)(`dashboard:${userId}:*`);
    return rows[0] || null;
}
async function deleteTransaction(userId, id) {
    await (0, database_1.query)('DELETE FROM transactions WHERE id = $1 AND user_id = $2', [id, userId]);
    await (0, redis_1.invalidatePattern)(`dashboard:${userId}:*`);
}
async function exportTransactions(userId, opts) {
    const conditions = ['t.user_id = $1'];
    const params = [userId];
    let idx = 2;
    if (opts.from) {
        conditions.push(`t.date >= $${idx}`);
        params.push(opts.from);
        idx++;
    }
    if (opts.to) {
        conditions.push(`t.date <= $${idx}`);
        params.push(opts.to);
        idx++;
    }
    if (opts.categories) {
        const catIds = opts.categories.split(',');
        conditions.push(`t.category_id = ANY($${idx})`);
        params.push(catIds);
        idx++;
    }
    const rows = await (0, database_1.query)(`SELECT t.*, c.name as category_name FROM transactions t
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE ${conditions.join(' AND ')} ORDER BY t.date DESC`, params);
    if (opts.format === 'csv') {
        const header = 'Data,Tipo,Descrição,Categoria,Valor,Tags\n';
        const lines = rows.map(r => `${r.date},${r.type},${r.description},${r.category_name || ''},${r.amount},${(r.tags || []).join(';')}`).join('\n');
        return header + lines;
    }
    return JSON.stringify(rows, null, 2);
}
async function checkBudgetAlert(userId, categoryId) {
    const budget = await (0, database_1.query)('SELECT monthly_budget, name FROM categories WHERE id = $1', [categoryId]);
    if (!budget[0]?.monthly_budget)
        return;
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const spent = await (0, database_1.query)(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = $1 AND category_id = $2 AND type = 'expense' AND date >= $3`, [userId, categoryId, monthStart]);
    const totalSpent = parseFloat(spent[0].total);
    const pct = (totalSpent / budget[0].monthly_budget) * 100;
    if (pct >= 100) {
        await (0, database_1.query)(`INSERT INTO alerts (id, user_id, type, title, message, metadata) VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), userId, 'BUDGET_EXCEEDED', `Orçamento de ${budget[0].name} ultrapassado!`,
            `Você já gastou R$ ${totalSpent.toFixed(2)} de R$ ${budget[0].monthly_budget.toFixed(2)} em ${budget[0].name}.`,
            JSON.stringify({ category_id: categoryId, spent: totalSpent, budget: budget[0].monthly_budget })]);
    }
    else if (pct >= 80) {
        await (0, database_1.query)(`INSERT INTO alerts (id, user_id, type, title, message, metadata) VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), userId, 'BUDGET_WARNING', `${budget[0].name}: ${pct.toFixed(0)}% do orçamento utilizado`,
            `Você já gastou R$ ${totalSpent.toFixed(2)} de R$ ${budget[0].monthly_budget.toFixed(2)} em ${budget[0].name}.`,
            JSON.stringify({ category_id: categoryId, spent: totalSpent, budget: budget[0].monthly_budget, pct })]);
    }
}
//# sourceMappingURL=transactions.service.js.map