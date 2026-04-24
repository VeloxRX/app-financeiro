export declare function getDashboardSummary(userId: string): Promise<{
    balance: number;
    monthly_income: number;
    monthly_expenses: number;
    savings_rate: number;
    top_categories: any[];
    alerts: any[];
    goal_progress: any[];
    trend: string;
    ai_insight: string;
    gamification: {
        score: number;
        level: string;
    };
}>;
export declare function getCashflow(userId: string, days: number): Promise<any[]>;
export declare function getMonthlyReport(userId: string, year: number, month: number): Promise<{
    year: number;
    month: number;
    income: number;
    expenses: number;
    balance: number;
    by_category: any[];
    daily: any[];
}>;
export declare function getYearlyReport(userId: string, year: number): Promise<{
    year: number;
    months: any[];
}>;
export declare function getCategoryReport(userId: string, categoryId: string): Promise<{
    category: any;
    history: any[];
}>;
export declare function getTrends(userId: string): Promise<{
    forecast: {
        date: string;
        predicted_balance: number;
        confidence: number;
    }[];
    tips: {
        category: string;
        current_avg: number;
        potential_saving: number;
        tip: string;
    }[];
}>;
//# sourceMappingURL=reports.service.d.ts.map