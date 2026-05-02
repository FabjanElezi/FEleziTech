import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';

function rowToSkill(d: Record<string, unknown>) {
  return { id: d.id, name: d.name, category: d.category, level: d.level, order: d.order };
}

export async function GET() {
  const { rows } = await query('SELECT * FROM skills ORDER BY "order" ASC');
  return Response.json(rows.map(rowToSkill));
}

export async function POST(req: Request) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const d = await req.json();
  const { rows } = await query(
    `INSERT INTO skills (name,category,level,"order") VALUES ($1,$2,$3,$4) RETURNING id`,
    [d.name, d.category, d.level, d.order]
  );
  return Response.json({ id: rows[0].id });
}
