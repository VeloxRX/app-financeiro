import { query } from '../../config/database';

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

export async function listAlerts(userId: string, page: number, limit: number, unreadOnly: boolean) {
  const conditions = ['user_id = $1'];
  const params: any[] = [userId];

  if (unreadOnly) {
    conditions.push('is_read = FALSE');
  }

  const where = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM alerts WHERE ${where}`, params
  );

  const unreadCount = await query<{ count: string }>(
    'SELECT COUNT(*) as count FROM alerts WHERE user_id = $1 AND is_read = FALSE', [userId]
  );

  const rows = await query<AlertRow>(
    `SELECT * FROM alerts WHERE ${where} ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return {
    data: rows,
    total: parseInt(countResult[0].count),
    unread: parseInt(unreadCount[0].count),
    page,
    limit,
  };
}

export async function markAsRead(userId: string, alertId: string) {
  await query('UPDATE alerts SET is_read = TRUE WHERE id = $1 AND user_id = $2', [alertId, userId]);
}

export async function markAllAsRead(userId: string) {
  await query('UPDATE alerts SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE', [userId]);
}

export async function deleteAlert(userId: string, alertId: string) {
  await query('DELETE FROM alerts WHERE id = $1 AND user_id = $2', [alertId, userId]);
}
