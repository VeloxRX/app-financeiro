interface CreateUserInput {
    name: string;
    email: string;
    password_hash: string;
    currency: string;
}
interface UserRow {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    currency: string;
    monthly_income: number | null;
    avatar_url: string | null;
    gamification_score: number;
    created_at: Date;
    updated_at: Date;
}
export declare function create(input: CreateUserInput): Promise<UserRow>;
export declare function findByEmail(email: string): Promise<UserRow | null>;
export declare function findById(id: string): Promise<UserRow | null>;
export declare function update(id: string, data: Record<string, any>): Promise<UserRow>;
export declare function updateScore(userId: string, points: number): Promise<void>;
export declare function deleteUser(id: string): Promise<void>;
export {};
//# sourceMappingURL=auth.repository.d.ts.map