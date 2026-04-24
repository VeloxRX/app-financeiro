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
exports.getDashboardSummary = getDashboardSummary;
exports.getCashflow = getCashflow;
exports.getMonthlyReport = getMonthlyReport;
exports.getYearlyReport = getYearlyReport;
exports.getCategoryReport = getCategoryReport;
exports.getTrends = getTrends;
const database_1 = require("../../config/database");
const redis_1 = require("../../config/redis");
const aiService = __importStar(require("../ai/ai.service"));
async function getDashboardSummary(userId) {
    return (0, redis_1.getOrSet)(`dashboard:${userId}:summary`, 300, async () => {
        const now = new Date();
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        // Monthly totals
        const totals = await (0, database_1.query)(`SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions
       WHERE user_id = $1 AND date >= $2 GROUP BY type`, [userId, monthStart]);
        const income = parseFloat(totals.find(t => t.type === 'income')?.total || '0');
        const expenses = parseFloat(totals.find(t => t.type === 'expense')?.total || '0');
        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
        // Top categories
        const topCategories = await (0, database_1.query)(`SELECT c.name, c.icon, c.color, COALESCE(SUM(t.amount), 0) as total
       FROM transactions t JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.type = 'expense' AND t.date >= $2
       GROUP BY c.id, c.name, c.icon, c.color ORDER BY total DESC LIMIT 5`, [userId, monthStart]);
        // Active alerts
        const alerts = await (0, database_1.query)('SELECT * FROM alerts WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC LIMIT 5', [userId]);
        // Goal progress
        const goals = await (0, database_1.query)(`SELECT id, title, target_amount, current_amount, icon, color,
         CASE WHEN target_amount > 0 THEN ROUND((current_amount/target_amount*100)::numeric,1) ELSE 0 END as progress
       FROM goals WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC`, [userId]);
        // Trend (compare with last month)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthExpenses = await (0, database_1.query)(`SELECT COALESCE(SUM(amount), 0) as total FROM transactions
       WHERE user_id = $1 AND type = 'expense' AND date >= $2 AND date <= $3`, [userId, lastMonthStart.toISOString().split('T')[0], lastMonthEnd.toISOString().split('T')[0]]);
        const lastExp = parseFloat(lastMonthExpenses[0]?.total || '0');
        const trend = expenses < lastExp ? 'positive' : expenses > lastExp ? 'negative' : 'neutral';
        // AI Insight
        const aiInsight = await aiService.generateMonthlyInsight(userId, now.getMonth() + 1, now.getFullYear());
        // Gamification
        const user = await (0, database_1.query)('SELECT gamification_score FROM users WHERE id = $1', [userId]);
        const score = user[0]?.gamification_score || 0;
        const level = score < 200 ? 'Iniciante Financeiro' : score < 500 ? 'Poupador' :
            score < 1000 ? 'Gestor Financeiro' : score < 2500 ? 'Especialista' : 'Mestre das Finanças';
        return {
            balance,
            monthly_income: income,
            monthly_expenses: expenses,
            savings_rate: Math.round(savingsRate * 10) / 10,
            top_categories: topCategories,
            alerts,
            goal_progress: goals,
            trend,
            ai_insight: aiInsight,
            gamification: { score, level },
        };
    });
}
async function getCashflow(userId, days) {
    const rows = await (0, database_1.query)(`SELECT date,
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
     FROM transactions
     WHERE user_id = $1 AND date >= CURRENT_DATE - $2::int
     GROUP BY date ORDER BY date`, [userId, days]);
    return rows;
}
async function getMonthlyReport(userId, year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    const byCategory = await (0, database_1.query)(`SELECT c.name, c.icon, c.color, c.monthly_budget,
       COALESCE(SUM(t.amount), 0) as total, COUNT(t.id) as count
     FROM categories c LEFT JOIN transactions t
       ON c.id = t.category_id AND t.user_id = $1 AND t.date >= $2 AND t.date <= $3 AND t.type = 'expense'
     WHERE c.user_id = $1 OR c.is_system = TRUE
     GROUP BY c.id, c.name, c.icon, c.color, c.monthly_budget
     HAVING COALESCE(SUM(t.amount), 0) > 0
     ORDER BY total DESC`, [userId, startDate, endDate]);
    const dailyTotals = await (0, database_1.query)(`SELECT date, type, SUM(amount) as total FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3
     GROUP BY date, type ORDER BY date`, [userId, startDate, endDate]);
    const totals = await (0, database_1.query)(`SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3 GROUP BY type`, [userId, startDate, endDate]);
    const income = parseFloat(totals.find(t => t.type === 'income')?.total || '0');
    const expenses = parseFloat(totals.find(t => t.type === 'expense')?.total || '0');
    return { year, month, income, expenses, balance: income - expenses, by_category: byCategory, daily: dailyTotals };
}
async function getYearlyReport(userId, year) {
    const monthly = await (0, database_1.query)(`SELECT EXTRACT(MONTH FROM date) as month, type, COALESCE(SUM(amount), 0) as total
     FROM transactions WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2
     GROUP BY month, type ORDER BY month`, [userId, year]);
    return { year, months: monthly };
}
async function getCategoryReport(userId, categoryId) {
    const last6months = await (0, database_1.query)(`SELECT TO_CHAR(date, 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as total
     FROM transactions WHERE user_id = $1 AND category_id = $2 AND date >= CURRENT_DATE - 180
     GROUP BY month ORDER BY month`, [userId, categoryId]);
    const category = await (0, database_1.query)('SELECT * FROM categories WHERE id = $1', [categoryId]);
    return { category: category[0], history: last6months };
}
async function getTrends(userId) {
    const forecast = await aiService.forecastBalance(userId, 30);
    const tips = await aiService.generateSavingsTips(userId);
    return { forecast, tips };
}
//# sourceMappingURL=reports.service.js.map