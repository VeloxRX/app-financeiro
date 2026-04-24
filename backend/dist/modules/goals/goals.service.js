"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGoals = listGoals;
exports.createGoal = createGoal;
exports.updateGoal = updateGoal;
exports.deleteGoal = deleteGoal;
exports.depositToGoal = depositToGoal;
const database_1 = require("../../config/database");
const uuid_1 = require("uuid");
async function listGoals(userId) {
    const goals = await (0, database_1.query)(`SELECT *,
       CASE WHEN target_amount > 0
         THEN ROUND((current_amount / target_amount * 100)::numeric, 1)
         ELSE 0
       END as progress_pct
     FROM goals WHERE user_id = $1 ORDER BY status, created_at DESC`, [userId]);
    return goals;
}
async function createGoal(userId, input) {
    const id = (0, uuid_1.v4)();
    const rows = await (0, database_1.query)(`INSERT INTO goals (id, user_id, title, description, target_amount, deadline, category, auto_save_amount, color, icon)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [id, userId, input.title, input.description || null, input.target_amount,
        input.deadline || null, input.category || 'other', input.auto_save_amount || null,
        input.color || '#4ECDC4', input.icon || '🎯']);
    return rows[0];
}
async function updateGoal(userId, id, input) {
    const fields = [];
    const values = [];
    let idx = 1;
    const allowed = ['title', 'description', 'target_amount', 'deadline', 'category', 'auto_save_amount', 'color', 'icon', 'status'];
    for (const [key, value] of Object.entries(input)) {
        if (allowed.includes(key) && value !== undefined) {
            fields.push(`${key} = $${idx}`);
            values.push(value);
            idx++;
        }
    }
    if (fields.length === 0)
        return null;
    values.push(id, userId);
    const rows = await (0, database_1.query)(`UPDATE goals SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`, values);
    return rows[0] || null;
}
async function deleteGoal(userId, id) {
    await (0, database_1.query)('DELETE FROM goals WHERE id = $1 AND user_id = $2', [id, userId]);
}
async function depositToGoal(userId, goalId, amount) {
    const rows = await (0, database_1.query)(`UPDATE goals SET current_amount = current_amount + $1
     WHERE id = $2 AND user_id = $3 RETURNING *`, [amount, goalId, userId]);
    if (!rows[0])
        return null;
    const goal = rows[0];
    const pct = (goal.current_amount / goal.target_amount) * 100;
    // Check milestones
    const milestones = [25, 50, 75, 100];
    const prevPct = ((goal.current_amount - amount) / goal.target_amount) * 100;
    for (const ms of milestones) {
        if (prevPct < ms && pct >= ms) {
            await (0, database_1.query)(`INSERT INTO alerts (id, user_id, type, title, message, metadata) VALUES ($1, $2, $3, $4, $5, $6)`, [(0, uuid_1.v4)(), userId, 'GOAL_MILESTONE',
                `🎉 ${ms}% da meta "${goal.title}" atingido!`,
                `Você já acumulou R$ ${goal.current_amount.toFixed(2)} de R$ ${goal.target_amount.toFixed(2)}.`,
                JSON.stringify({ goal_id: goalId, milestone: ms, current: goal.current_amount, target: goal.target_amount })]);
            // Gamification points for milestones
            const points = ms === 100 ? 50 : 25;
            await (0, database_1.query)('UPDATE users SET gamification_score = gamification_score + $1 WHERE id = $2', [points, userId]);
        }
    }
    // Auto-complete goal
    if (pct >= 100 && goal.status !== 'completed') {
        await (0, database_1.query)("UPDATE goals SET status = 'completed' WHERE id = $1", [goalId]);
    }
    return goal;
}
//# sourceMappingURL=goals.service.js.map