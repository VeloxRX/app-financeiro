import { createTransaction } from '../src/modules/transactions/transactions.service';
import { migrate } from '../src/config/migrate'; // ensure DB is loaded
import { pool } from '../src/config/database';

async function run() {
  try {
    const { rows } = await pool.query('SELECT id FROM users LIMIT 1');
    if (rows.length === 0) {
      console.log('No users found.');
      process.exit(1);
    }
    const userId = rows[0].id;
    console.log(`Seeding fixed transactions for user ${userId}...`);

    const expenses = [
      'Aluguel',
      'Energia',
      'Água',
      'Cartão Neon',
      'Cartão Nubank',
      'Cartão PicPay'
    ];

    const today = new Date().toISOString().split('T')[0];

    for (const desc of expenses) {
      console.log(`Creating: ${desc}`);
      await createTransaction(userId, {
        description: desc,
        amount: 0.01, // 0.00 might trigger validation errors depending on how Zod schema is set, using 0.01 to bypass
        date: today,
        type: 'expense',
        recurrence: 'monthly'
      });
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
