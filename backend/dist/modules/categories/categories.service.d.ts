export interface Category {
    id: string;
    user_id: string | null;
    name: string;
    icon: string | null;
    color: string | null;
    monthly_budget: number | null;
    is_system: boolean;
}
export declare function listCategories(userId: string): Promise<Category[]>;
export declare function createCategory(userId: string, data: Partial<Category>): Promise<Category>;
export declare function updateCategory(userId: string, id: string, data: Partial<Category>): Promise<Category | null>;
export declare function deleteCategory(userId: string, id: string): Promise<void>;
//# sourceMappingURL=categories.service.d.ts.map