import { useState } from 'react';
import { useAuthStore, useUIStore } from '@/store';
import { motion } from 'framer-motion';
import { Moon, Sun, Download, Trash2, User, Shield } from 'lucide-react';
import api from '@/services/api';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [name, setName] = useState(user?.name || '');
  const [income, setIncome] = useState(String(user?.monthly_income || ''));
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        monthly_income: income ? parseFloat(income) : undefined,
      });
      setUser(data);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleExport(format: string) {
    setExporting(true);
    try {
      const response = await api.get(`/transactions/export?format=${format}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `finai-transacoes.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {/* Profile */}
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Perfil</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-11 mt-1 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">E-mail</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full h-11 mt-1 rounded-xl border border-input bg-muted px-4 text-sm text-muted-foreground cursor-not-allowed" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Renda Mensal</label>
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="R$ 0,00"
              className="w-full h-11 mt-1 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-ring outline-none" min="0" step="0.01" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
          <h2 className="text-lg font-semibold">Aparência</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
            <p className="text-sm text-muted-foreground">Alterar entre modo claro e escuro</p>
          </div>
          <button onClick={toggleTheme}
            className="relative h-7 w-14 rounded-full bg-muted transition-colors"
            role="switch" aria-checked={theme === 'dark'}>
            <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-primary transition-all ${theme === 'dark' ? 'left-7' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Exportar Dados</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Exporte suas transações nos formatos disponíveis</p>
        <div className="flex gap-2 flex-wrap">
          {['csv', 'json'].map((fmt) => (
            <button key={fmt} onClick={() => handleExport(fmt)} disabled={exporting}
              className="px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-colors disabled:opacity-50 uppercase">
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-destructive" />
          <h2 className="text-lg font-semibold text-destructive">Zona de Perigo</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Ações irreversíveis na sua conta</p>
        <button onClick={() => { if (confirm('Tem certeza? Todos os dados serão perdidos.')) logout(); }}
          className="px-4 py-2 rounded-xl border border-destructive text-destructive text-sm font-medium hover:bg-destructive hover:text-white transition-colors">
          <Trash2 className="inline h-4 w-4 mr-1" /> Excluir Conta
        </button>
      </div>
    </motion.div>
  );
}
