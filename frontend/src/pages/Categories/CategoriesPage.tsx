import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, cn } from '@/lib/utils';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import api from '@/services/api';

interface Category {
  id: string; name: string; icon: string; color: string; monthly_budget: number | null; is_system: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '📦', color: '#10b981', monthly_budget: '' as string | number });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, monthly_budget: form.monthly_budget ? parseFloat(String(form.monthly_budget)) : null };
    if (editingId) {
      await api.put(`/categories/${editingId}`, payload);
    } else {
      await api.post('/categories', payload);
    }
    handleCloseModal();
    load();
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', icon: '📦', color: '#10b981', monthly_budget: '' });
  }

  function handleEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      icon: cat.icon || '📦',
      color: cat.color || '#10b981',
      monthly_budget: cat.monthly_budget || ''
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir categoria?')) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <button onClick={() => { setEditingId(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
          <Plus className="h-4 w-4" /> Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-card animate-pulse border border-border" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="group rounded-2xl bg-card border border-border p-4 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${cat.color}20` }}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{cat.name}</h3>
                    {cat.monthly_budget && (
                      <p className="text-xs text-muted-foreground">Orçamento: {formatCurrency(cat.monthly_budget)}</p>
                    )}
                  </div>
                </div>
                {!cat.is_system && (
                  <div className="flex items-center">
                    <button onClick={() => handleEdit(cat)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {cat.is_system && <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Sistema</span>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl bg-card border border-border p-6 m-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={handleCloseModal} className="p-1 rounded-lg hover:bg-accent"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" required
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Ícone (emoji)"
                  className="h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" />
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="h-11 w-full rounded-xl border border-input bg-background cursor-pointer" />
              </div>
              <input type="number" value={form.monthly_budget} onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })} placeholder="Orçamento mensal (opcional)"
                className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" min="0" step="0.01" />
              <button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                {editingId ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
