import { getAuthEmail } from '@/lib/auth-server';
import { getVisitStats } from '@/lib/visits';

export const dynamic = 'force-dynamic';
const NO_STORE = { headers: { 'Cache-Control': 'no-store' } };

// Admin only: aggregated visit statistics.
export async function GET() {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    return Response.json(await getVisitStats(), NO_STORE);
  } catch {
    return Response.json({ error: 'Could not load visit statistics' }, { status: 500 });
  }
}
