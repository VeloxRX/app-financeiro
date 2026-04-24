import { Pool } from 'pg';
export declare const pool: Pool;
/** Execute a single SQL query with parameters */
export declare function query<T = any>(text: string, params?: any[]): Promise<T[]>;
/** Execute multiple queries in a transaction */
export declare function transaction<T>(fn: (client: any) => Promise<T>): Promise<T>;
//# sourceMappingURL=database.d.ts.map