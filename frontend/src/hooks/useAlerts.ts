import { useState, useCallback, useEffect } from 'react';
import api from '@/services/api';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store';

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  const fetchAlerts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/alerts?page=${page}&limit=20`);
      setAlerts(data.data);
      setUnreadCount(data.unread);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await api.put(`/alerts/${id}/read`);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await api.put('/alerts/read-all');
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    setUnreadCount(0);
  }, []);

  // WebSocket for real-time alerts
  useEffect(() => {
    if (!accessToken) return;

    const socket: Socket = io({ auth: { token: accessToken } });

    socket.on('alert', (alert: Alert) => {
      setAlerts((prev) => [alert, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  return { alerts, unreadCount, loading, fetchAlerts, markAsRead, markAllAsRead };
}
