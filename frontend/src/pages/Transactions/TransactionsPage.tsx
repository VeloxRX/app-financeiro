import { useEffect, useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Plus, Search, ArrowUpRight, ArrowDownRight, Trash2, Edit2, X } from 'lucide-react';
import api from '@/services/api';

export default function TransactionsPage() {
  const { t } = useTranslation();
  const { transactions, pagination, loading, fetchTransactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<{type: string; amount: string; description: string; category_id: string; date: string; recurrence: string}>({ type: 'expense', amount: '', description: '', category_id: '', date: new Date().toISOString().split('T')[0], recurrence: 'none' });

  useEffect(() => { fetchTransactions(); loadCategories(); }, []);

  async function loadCategories() {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch {}
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions({ search, type: typeFilter });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await updateTransaction(editingId, { ...form, amount: parseFloat(form.amount) } as any);
    } else {
      await createTransaction({ ...form, amount: parseFloat(form.amount) } as any);
    }
    handleCloseModal();
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingId(null);
    setForm({ type: 'expense', amount: '', description: '', category_id: '', date: new Date().toISOString().split('T')[0], recurrence: 'none' });
  }

  function handleEdit(tx: any) {
    setEditingId(tx.id);
    setForm({
      type: tx.type,
      amount: String(tx.amount),
      description: tx.description,
      category_id: tx.category_id || '',
      date: tx.date.split('T')[0],
      recurrence: tx.recurrence || 'none'
    });
    setShowModal(true);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('transactions.title')}</h1>
        <button onClick={() => { setEditingId(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
          <Plus className="h-4 w-4" /> {t('transactions.new')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar transação..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none transition-all" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none">
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
          <option value="transfer">Transferências</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">{t('common.loading')}</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">{t('common.noData')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Descrição</th>
                  <th className="text-left p-4 font-medium">Categoria</th>
                  <th className="text-right p-4 font-medium">Valor</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-muted-foreground">{formatDate(tx.date)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-rose-500" />
                        )}
                        {tx.description || '—'}
                      </div>
                    </td>
                    <td className="p-4">
                      {tx.category_icon && <span className="mr-1">{tx.category_icon}</span>}
                      <span className="text-muted-foreground">{tx.category_name || '—'}</span>
                    </td>
                    <td className={cn('p-4 text-right font-medium', tx.type === 'income' ? 'text-indigo-500' : 'text-rose-500')}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEdit(tx)} className="p-1.5 mr-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteTransaction(tx.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => fetchTransactions({ page: i + 1, search, type: typeFilter })}
              className={cn('h-9 w-9 rounded-lg text-sm font-medium transition-colors',
                pagination.page === i + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl bg-card border border-border p-6 m-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editingId ? t('common.edit') : t('transactions.new')}</h2>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['expense', 'income', 'transfer'] as const).map((type) => (
                  <button key={type} type="button" onClick={() => setForm({ ...form, type })}
                    className={cn('p-2.5 rounded-xl text-sm font-medium transition-all border',
                      form.type === type ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent')}>
                    {t(`transactions.${type}`)}
                  </button>
                ))}
              </div>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" required />
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Valor"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" required min="0.01" step="0.01" />
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none">
                <option value="">Categoria (auto-detectar)</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <div className="flex items-center gap-2 px-1">
                <input 
                  type="checkbox" 
                  id="recurrence"
                  checked={form.recurrence === 'monthly'} 
                  onChange={(e) => setForm({ ...form, recurrence: e.target.checked ? 'monthly' : 'none' })}
                  className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" 
                />
                <label htmlFor="recurrence" className="text-sm font-medium text-muted-foreground cursor-pointer">
                  Despesa Fixa (repetir todo mês)
                </label>
              </div>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" required />
              <button type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                {t('common.save')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
