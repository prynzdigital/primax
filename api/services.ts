import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, updateRow } from './_db.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM services ORDER BY is_active DESC, price ASC`;
    return res.status(200).json(rows);
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    const {
      name,
      description,
      duration_minutes,
      price,
      is_active,
      category,
      tasks,
      base_bedrooms,
      base_bathrooms,
      base_living_rooms,
      base_kitchens,
      base_balconies,
      bedroom_modifier,
      bathroom_modifier,
      living_room_modifier,
      kitchen_modifier,
      balcony_modifier,
    } = req.body ?? {};
    if (!name) return res.status(400).json({ error: 'Service name is required.' });
    const rows = await sql`
      INSERT INTO services (
        name, description, duration_minutes, price, is_active,
        category, tasks, base_bedrooms, base_bathrooms, base_living_rooms, base_kitchens, base_balconies,
        bedroom_modifier, bathroom_modifier, living_room_modifier, kitchen_modifier, balcony_modifier
      )
      VALUES (
        ${name}, ${description ?? null}, ${duration_minutes}, ${price}, ${is_active ?? true},
        ${category ?? 'standard'}, ${tasks ?? []}, ${base_bedrooms ?? 1}, ${base_bathrooms ?? 1},
        ${base_living_rooms ?? 0}, ${base_kitchens ?? 0}, ${base_balconies ?? 0},
        ${bedroom_modifier ?? 0}, ${bathroom_modifier ?? 0},
        ${living_room_modifier ?? 0}, ${kitchen_modifier ?? 0}, ${balcony_modifier ?? 0}
      )
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }

  if (req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;
    const id = req.query.id as string | undefined;
    if (!id) return res.status(400).json({ error: 'Missing id.' });
    const updated = await updateRow('services', id, req.body ?? {});
    if (!updated) return res.status(404).json({ error: 'Service not found.' });
    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
