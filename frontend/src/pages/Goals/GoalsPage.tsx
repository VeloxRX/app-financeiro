import { useEffect, useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { formatCurrency, cn } from '@/lib/utils';
import { Plus, Target, Trash2, X, DollarSign } from 'lucide-react';

export default function GoalsPage() {
  const { t } = useTranslation();
  const { goals, loading, fetchGoals, createGoal, depositToGoal, deleteGoal } = useGoals();
  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [form, setForm] = useState({ title: '', target_amount: '', deadline: '', icon: '🎯', color: '#10b981' });

  useEffect(() => { fetchGoals(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createGoal({ ...form, target_amount: parseFloat(form.target_amount) } as any);
    setShowCreate(false);
    setForm({ title: '', target_amount: '', deadline: '', icon: '🎯', color: '#10b981' });
  }

  async function handleDeposit(goalId: string) {
    if (!depositAmount) return;
    await depositToGoal(goalId, parseFloat(depositAmount));
    setShowDeposit(null);
    setDepositAmount('');
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('goals.title')}</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
          <Plus className="h-4 w-4" /> {t('goals.new')}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-card animate-pulse border border-border" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20">
          <Target className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma meta criada ainda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-card border border-border p-5 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${goal.color}20` }}>
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{goal.title}</h3>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full',
                        goal.status === 'active' ? 'bg-indigo-500/10 text-indigo-500' :
                          goal.status === 'completed' ? 'bg-sky-500/10 text-sky-500' : 'bg-muted text-muted-foreground')}>
                        {goal.status === 'active' ? 'Ativa' : goal.status === 'completed' ? 'Concluída' : goal.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setShowDeposit(goal.id); setDepositAmount(''); }}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                      <DollarSign className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{formatCurrency(goal.current_amount)}</span>
                    <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                    {goal.deadline && <span className="text-xs text-muted-foreground">Prazo: {new Intl.DateTimeFormat('pt-BR').format(new Date(goal.deadline))}</span>}
                  </div>
                </div>

                {/* Inline deposit */}
                {showDeposit === goal.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Valor"
                      className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring outline-none" min="0.01" step="0.01" />
                    <button onClick={() => handleDeposit(goal.id)}
                      className="px-4 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Depositar</button>
                    <button onClick={() => setShowDeposit(null)}
                      className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent"><X className="h-4 w-4" /></button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 m-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{t('goals.new')}</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nome da meta" required
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" />
              <input type="number" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} placeholder="Valor alvo (R$)" required
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" min="1" step="0.01" />
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Ícone"
                  className="h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" />
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-11 w-full rounded-xl border border-input bg-background cursor-pointer" />
              </div>
              <button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                Criar Meta
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
