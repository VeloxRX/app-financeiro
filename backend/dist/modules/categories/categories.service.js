"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const database_1 = require("../../config/database");
const uuid_1 = require("uuid");
async function listCategories(userId) {
    return (0, database_1.query)('SELECT * FROM categories WHERE user_id = $1 OR is_system = TRUE ORDER BY is_system DESC, name', [userId]);
}
async function createCategory(userId, data) {
    const id = (0, uuid_1.v4)();
    const rows = await (0, database_1.query)(`INSERT INTO categories (id, user_id, name, icon, color, monthly_budget)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [id, userId, data.name, data.icon || '📦', data.color || '#AEB6BF', data.monthly_budget || null]);
    return rows[0];
}
async function updateCategory(userId, id, data) {
    const existing = await (0, database_1.query)('SELECT * FROM categories WHERE id = $1', [id]);
    if (!existing[0])
        return null;
    if (existing[0].is_system && existing[0].user_id === null) {
        throw new Error('SYSTEM_CATEGORY');
    }
    const rows = await (0, database_1.query)(`UPDATE categories SET name = COALESCE($1, name), icon = COALESCE($2, icon),
     color = COALESCE($3, color), monthly_budget = COALESCE($4, monthly_budget)
     WHERE id = $5 AND (user_id = $6 OR is_system = TRUE) RETURNING *`, [data.name, data.icon, data.color, data.monthly_budget, id, userId]);
    return rows[0] || null;
}
async function deleteCategory(userId, id) {
    const existing = await (0, database_1.query)('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing[0]?.is_system)
        throw new Error('SYSTEM_CATEGORY');
    // Move transactions to "Outros"
    const outros = await (0, database_1.query)("SELECT id FROM categories WHERE name = 'Outros' AND is_system = TRUE LIMIT 1");
    if (outros[0]) {
        await (0, database_1.query)('UPDATE transactions SET category_id = $1 WHERE category_id = $2 AND user_id = $3', [outros[0].id, id, userId]);
    }
    await (0, database_1.query)('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
}
//# sourceMappingURL=categories.service.js.map