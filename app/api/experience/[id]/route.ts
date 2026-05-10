import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const d = await req.json();
  await query(
    `UPDATE experience SET company=$1,role=$2,start_date=$3,end_date=$4,current=$5,
     description=$6,"order"=$7,type=$8,certificate_url=$9 WHERE id=$10`,
    [d.company,d.role,d.startDate,d.endDate,d.current,d.description,d.order,d.type,d.certificateUrl??null,id]
  );
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  await query('DELETE FROM experience WHERE id=$1', [id]);
  return Response.json({ ok: true });
}
