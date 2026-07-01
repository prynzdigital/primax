import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db.js';
import { getSessionFromRequest } from './_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const session = getSessionFromRequest(req);
  if (!session) return res.status(401).json({ error: 'Not authenticated.' });

  // Re-check against the DB so a deleted admin loses access even with a valid cookie.
  const rows = await sql`SELECT id, email FROM admin_users WHERE id = ${session.sub} LIMIT 1`;
  const user = rows[0] as { id: string; email: string } | undefined;
  if (!user) return res.status(401).json({ error: 'Account no longer has admin access.' });

  return res.status(200).json(user);
}
