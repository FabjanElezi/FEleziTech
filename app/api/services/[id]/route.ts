import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { ensureServicesTable } from '@/lib/data';

const ICONS = ['web', 'data', 'network', 'database'];
const clean = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

// Full replace: the editor always sends the whole record, so an omitted
// translation means "cleared", never "left as it was".
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const d = await req.json();
  const title = clean(d.title);
  if (!title) return Response.json({ error: 'Title is required' }, { status: 400 });
  await ensureServicesTable();
  await query(
    `UPDATE services SET title=$1,description=$2,icon=$3,"order"=$4,
       title_de=$5,title_sq=$6,description_de=$7,description_sq=$8
     WHERE id=$9`,
    [title, clean(d.description) ?? '', ICONS.includes(d.icon) ? d.icon : 'web', Number(d.order) || 0,
     clean(d.title_de), clean(d.title_sq), clean(d.description_de), clean(d.description_sq), id]
  );
  revalidatePath('/');
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  await query('DELETE FROM services WHERE id=$1', [id]);
  revalidatePath('/');
  return Response.json({ ok: true });
}
