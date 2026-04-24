/**
 * Run all SQL migration files in order.
 * Creates a migrations tracking table to prevent re-running.
 */
declare function migrate(): Promise<void>;
export { migrate };
//# sourceMappingURL=migrate.d.ts.map