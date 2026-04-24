import { useEffect } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/services/api';

const alertIcons: Record<string, string> = {
  BUDGET_WARNING: '⚠️',
  BUDGET_EXCEEDED: '🚫',
  GOAL_AT_RISK: '📉',
  GOAL_MILESTONE: '🎉',
  UNUSUAL_SPENDING: '🔍',
  RECURRING_DUE: '🔔',
  MONTHLY_SUMMARY: '📊',
  AI_RECOMMENDATION: '🤖',
};

export default function AlertsPage() {
  const { alerts, unreadCount, loading, fetchAlerts, markAsRead, markAllAsRead } = useAlerts();

  useEffect(() => { fetchAlerts(); }, []);

  async function handleDelete(id: string) {
    await api.delete(`/alerts/${id}`);
    fetchAlerts();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alertas</h1>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} não lido(s)</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-accent text-sm font-medium transition-colors">
            <CheckCheck className="h-4 w-4" /> Marcar todos como lidos
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-card animate-pulse border border-border" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum alerta</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <motion.div key={alert.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className={cn('rounded-2xl border p-4 hover:shadow-md transition-all group',
                alert.is_read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20')}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5 flex-shrink-0">{alertIcons[alert.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{alert.title}</h3>
                    {!alert.is_read && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(alert.created_at))}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!alert.is_read && (
                    <button onClick={() => markAsRead(alert.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Marcar como lido">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(alert.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
