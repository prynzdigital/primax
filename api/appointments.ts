import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, updateRow } from './_db';
import { requireAdmin } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const date = req.query.date as string | undefined;

    if (date) {
      // Public availability check — minimal columns only, no PII.
      const rows = await sql`
        SELECT id, appointment_date, start_time, end_time, status, service_id
        FROM appointments
        WHERE appointment_date = ${date}
      `;
      return res.status(200).json(rows);
    }

    // Admin: full list with the related service and addon joined in.
    if (!requireAdmin(req, res)) return;
    const rows = await sql`
      SELECT a.*, row_to_json(s.*) AS service, row_to_json(ad.*) AS addon_service
      FROM appointments a
      LEFT JOIN services s ON s.id = a.service_id
      LEFT JOIN services ad ON ad.id = a.addon_service_id
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const {
      full_name,
      email,
      phone,
      service_id,
      appointment_date,
      start_time,
      end_time,
      notes,
      bedrooms,
      bathrooms,
      addon_service_id,
      total_price,
    } = req.body ?? {};
    if (
      !full_name || !email || !phone || !service_id || !appointment_date || !start_time || !end_time ||
      total_price === undefined || total_price === null
    ) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }
    const rows = await sql`
      INSERT INTO appointments (
        full_name, email, phone, service_id, appointment_date, start_time, end_time, status, notes,
        bedrooms, bathrooms, addon_service_id, total_price
      )
      VALUES (
        ${full_name}, ${email}, ${phone}, ${service_id}, ${appointment_date}, ${start_time}, ${end_time}, 'pending', ${notes ?? null},
        ${bedrooms ?? 1}, ${bathrooms ?? 1}, ${addon_service_id ?? null}, ${total_price}
      )
      RETURNING id
    `;
    return res.status(201).json(rows[0]);
  }

  if (req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;
    const id = req.query.id as string | undefined;
    if (!id) return res.status(400).json({ error: 'Missing id.' });
    const updated = await updateRow('appointments', id, req.body ?? {});
    if (!updated) return res.status(404).json({ error: 'Appointment not found.' });
    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
