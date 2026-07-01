import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, updateRow } from './_db.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM addons ORDER BY is_active DESC, name ASC`;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    const {
      name,
      description,
      price,
      duration_minutes,
      is_active,
      is_counter,
      max_quantity,
      disabled_for_category,
    } = req.body ?? {};
    if (!name) return res.status(400).json({ error: 'Add-on name is required.' });
    const rows = await sql`
      INSERT INTO addons (name, description, price, duration_minutes, is_active, is_counter, max_quantity, disabled_for_category)
      VALUES (
        ${name}, ${description ?? null}, ${price ?? 0}, ${duration_minutes ?? 0}, ${is_active ?? true},
        ${is_counter ?? false}, ${max_quantity ?? null}, ${disabled_for_category ?? null}
      )
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }

  if (req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;
    const id = req.query.id as string | undefined;
    if (!id) return res.status(400).json({ error: 'Missing id.' });
    const updated = await updateRow('addons', id, req.body ?? {});
    if (!updated) return res.status(404).json({ error: 'Add-on not found.' });
    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
