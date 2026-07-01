#!/usr/bin/env node
// One-off script to create or reset an admin login.
// Usage: DATABASE_URL="postgresql://..." node scripts/create-admin.mjs admin@primaxgroupllc.com 'a-strong-password'
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: DATABASE_URL=... node scripts/create-admin.mjs <email> <password>');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL env var is required (do not hardcode it here).');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await bcrypt.hash(password, 10);

const rows = await sql`
  INSERT INTO admin_users (email, password_hash)
  VALUES (${email.toLowerCase().trim()}, ${passwordHash})
  ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  RETURNING id, email
`;

console.log('Admin user ready:', rows[0]);
