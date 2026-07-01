import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db.js';
import { requireAdmin } from './_auth.js';
import { sendSms } from './_sms.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;
    const rows = await sql`SELECT * FROM quote_requests ORDER BY created_at DESC`;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const { full_name, email, phone, zip_code, square_footage, bedrooms, bathrooms, notes } = req.body ?? {};
    if (!full_name || !email || !phone || !zip_code) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const rows = await sql`
      INSERT INTO quote_requests (full_name, email, phone, zip_code, square_footage, bedrooms, bathrooms, notes)
      VALUES (${full_name}, ${email}, ${phone}, ${zip_code}, ${square_footage ?? null}, ${bedrooms ?? null}, ${bathrooms ?? null}, ${notes ?? null})
      RETURNING id
    `;

    const [settings] = await sql`SELECT business_phone FROM business_settings LIMIT 1`;
    if (settings?.business_phone) {
      await sendSms(
        settings.business_phone,
        `Bespoke quote request: ${full_name} (${phone}) — ${bedrooms ?? '?'} bed / ${bathrooms ?? '?'} bath, zip ${zip_code}. Reply to follow up.`
      );
    }

    return res.status(201).json(rows[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
