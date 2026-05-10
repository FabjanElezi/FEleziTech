import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const d = await req.json();
  await query(
    `UPDATE projects SET title=$1,description=$2,tech_stack=$3,images=$4,github_link=$5,
     live_demo_link=$6,document_url=$7,db_design_images=$8,featured=$9,"order"=$10 WHERE id=$11`,
    [d.title,d.description,d.techStack,d.images,d.githubLink,d.liveDemoLink,d.documentUrl,d.dbDesignImages??[],d.featured,d.order,id]
  );
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  await query('DELETE FROM projects WHERE id=$1', [id]);
  return Response.json({ ok: true });
}
