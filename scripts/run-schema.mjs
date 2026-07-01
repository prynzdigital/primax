#!/usr/bin/env node
// One-off runner for neon/schema.sql — used when psql isn't installed locally.
// Usage: DATABASE_URL="postgresql://..." node scripts/run-schema.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env directly instead of relying on shell `source` (the connection
// string's `&` gets misparsed as a background-job operator by bash/sh).
const envPath = join(__dirname, '..', '.env');
if (!process.env.DATABASE_URL && existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) process.env[match[1]] ??= match[2];
  }
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL env var is required (set it or add it to .env).');
  process.exit(1);
}
const schemaPath = join(__dirname, '..', 'neon', 'schema.sql');
const sqlText = readFileSync(schemaPath, 'utf8');

// Strip line comments, then split on statement-terminating semicolons.
const statements = sqlText
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(process.env.DATABASE_URL);

for (const statement of statements) {
  console.log('Running:', statement.slice(0, 60).replace(/\s+/g, ' ') + '...');
  await sql(statement);
}

console.log(`Done — ran ${statements.length} statements against the Neon database.`);
