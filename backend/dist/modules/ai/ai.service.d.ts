/**
 * 1. Auto-categorize transaction based on description keywords.
 * Matches against user history first, then falls back to keyword classifier.
 */
export declare function autoCategorizeTransaction(description: string, amount: number, userId: string): Promise<{
    category_id: string | null;
    confidence_score: number;
}>;
/**
 * 2. Detect anomalous spending by comparing with 90-day historical average.
 */
export declare function detectAnomalousSpending(transaction: {
    amount: number;
    category_id: string;
    type: string;
}, userId: string): Promise<{
    is_anomalous: boolean;
    avg_historical: number;
    deviation_percent: number;
}>;
/**
 * 3. Generate monthly insight — analyzes spending and returns markdown text.
 */
export declare function generateMonthlyInsight(userId: string, month: number, year: number): Promise<string>;
/**
 * 4. Forecast future balance using weighted moving average.
 */
export declare function forecastBalance(userId: string, daysAhead: number): Promise<Array<{
    date: string;
    predicted_balance: number;
    confidence: number;
}>>;
/**
 * 5. Generate savings tips based on spending patterns.
 */
export declare function generateSavingsTips(userId: string): Promise<Array<{
    category: string;
    current_avg: number;
    potential_saving: number;
    tip: string;
}>>;
//# sourceMappingURL=ai.service.d.ts.map