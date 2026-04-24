import { query } from '../../config/database';
import { getOrSet } from '../../config/redis';
import * as aiService from '../ai/ai.service';

export async function getDashboardSummary(userId: string) {
  return getOrSet(`dashboard:${userId}:summary`, 300, async () => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Monthly totals
    const totals = await query<{ type: string; total: string }>(
      `SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions
       WHERE user_id = $1 AND date >= $2 GROUP BY type`,
      [userId, monthStart]
    );

    const income = parseFloat(totals.find(t => t.type === 'income')?.total || '0');
    const expenses = parseFloat(totals.find(t => t.type === 'expense')?.total || '0');
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    // Top categories
    const topCategories = await query(
      `SELECT c.name, c.icon, c.color, COALESCE(SUM(t.amount), 0) as total
       FROM transactions t JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 AND t.type = 'expense' AND t.date >= $2
       GROUP BY c.id, c.name, c.icon, c.color ORDER BY total DESC LIMIT 5`,
      [userId, monthStart]
    );

    // Recent transactions
    const recentTransactions = await query(
      `SELECT t.*, c.icon as category_icon, c.color as category_color 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id 
       WHERE t.user_id = $1 AND t.date >= $2
       ORDER BY t.date DESC, t.created_at DESC`,
      [userId, monthStart]
    );

    // Active alerts
    const alerts = await query(
      'SELECT * FROM alerts WHERE user_id = $1 AND is_read = FALSE ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    // Goal progress
    const goals = await query(
      `SELECT id, title, target_amount, current_amount, icon, color,
         CASE WHEN target_amount > 0 THEN ROUND((current_amount/target_amount*100)::numeric,1) ELSE 0 END as progress
       FROM goals WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC`,
      [userId]
    );

    // Trend (compare with last month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthExpenses = await query<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
       WHERE user_id = $1 AND type = 'expense' AND date >= $2 AND date <= $3`,
      [userId, lastMonthStart.toISOString().split('T')[0], lastMonthEnd.toISOString().split('T')[0]]
    );
    const lastExp = parseFloat(lastMonthExpenses[0]?.total || '0');
    const trend = expenses < lastExp ? 'positive' : expenses > lastExp ? 'negative' : 'neutral';

    // AI Insight
    const aiInsight = await aiService.generateMonthlyInsight(userId, now.getMonth() + 1, now.getFullYear());

    // Gamification
    const user = await query<{ gamification_score: number }>(
      'SELECT gamification_score FROM users WHERE id = $1', [userId]
    );
    const score = user[0]?.gamification_score || 0;
    const level = score < 200 ? 'Iniciante Financeiro' : score < 500 ? 'Poupador' :
                  score < 1000 ? 'Gestor Financeiro' : score < 2500 ? 'Especialista' : 'Mestre das Finanças';

    return {
      balance,
      monthly_income: income,
      monthly_expenses: expenses,
      savings_rate: Math.round(savingsRate * 10) / 10,
      top_categories: topCategories,
      recent_transactions: recentTransactions,
      alerts,
      goal_progress: goals,
      trend,
      ai_insight: aiInsight,
      gamification: { score, level },
    };
  });
}

export async function getCashflow(userId: string) {
  const rows = await query(
    `SELECT TO_CHAR(DATE_TRUNC('month', date), 'MM/YYYY') as date,
       COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
       COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
     FROM transactions
     WHERE user_id = $1 AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
     GROUP BY DATE_TRUNC('month', date)
     ORDER BY DATE_TRUNC('month', date)`,
    [userId]
  );
  return rows;
}

export async function getMonthlyReport(userId: string, year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const byCategory = await query(
    `SELECT c.name, c.icon, c.color, c.monthly_budget,
       COALESCE(SUM(t.amount), 0) as total, COUNT(t.id) as count
     FROM categories c LEFT JOIN transactions t
       ON c.id = t.category_id AND t.user_id = $1 AND t.date >= $2 AND t.date <= $3 AND t.type = 'expense'
     WHERE c.user_id = $1 OR c.is_system = TRUE
     GROUP BY c.id, c.name, c.icon, c.color, c.monthly_budget
     HAVING COALESCE(SUM(t.amount), 0) > 0
     ORDER BY total DESC`,
    [userId, startDate, endDate]
  );

  const dailyTotals = await query(
    `SELECT date, type, SUM(amount) as total FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3
     GROUP BY date, type ORDER BY date`,
    [userId, startDate, endDate]
  );

  const totals = await query<{ type: string; total: string }>(
    `SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = $1 AND date >= $2 AND date <= $3 GROUP BY type`,
    [userId, startDate, endDate]
  );

  const income = parseFloat(totals.find(t => t.type === 'income')?.total || '0');
  const expenses = parseFloat(totals.find(t => t.type === 'expense')?.total || '0');

  return { year, month, income, expenses, balance: income - expenses, by_category: byCategory, daily: dailyTotals };
}

export async function getYearlyReport(userId: string, year: number) {
  const monthly = await query(
    `SELECT EXTRACT(MONTH FROM date) as month, type, COALESCE(SUM(amount), 0) as total
     FROM transactions WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2
     GROUP BY month, type ORDER BY month`,
    [userId, year]
  );

  return { year, months: monthly };
}

export async function getCategoryReport(userId: string, categoryId: string) {
  const last6months = await query(
    `SELECT TO_CHAR(date, 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as total
     FROM transactions WHERE user_id = $1 AND category_id = $2 AND date >= CURRENT_DATE - 180
     GROUP BY month ORDER BY month`,
    [userId, categoryId]
  );

  const category = await query('SELECT * FROM categories WHERE id = $1', [categoryId]);

  return { category: category[0], history: last6months };
}

export async function getTrends(userId: string) {
  const forecast = await aiService.forecastBalance(userId, 6);
  const tips = await aiService.generateSavingsTips(userId);
  return { forecast, tips };
}
