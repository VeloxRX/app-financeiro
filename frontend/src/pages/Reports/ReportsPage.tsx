import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import api from '@/services/api';

export default function ReportsPage() {
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    async function load() {
      try {
        const [monthly, yearly, trendsRes] = await Promise.all([
          api.get(`/reports/monthly/${currentYear}/${currentMonth}`),
          api.get(`/reports/yearly/${currentYear}`),
          api.get('/reports/trends'),
        ]);
        setMonthlyData(monthly.data);

        // Transform yearly data for chart
        const months: any[] = [];
        for (let m = 1; m <= 12; m++) {
          const inc = yearly.data.months.find((r: any) => Number(r.month) === m && r.type === 'income');
          const exp = yearly.data.months.find((r: any) => Number(r.month) === m && r.type === 'expense');
          months.push({ month: `${String(m).padStart(2, '0')}/${currentYear}`, income: parseFloat(inc?.total || '0'), expense: parseFloat(exp?.total || '0') });
        }
        setYearlyData(months);
        setTrends(trendsRes.data);
      } catch (err) {
        console.error('Reports error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-card animate-pulse border border-border" />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios</h1>

      {/* Monthly summary */}
      {monthlyData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-sm text-muted-foreground">Receitas do mês</p>
            <p className="text-2xl font-bold text-indigo-500 mt-1">{formatCurrency(monthlyData.income)}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-sm text-muted-foreground">Despesas do mês</p>
            <p className="text-2xl font-bold text-rose-500 mt-1">{formatCurrency(monthlyData.expenses)}</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-sm text-muted-foreground">Saldo do mês</p>
            <p className={`text-2xl font-bold mt-1 ${monthlyData.balance >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
              {formatCurrency(monthlyData.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Yearly bar chart */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="text-lg font-semibold mb-4">Visão Anual — {currentYear}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
              formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Receitas" />
            <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast */}
      {trends?.forecast?.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-lg font-semibold mb-4">Previsão de Saldo — Próximos 6 meses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trends.forecast}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="predicted_balance" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Saldo Previsto" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Savings tips */}
      {trends?.tips?.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-lg font-semibold mb-4">💡 Dicas de Economia</h3>
          <div className="space-y-3">
            {trends.tips.map((tip: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{tip.category}</h4>
                  <span className="text-sm text-indigo-500 font-medium">Potencial: {formatCurrency(tip.potential_saving)}/mês</span>
                </div>
                <p className="text-sm text-muted-foreground">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {monthlyData?.by_category?.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
          <div className="space-y-3">
            {monthlyData.by_category.map((cat: any) => {
              const pct = cat.monthly_budget ? (parseFloat(cat.total) / cat.monthly_budget) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{cat.icon} {cat.name} ({cat.count}x)</span>
                    <span className="font-medium">{formatCurrency(parseFloat(cat.total))}</span>
                  </div>
                  {cat.monthly_budget && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${pct > 100 ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
