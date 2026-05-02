import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) {
    const key = m[1].trim();
    const val = m[2].trim().replace(/^"(.*)"$/, '$1').replace(/^﻿/, '');
    env[key] = val;
  }
}

const DATABASE_URL = env.DATABASE_URL_UNPOOLED || env.DATABASE_URL;
if (!DATABASE_URL) { console.error('No DATABASE_URL found'); process.exit(1); }

const sql = neon(DATABASE_URL);

async function run(text, params = []) {
  return sql.query(text, params);
}

// Check if data already exists
const expResult = await run('SELECT count(*) FROM experience');
const skillResult = await run('SELECT count(*) FROM skills');
const expRows = expResult.rows || expResult;
const skillRows = skillResult.rows || skillResult;
console.log('Count check:', expRows[0], skillRows[0]);
if (Number(expRows[0]?.count ?? 0) > 0 || Number(skillRows[0]?.count ?? 0) > 0) {
  console.log('Data already seeded. Skipping.');
  process.exit(0);
}

// Portfolio
await run(
  `INSERT INTO portfolio (id,name,title,bio,email,phone,linkedin,github,location,hero_tagline,available_for_work,university,open_to_remote)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
   ON CONFLICT (id) DO NOTHING`,
  [
    'main',
    'Fabjan Elezi',
    'Computer Science & Engineering Student',
    'I am a Computer Science & Engineering student at Metropolitan University of Tirana with a passion for cybersecurity, networking, and full-stack development. Currently completing an exchange semester at Masaryk University. I thrive at the intersection of systems thinking and creative problem-solving.',
    'fabio.elezi485@icloud.com',
    '+3550693404140',
    'https://linkedin.com/in/fabjan-elezi-7527b2295',
    '',
    'Tirana, Albania',
    'Building secure, scalable digital experiences.',
    true,
    'Metropolitan University of Tirana',
    true,
  ]
);
console.log('Portfolio seeded');

// Experience
const experiences = [
  ['Metropolitan University of Tirana', 'BSc Computer Science & Engineering', '2023', '2026', true,
   'Tirana, Albania — Studying computer science fundamentals, networking, and software engineering. Active in cybersecurity and programming clubs.', 0, 'education'],
  ['Masaryk University', 'Exchange Semester', 'Feb 2025', 'Jun 2025', false,
   'Brno, Czech Republic — International exchange semester broadening academic perspective in computer science and software development.', 1, 'education'],
];

for (const [company, role, start_date, end_date, current, description, order, type] of experiences) {
  await run(
    `INSERT INTO experience (company,role,start_date,end_date,current,description,"order",type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [company, role, start_date, end_date, current, description, order, type]
  );
}
console.log('Experience seeded');

// Skills
const skills = [
  ['HTML & CSS', 'technical', null, 0],
  ['Python', 'technical', null, 1],
  ['SQL', 'technical', null, 2],
  ['Networking', 'technical', null, 3],
  ['Cybersecurity Basics', 'technical', null, 4],
  ['Excel', 'tool', null, 5],
  ['Albanian', 'language', 'Fluent', 6],
  ['English', 'language', 'Fluent', 7],
  ['German', 'language', 'Basic', 8],
  ['Spanish', 'language', 'Basic', 9],
];

for (const [name, category, level, order] of skills) {
  await run(
    `INSERT INTO skills (name,category,level,"order") VALUES ($1,$2,$3,$4)`,
    [name, category, level, order]
  );
}
console.log('Skills seeded');
console.log('All done!');
