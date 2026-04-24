"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAlerts = listAlerts;
exports.markAsRead = markAsRead;
exports.markAllAsRead = markAllAsRead;
exports.deleteAlert = deleteAlert;
const database_1 = require("../../config/database");
async function listAlerts(userId, page, limit, unreadOnly) {
    const conditions = ['user_id = $1'];
    const params = [userId];
    if (unreadOnly) {
        conditions.push('is_read = FALSE');
    }
    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;
    const countResult = await (0, database_1.query)(`SELECT COUNT(*) as count FROM alerts WHERE ${where}`, params);
    const unreadCount = await (0, database_1.query)('SELECT COUNT(*) as count FROM alerts WHERE user_id = $1 AND is_read = FALSE', [userId]);
    const rows = await (0, database_1.query)(`SELECT * FROM alerts WHERE ${where} ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [userId, limit, offset]);
    return {
        data: rows,
        total: parseInt(countResult[0].count),
        unread: parseInt(unreadCount[0].count),
        page,
        limit,
    };
}
async function markAsRead(userId, alertId) {
    await (0, database_1.query)('UPDATE alerts SET is_read = TRUE WHERE id = $1 AND user_id = $2', [alertId, userId]);
}
async function markAllAsRead(userId) {
    await (0, database_1.query)('UPDATE alerts SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE', [userId]);
}
async function deleteAlert(userId, alertId) {
    await (0, database_1.query)('DELETE FROM alerts WHERE id = $1 AND user_id = $2', [alertId, userId]);
}
//# sourceMappingURL=alerts.service.js.map