import { useState, useCallback } from 'react';
import api from '@/services/api';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  auto_save_amount: number | null;
  color: string;
  icon: string;
  status: string;
  progress_pct?: number;
  created_at: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Goal[]>('/goals');
      setGoals(data);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createGoal = useCallback(async (input: Partial<Goal>) => {
    const { data } = await api.post('/goals', input);
    await fetchGoals();
    return data;
  }, [fetchGoals]);

  const depositToGoal = useCallback(async (goalId: string, amount: number) => {
    const { data } = await api.post(`/goals/${goalId}/deposit`, { amount });
    await fetchGoals();
    return data;
  }, [fetchGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    await api.delete(`/goals/${id}`);
    await fetchGoals();
  }, [fetchGoals]);

  return { goals, loading, fetchGoals, createGoal, depositToGoal, deleteGoal };
}
