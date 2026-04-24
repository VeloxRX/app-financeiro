import { pool } from './database';
import { v4 as uuid } from 'uuid';

/**
 * Seed default system categories.
 */
async function seed(): Promise<void> {
  console.log('🌱 Seeding default categories...');

  const categories = [
    { name: 'Alimentação', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
    { name: 'Moradia', icon: '🏠', color: '#45B7D1' },
    { name: 'Saúde', icon: '💊', color: '#96CEB4' },
    { name: 'Educação', icon: '📚', color: '#FFEAA7' },
    { name: 'Lazer', icon: '🎮', color: '#DDA0DD' },
    { name: 'Vestuário', icon: '👕', color: '#98D8C8' },
    { name: 'Serviços', icon: '🔧', color: '#F7DC6F' },
    { name: 'Investimentos', icon: '📈', color: '#82E0AA' },
    { name: 'Salário', icon: '💰', color: '#85C1E9' },
    { name: 'Freelance', icon: '💻', color: '#BB8FCE' },
    { name: 'Assinaturas', icon: '📺', color: '#F1948A' },
    { name: 'Viagens', icon: '✈️', color: '#73C6B6' },
    { name: 'Pets', icon: '🐾', color: '#F0B27A' },
    { name: 'Outros', icon: '📦', color: '#AEB6BF' },
  ];

  for (const cat of categories) {
    const existing = await pool.query(
      'SELECT id FROM categories WHERE name = $1 AND is_system = TRUE AND user_id IS NULL',
      [cat.name]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO categories (id, user_id, name, icon, color, is_system) VALUES ($1, NULL, $2, $3, $4, TRUE)',
        [uuid(), cat.name, cat.icon, cat.color]
      );
      console.log(`  ✅ ${cat.icon} ${cat.name}`);
    } else {
      console.log(`  ⏭️  ${cat.icon} ${cat.name} (exists)`);
    }
  }

  console.log('✅ Seeding complete!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
