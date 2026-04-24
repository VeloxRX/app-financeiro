import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Wallet, ArrowUpRight, ArrowDownRight,
  PiggyBank, Trophy, Target
} from 'lucide-react';
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils';
import api from '@/services/api';

interface DashboardData {
  balance: number;
  monthly_income: number;
  monthly_expenses: number;
  savings_rate: number;
  top_categories: Array<{ name: string; icon: string; color: string; total: number }>;
  recent_transactions: Array<{ id: string; description: string; amount: number; date: string; type: string; category_icon: string; category_color: string }>;
  alerts: Array<{ id: string; type: string; title: string; message: string; created_at: string }>;
  goal_progress: Array<{ id: string; title: string; target_amount: number; current_amount: number; icon: string; color: string; progress: number }>;
  trend: string;
  ai_insight: string;
  gamification: { score: number; level: string };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6'];

export default function DashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, cashflowRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/cashflow'),
        ]);
        setData(summaryRes.data);
        setCashflow(cashflowRes.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-card animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (!data) return <div className="text-center text-muted-foreground py-20">Erro ao carregar dashboard</div>;

  const gamificationProgress = (() => {
    const thresholds = [0, 200, 500, 1000, 2500, 5000];
    const score = data.gamification.score;
    const currentIdx = thresholds.findIndex((t, i) => score < (thresholds[i + 1] ?? Infinity));
    const min = thresholds[currentIdx] ?? 0;
    const max = thresholds[currentIdx + 1] ?? 5000;
    return ((score - min) / (max - min)) * 100;
  })();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.balance')}</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(data.balance)}</p>
            </div>
            <div className={`p-3 rounded-xl ${data.balance >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              <Wallet className={`h-6 w-6 ${data.balance >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.income')}</p>
              <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(data.monthly_income)}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10">
              <ArrowUpRight className="h-6 w-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.expenses')}</p>
              <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(data.monthly_expenses)}</p>
            </div>
            <div className="p-3 rounded-xl bg-destructive/10">
              <ArrowDownRight className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.savings')}</p>
              <p className="text-2xl font-bold mt-1 text-sky-500">{formatPercent(data.savings_rate)}</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10">
              <PiggyBank className="h-6 w-6 text-sky-500" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl bg-card border border-border p-5">
          <h3 className="text-lg font-semibold mb-4">Fluxo Mensal (Últimos 6 Meses)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={cashflow}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" fill="url(#incomeGrad)" strokeWidth={2} name="Receitas" />
              <Area type="monotone" dataKey="expense" stroke="hsl(var(--destructive))" fill="url(#expenseGrad)" strokeWidth={2} name="Despesas" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-lg font-semibold mb-4">Transações do Mês</h3>
          {data.recent_transactions && data.recent_transactions.length > 0 ? (
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {data.recent_transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-card shadow-sm border border-border">
                      {tx.category_icon || '📦'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                    </div>
                  </div>
                  <span className={`font-medium ${tx.type === 'expense' ? 'text-destructive' : 'text-primary'}`}>
                    {tx.type === 'expense' ? '-' : '+'}{formatCurrency(parseFloat(String(tx.amount)))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Nenhuma transação recente</div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{t('dashboard.goals')}</h3>
          </div>
          {data.goal_progress.length > 0 ? (
            <div className="space-y-4">
              {data.goal_progress.slice(0, 4).map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{goal.icon} {goal.title}</span>
                    <span className="text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma meta ativa</p>
          )}
        </motion.div>

        {/* Gamification */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">{t('dashboard.level')}</h3>
          </div>
          <div className="text-center py-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">{data.gamification.score} XP</div>
            <p className="text-sm text-muted-foreground mt-2">{data.gamification.level}</p>
            <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                style={{ width: `${gamificationProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Progresso para o próximo nível</p>
          </div>
        </motion.div>
      </div>

      {/* Alerts Feed */}
      {data.alerts.length > 0 && (
        <motion.div variants={itemVariants} className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-lg font-semibold mb-4">Alertas Recentes</h3>
          <div className="space-y-3">
            {data.alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
