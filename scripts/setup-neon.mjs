import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars manually
const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) {
    const key = m[1].trim();
    let val = m[2].trim().replace(/^"(.*)"$/, '$1').replace(/^﻿/, '');
    env[key] = val;
  }
}

const DATABASE_URL = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
if (!DATABASE_URL) { console.error('No DATABASE_URL found'); process.exit(1); }

const sql = neon(DATABASE_URL);

const schema = readFileSync(join(__dirname, '..', 'schema.sql'), 'utf8');
const statements = schema.split(';').map(s => s.trim()).filter(Boolean);

console.log(`Running ${statements.length} SQL statements on Neon...`);
for (const stmt of statements) {
  try {
    await sql.query(stmt);
    console.log('OK:', stmt.slice(0, 60));
  } catch (e) {
    console.error('ERR:', e.message, '\nSQL:', stmt.slice(0, 80));
  }
}
console.log('Done!');
