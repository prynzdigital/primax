import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { requireAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM business_settings LIMIT 1`;
    return res.status(200).json(rows[0] ?? null);
  }

  if (req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;
    const {
      business_name,
      business_email,
      business_phone,
      business_address,
      slot_interval_minutes,
      booking_notice_hours,
    } = req.body ?? {};

    const existing = await sql`SELECT id FROM business_settings LIMIT 1`;
    let rows;
    if (existing[0]) {
      rows = await sql`
        UPDATE business_settings SET
          business_name = ${business_name},
          business_email = ${business_email},
          business_phone = ${business_phone},
          business_address = ${business_address},
          slot_interval_minutes = ${slot_interval_minutes},
          booking_notice_hours = ${booking_notice_hours}
        WHERE id = ${existing[0].id}
        RETURNING *
      `;
    } else {
      rows = await sql`
        INSERT INTO business_settings (business_name, business_email, business_phone, business_address, slot_interval_minutes, booking_notice_hours)
        VALUES (${business_name}, ${business_email}, ${business_phone}, ${business_address}, ${slot_interval_minutes}, ${booking_notice_hours})
        RETURNING *
      `;
    }
    return res.status(200).json(rows[0]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
