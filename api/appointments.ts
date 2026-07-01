import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, updateRow } from './_db.js';
import { requireAdmin } from './_auth.js';
import { sendSms } from './_sms.js';

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

    // Admin: full list with the related service and selected add-ons joined in.
    if (!requireAdmin(req, res)) return;
    const rows = await sql`
      SELECT a.*, row_to_json(s.*) AS service,
        COALESCE(
          (
            SELECT json_agg(ad.* ORDER BY ad.name)
            FROM appointment_addons aa
            JOIN addons ad ON ad.id = aa.addon_id
            WHERE aa.appointment_id = a.id
          ),
          '[]'
        ) AS addons
      FROM appointments a
      LEFT JOIN services s ON s.id = a.service_id
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    const {
      full_name,
      email,
      phone,
      address,
      city,
      zip_code,
      service_id,
      appointment_date,
      start_time,
      end_time,
      notes,
      bedrooms,
      bathrooms,
      addon_ids,
      total_price,
    } = req.body ?? {};
    if (
      !full_name || !email || !phone || !address || !city || !zip_code ||
      !service_id || !appointment_date || !start_time || !end_time ||
      total_price === undefined || total_price === null
    ) {
      return res.status(400).json({ error: 'Missing required booking fields.' });
    }
    const rows = await sql`
      INSERT INTO appointments (
        full_name, email, phone, address, city, zip_code, service_id, appointment_date, start_time, end_time, status, notes,
        bedrooms, bathrooms, total_price
      )
      VALUES (
        ${full_name}, ${email}, ${phone}, ${address}, ${city}, ${zip_code}, ${service_id}, ${appointment_date}, ${start_time}, ${end_time}, 'pending', ${notes ?? null},
        ${bedrooms ?? 1}, ${bathrooms ?? 1}, ${total_price}
      )
      RETURNING id
    `;
    const appointmentId = rows[0].id as string;

    for (const addonId of (addon_ids as string[] | undefined) ?? []) {
      await sql`
        INSERT INTO appointment_addons (appointment_id, addon_id)
        VALUES (${appointmentId}, ${addonId})
      `;
    }

    // Notify customer + admin — never blocks or fails the booking itself.
    const [service] = await sql`SELECT name FROM services WHERE id = ${service_id}`;
    const [settings] = await sql`SELECT business_name, business_phone FROM business_settings LIMIT 1`;
    const serviceName = service?.name ?? 'your cleaning';
    const businessName = settings?.business_name ?? 'Primax Group';
    await sendSms(
      phone,
      `Hi ${full_name}, your ${serviceName} with ${businessName} is booked for ${appointment_date} at ${start_time.slice(0, 5)}. See you then!`
    );
    if (settings?.business_phone) {
      await sendSms(
        settings.business_phone,
        `New booking: ${full_name} — ${serviceName} on ${appointment_date} at ${start_time.slice(0, 5)}. $${total_price}.`
      );
    }

    return res.status(201).json({ id: appointmentId });
  }

  if (req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;
    const id = req.query.id as string | undefined;
    if (!id) return res.status(400).json({ error: 'Missing id.' });
    const body = req.body ?? {};
    const updated = await updateRow('appointments', id, body);
    if (!updated) return res.status(404).json({ error: 'Appointment not found.' });

    if (body.status) {
      await sendSms(
        updated.phone,
        `Hi ${updated.full_name}, your Primax Group appointment on ${updated.appointment_date} is now ${updated.status}.`
      );
    }

    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
