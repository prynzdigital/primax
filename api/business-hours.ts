import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db.js';
import { requireAdmin } from './_auth.js';

interface HoursRow {
  weekday: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM business_hours ORDER BY weekday ASC`;
    return res.status(200).json(rows);
  }

  if (req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;
    const input = (req.body ?? {}).rows as HoursRow[] | undefined;
    if (!Array.isArray(input)) return res.status(400).json({ error: 'Expected a "rows" array.' });

    const results = [];
    for (const r of input) {
      const upserted = await sql`
        INSERT INTO business_hours (weekday, is_open, start_time, end_time)
        VALUES (${r.weekday}, ${r.is_open}, ${r.start_time}, ${r.end_time})
        ON CONFLICT (weekday) DO UPDATE SET
          is_open = EXCLUDED.is_open,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time
        RETURNING *
      `;
      results.push(upserted[0]);
    }
    results.sort((a, b) => a.weekday - b.weekday);
    return res.status(200).json(results);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
