import { getAuthEmail } from '@/lib/auth-server';
import { getVisitStats, ensureVisitsTable, ensureCvTable } from '@/lib/visits';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_STORE = { headers: { 'Cache-Control': 'no-store' } };

// Admin only: aggregated visit statistics. Bots are left out unless ?bots=1.
export async function GET(req: Request) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const includeBots = new URL(req.url).searchParams.get('bots') === '1';
  try {
    return Response.json(await getVisitStats(includeBots), NO_STORE);
  } catch {
    return Response.json({ error: 'Could not load visit statistics' }, { status: 500 });
  }
}

// Admin only: start the counters from zero. Used to clear test data.
export async function DELETE() {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await ensureVisitsTable();
    await ensureCvTable();
    await query('DELETE FROM visits');
    await query('DELETE FROM cv_opens');
    return Response.json({ ok: true }, NO_STORE);
  } catch {
    return Response.json({ error: 'Could not clear the statistics' }, { status: 500 });
  }
}
