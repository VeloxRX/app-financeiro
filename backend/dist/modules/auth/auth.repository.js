"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.findByEmail = findByEmail;
exports.findById = findById;
exports.update = update;
exports.updateScore = updateScore;
exports.deleteUser = deleteUser;
const database_1 = require("../../config/database");
const uuid_1 = require("uuid");
async function create(input) {
    const id = (0, uuid_1.v4)();
    const rows = await (0, database_1.query)(`INSERT INTO users (id, name, email, password_hash, currency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`, [id, input.name, input.email, input.password_hash, input.currency]);
    return rows[0];
}
async function findByEmail(email) {
    const rows = await (0, database_1.query)('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
}
async function findById(id) {
    const rows = await (0, database_1.query)('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
}
async function update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && key !== 'password' && key !== 'email') {
            fields.push(`${key} = $${idx}`);
            values.push(value);
            idx++;
        }
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const rows = await (0, database_1.query)(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return rows[0];
}
async function updateScore(userId, points) {
    await (0, database_1.query)('UPDATE users SET gamification_score = gamification_score + $1 WHERE id = $2', [points, userId]);
}
async function deleteUser(id) {
    await (0, database_1.query)('DELETE FROM users WHERE id = $1', [id]);
}
//# sourceMappingURL=auth.repository.js.map