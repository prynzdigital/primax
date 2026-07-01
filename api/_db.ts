import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Configure it in your Vercel project environment variables.');
}

export const sql = neon(databaseUrl);

/**
 * Builds and runs `UPDATE <table> SET ... WHERE id = $1 RETURNING *` from a
 * partial field map, skipping any keys whose value is `undefined` — lets
 * callers send partial payloads (e.g. `{ is_active: false }`) without
 * clobbering other columns.
 */
export async function updateRow<T>(
  table: string,
  id: string,
  fields: Record<string, unknown>
): Promise<T | null> {
  const keys = Object.keys(fields).filter((k) => fields[k] !== undefined);
  if (keys.length === 0) return null;
  const setClauses = keys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
  const values = keys.map((k) => fields[k]);
  const text = `UPDATE ${table} SET ${setClauses} WHERE id = $1 RETURNING *`;
  const rows = await sql(text, [id, ...values]);
  return (rows[0] as T) ?? null;
}
