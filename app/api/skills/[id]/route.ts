import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const d = await req.json();
  await query(
    `UPDATE skills SET name=$1,category=$2,level=$3,"order"=$4 WHERE id=$5`,
    [d.name, d.category, d.level, d.order, id]
  );
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  await query('DELETE FROM skills WHERE id=$1', [id]);
  return Response.json({ ok: true });
}
