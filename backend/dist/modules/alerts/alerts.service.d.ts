interface AlertRow {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    metadata: any;
    created_at: Date;
}
export declare function listAlerts(userId: string, page: number, limit: number, unreadOnly: boolean): Promise<{
    data: AlertRow[];
    total: number;
    unread: number;
    page: number;
    limit: number;
}>;
export declare function markAsRead(userId: string, alertId: string): Promise<void>;
export declare function markAllAsRead(userId: string): Promise<void>;
export declare function deleteAlert(userId: string, alertId: string): Promise<void>;
export {};
//# sourceMappingURL=alerts.service.d.ts.map