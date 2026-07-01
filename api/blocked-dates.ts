import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { requireAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM blocked_dates ORDER BY blocked_date ASC`;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    const { blocked_date, reason } = req.body ?? {};
    if (!blocked_date) return res.status(400).json({ error: 'blocked_date is required.' });
    const rows = await sql`
      INSERT INTO blocked_dates (blocked_date, reason)
      VALUES (${blocked_date}, ${reason ?? null})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    const id = req.query.id as string | undefined;
    if (!id) return res.status(400).json({ error: 'Missing id.' });
    await sql`DELETE FROM blocked_dates WHERE id = ${id}`;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
