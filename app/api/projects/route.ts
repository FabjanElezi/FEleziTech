import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';

function rowToProject(d: Record<string, unknown>) {
  return {
    id: d.id, title: d.title, description: d.description,
    techStack: d.tech_stack ?? [], images: d.images ?? [],
    githubLink: d.github_link, liveDemoLink: d.live_demo_link,
    documentUrl: d.document_url, featured: d.featured,
    order: d.order, createdAt: d.created_at,
  };
}

export async function GET() {
  const { rows } = await query('SELECT * FROM projects ORDER BY "order" ASC');
  return Response.json(rows.map(rowToProject));
}

export async function POST(req: Request) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const d = await req.json();
  const { rows } = await query(
    `INSERT INTO projects (title,description,tech_stack,images,github_link,live_demo_link,document_url,featured,"order")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [d.title,d.description,d.techStack,d.images,d.githubLink,d.liveDemoLink,d.documentUrl,d.featured,d.order]
  );
  return Response.json({ id: rows[0].id });
}
