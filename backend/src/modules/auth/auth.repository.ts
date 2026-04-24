import { query } from '../../config/database';
import { v4 as uuid } from 'uuid';

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

export async function create(input: CreateUserInput): Promise<UserRow> {
  const id = uuid();
  const rows = await query<UserRow>(
    `INSERT INTO users (id, name, email, password_hash, currency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, input.name, input.email, input.password_hash, input.currency]
  );
  return rows[0];
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const rows = await query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function findById(id: string): Promise<UserRow | null> {
  const rows = await query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function update(id: string, data: Record<string, any>): Promise<UserRow> {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && key !== 'password' && key !== 'email') {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const rows = await query<UserRow>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0];
}

export async function updateScore(userId: string, points: number): Promise<void> {
  await query(
    'UPDATE users SET gamification_score = gamification_score + $1 WHERE id = $2',
    [points, userId]
  );
}

export async function deleteUser(id: string): Promise<void> {
  await query('DELETE FROM users WHERE id = $1', [id]);
}
