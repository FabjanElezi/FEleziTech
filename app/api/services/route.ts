import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { ensureServicesTable, getServices } from '@/lib/data';

export const dynamic = 'force-dynamic';
const NO_STORE = { headers: { 'Cache-Control': 'no-store' } };

const ICONS = ['web', 'data', 'network', 'database'];
const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

export async function GET() {
  return Response.json(await getServices(), NO_STORE);
}

export async function POST(req: Request) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const d = await req.json();
  const title = clean(d.title);
  if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });
  await ensureServicesTable();
  const { rows } = await query(
    `INSERT INTO services (title,description,icon,"order",title_de,title_sq,description_de,description_sq)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [title, clean(d.description) ?? '', ICONS.includes(d.icon) ? d.icon : 'web', Number(d.order) || 0,
     clean(d.title_de), clean(d.title_sq), clean(d.description_de), clean(d.description_sq)]
  );
  revalidatePath('/');
  return Response.json({ id: rows[0].id });
}
