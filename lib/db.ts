import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export async function query(text: string, params?: unknown[]) {
  const sql = getSql();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await sql.query(text, params as any[]) as any;
  return { rows: (result.rows ?? result) as Record<string, unknown>[] };
}
