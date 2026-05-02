import { getAuthEmail } from '@/lib/auth-server';

export async function GET() {
  const email = await getAuthEmail();
  if (!email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json({ email });
}
