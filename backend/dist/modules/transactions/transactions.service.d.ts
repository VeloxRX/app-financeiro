interface TransactionInput {
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description?: string;
    category_id?: string;
    date: string;
    recurrence?: string;
    tags?: string[];
    notes?: string;
}
interface TransactionRow {
    id: string;
    user_id: string;
    type: string;
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
    created_at: Date;
}
interface ListFilters {
    type?: string;
    category_id?: string;
    from?: string;
    to?: string;
    search?: string;
    page: number;
    limit: number;
}
export declare function listTransactions(userId: string, filters: ListFilters): Promise<{
    data: TransactionRow[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}>;
export declare function createTransaction(userId: string, input: TransactionInput): Promise<TransactionRow>;
export declare function updateTransaction(userId: string, id: string, input: Partial<TransactionInput>): Promise<TransactionRow | null>;
export declare function deleteTransaction(userId: string, id: string): Promise<void>;
export declare function exportTransactions(userId: string, opts: {
    format: string;
    from?: string;
    to?: string;
    categories?: string;
}): Promise<string>;
export {};
//# sourceMappingURL=transactions.service.d.ts.map