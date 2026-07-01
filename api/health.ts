import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    await sql`SELECT 1`;
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(503).json({ ok: false });
  }
}
