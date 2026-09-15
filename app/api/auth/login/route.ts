import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/token';
import { COOKIE_NAME } from '@/lib/auth-server';

// Constant-time string comparison so response timing doesn't leak how much of a guess matched.
function safeEqual(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown };
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Invalid request' }, { status: 400 }); }

  const { email, password } = body;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (
    typeof email !== 'string' || typeof password !== 'string' ||
    !adminEmail || !adminPassword ||
    !safeEqual(email, adminEmail) || !safeEqual(password, adminPassword)
  ) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = createToken(email);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
  return Response.json({ email });
}
