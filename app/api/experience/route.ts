import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';

let migrated = false;
async function ensureAwardType() {
  if (migrated) return;
  try {
    await query(`
      DO $$
      DECLARE con text;
      BEGIN
        SELECT cc.constraint_name INTO con
        FROM information_schema.check_constraints cc
        JOIN information_schema.constraint_column_usage cu
          ON cc.constraint_name = cu.constraint_name
        WHERE cu.table_name = 'experience' AND cu.column_name = 'type'
          AND cc.constraint_schema = current_schema()
        LIMIT 1;
        IF con IS NOT NULL THEN
          EXECUTE 'ALTER TABLE experience DROP CONSTRAINT ' || quote_ident(con);
        END IF;
        BEGIN
          ALTER TABLE experience ADD CONSTRAINT experience_type_check
            CHECK (type IN ('work','education','award'));
        EXCEPTION WHEN duplicate_object THEN NULL;
        END;
      END $$;
    `);
    migrated = true;
  } catch { migrated = true; }
}

function rowToExp(d: Record<string, unknown>) {
  return {
    id: d.id, company: d.company, role: d.role,
    startDate: d.start_date, endDate: d.end_date,
    current: d.current, description: d.description,
    order: d.order, type: d.type,
    certificateUrl: d.certificate_url,
  };
}

export async function GET() {
  await ensureAwardType();
  const { rows } = await query('SELECT * FROM experience ORDER BY "order" ASC');
  return Response.json(rows.map(rowToExp));
}

export async function POST(req: Request) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const d = await req.json();
  const { rows } = await query(
    `INSERT INTO experience (company,role,start_date,end_date,current,description,"order",type,certificate_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [d.company,d.role,d.startDate,d.endDate,d.current,d.description,d.order,d.type,d.certificateUrl??null]
  );
  return Response.json({ id: rows[0].id });
}
