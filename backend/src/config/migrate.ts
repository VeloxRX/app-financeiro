import fs from 'fs';
import path from 'path';
import { pool } from './database';

/**
 * Run all SQL migration files in order.
 * Creates a migrations tracking table to prevent re-running.
 */
async function migrate(): Promise<void> {
  console.log('🔄 Running migrations...');

  // Create migrations tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    // Check if already executed
    const { rows } = await pool.query('SELECT id FROM _migrations WHERE filename = $1', [file]);
    if (rows.length > 0) {
      console.log(`  ⏭️  ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      console.log(`  ✅ ${file}`);
    } catch (error: any) {
      console.error(`  ❌ ${file}: ${error.message}`);
      throw error;
    }
  }

  console.log('✅ Migrations complete!');
}

// Run if called directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migrate };
