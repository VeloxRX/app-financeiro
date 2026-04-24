interface GoalInput {
    title: string;
    description?: string;
    target_amount: number;
    deadline?: string;
    category?: string;
    auto_save_amount?: number;
    color?: string;
    icon?: string;
}
interface GoalRow {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    category: string;
    auto_save_amount: number | null;
    color: string | null;
    icon: string | null;
    status: string;
    created_at: Date;
    progress_pct?: number;
}
export declare function listGoals(userId: string): Promise<GoalRow[]>;
export declare function createGoal(userId: string, input: GoalInput): Promise<GoalRow>;
export declare function updateGoal(userId: string, id: string, input: Partial<GoalInput & {
    status: string;
}>): Promise<GoalRow | null>;
export declare function deleteGoal(userId: string, id: string): Promise<void>;
export declare function depositToGoal(userId: string, goalId: string, amount: number): Promise<GoalRow | null>;
export {};
//# sourceMappingURL=goals.service.d.ts.map