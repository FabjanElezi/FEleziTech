import { query } from '@/lib/db';
import { getAuthEmail } from '@/lib/auth-server';

export async function GET() {
  const { rows } = await query('SELECT * FROM portfolio WHERE id = $1', ['main']);
  if (!rows[0]) return Response.json(null);
  const d = rows[0];
  return Response.json({
    name: d.name ?? '',
    title: d.title ?? '',
    bio: d.bio ?? '',
    email: d.email ?? '',
    phone: d.phone ?? '',
    linkedin: d.linkedin ?? '',
    github: d.github,
    location: d.location,
    profileImage: d.profile_image,
    cvUrl: d.cv_url,
    heroTagline: d.hero_tagline,
    availableForWork: d.available_for_work,
    university: d.university,
    openToRemote: d.open_to_remote,
  });
}

export async function PUT(req: Request) {
  const auth = await getAuthEmail();
  if (!auth) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const d = await req.json();
  await query(
    `INSERT INTO portfolio (id,name,title,bio,email,phone,linkedin,github,location,profile_image,cv_url,hero_tagline,available_for_work,university,open_to_remote,updated_at)
     VALUES ('main',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now())
     ON CONFLICT (id) DO UPDATE SET
       name=$1,title=$2,bio=$3,email=$4,phone=$5,linkedin=$6,github=$7,location=$8,
       profile_image=$9,cv_url=$10,hero_tagline=$11,available_for_work=$12,
       university=$13,open_to_remote=$14,updated_at=now()`,
    [d.name,d.title,d.bio,d.email,d.phone,d.linkedin,d.github,d.location,
     d.profileImage,d.cvUrl,d.heroTagline,d.availableForWork,d.university,d.openToRemote]
  );
  return Response.json({ ok: true });
}
