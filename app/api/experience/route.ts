import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';

function rowToExp(d: Record<string, unknown>) {
  return {
    id: d.id, company: d.company, role: d.role,
    startDate: d.start_date, endDate: d.end_date,
    current: d.current, description: d.description,
    order: d.order, type: d.type,
  };
}

export async function GET() {
  const { rows } = await query('SELECT * FROM experience ORDER BY "order" ASC');
  return Response.json(rows.map(rowToExp));
}

export async function POST(req: Request) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const d = await req.json();
  const { rows } = await query(
    `INSERT INTO experience (company,role,start_date,end_date,current,description,"order",type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [d.company,d.role,d.startDate,d.endDate,d.current,d.description,d.order,d.type]
  );
  return Response.json({ id: rows[0].id });
}
