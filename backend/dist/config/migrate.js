"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./database");
/**
 * Run all SQL migration files in order.
 * Creates a migrations tracking table to prevent re-running.
 */
async function migrate() {
    console.log('🔄 Running migrations...');
    // Create migrations tracking table
    await database_1.pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);
    const migrationsDir = path_1.default.join(__dirname, '..', '..', 'migrations');
    const files = fs_1.default.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
        // Check if already executed
        const { rows } = await database_1.pool.query('SELECT id FROM _migrations WHERE filename = $1', [file]);
        if (rows.length > 0) {
            console.log(`  ⏭️  ${file} (already applied)`);
            continue;
        }
        const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), 'utf-8');
        try {
            await database_1.pool.query(sql);
            await database_1.pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
            console.log(`  ✅ ${file}`);
        }
        catch (error) {
            console.error(`  ❌ ${file}: ${error.message}`);
            throw error;
        }
    }
    console.log('✅ Migrations complete!');
}
// Run if called directly
migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
//# sourceMappingURL=migrate.js.map