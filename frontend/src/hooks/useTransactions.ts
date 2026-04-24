import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category_id: string;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  date: string;
  recurrence: string;
  tags: string[];
  notes: string;
  created_at: string;
}

interface TransactionsResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface Filters {
  type?: string;
  category_id?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (filters: Filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.category_id) params.set('category_id', filters.category_id);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.search) params.set('search', filters.search);
      if (filters.page) params.set('page', String(filters.page));

      const { data } = await api.get<TransactionsResponse>(`/transactions?${params}`);
      setTransactions(data.data);
      setPagination({ total: data.total, page: data.page, pages: data.pages });
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (input: Partial<Transaction>) => {
    const { data } = await api.post('/transactions', input);
    await fetchTransactions();
    return data;
  }, [fetchTransactions]);

  const updateTransaction = useCallback(async (id: string, input: Partial<Transaction>) => {
    const { data } = await api.put(`/transactions/${id}`, input);
    await fetchTransactions();
    return data;
  }, [fetchTransactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    await api.delete(`/transactions/${id}`);
    await fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, pagination, loading, fetchTransactions, createTransaction, updateTransaction, deleteTransaction };
}
