import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from './_db';
import { signSession, setSessionCookie } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const rows = await sql`
    SELECT id, email, password_hash FROM admin_users WHERE email = ${String(email).toLowerCase().trim()} LIMIT 1
  `;
  const user = rows[0] as { id: string; email: string; password_hash: string } | undefined;
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = signSession({ sub: user.id, email: user.email });
  setSessionCookie(res, token);
  return res.status(200).json({ id: user.id, email: user.email });
}
