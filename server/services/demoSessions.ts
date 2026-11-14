import type { Db } from '../db/pool';

export async function deleteExpiredDemoUsers(db: Db): Promise<number> {
  const result = await db.query(
    `DELETE FROM users
     WHERE is_demo = true
       AND demo_expires_at IS NOT NULL
       AND demo_expires_at <= now()`
  );
  return result.rowCount ?? 0;
}

export async function deleteDemoUser(db: Db, userId: string): Promise<boolean> {
  const result = await db.query(
    `DELETE FROM users WHERE id = $1 AND is_demo = true`
    , [userId]
  );
  return (result.rowCount ?? 0) > 0;
}
