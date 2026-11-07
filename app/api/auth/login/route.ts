import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/token';
import { COOKIE_NAME } from '@/lib/auth-server';
import { checkLogin, noteFailure, clearLogin, limitKey } from '@/lib/ratelimit';

// Constant-time string comparison so response timing doesn't leak how much of a guess matched.
function safeEqual(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

const wait = (s: number) =>
  s >= 3600 ? `${Math.round(s / 3600)} hours` : s >= 60 ? `${Math.round(s / 60)} minutes` : `${s} seconds`;

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const key = limitKey(ip);

  // Too many wrong guesses from here: refuse before even looking at the password.
  const limit = await checkLogin(key);
  if (limit.blocked) {
    return Response.json(
      { error: `Too many attempts. Try again in ${wait(limit.retryAfter)}.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

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
    const after = await noteFailure(key);
    if (after.blocked) {
      return Response.json(
        { error: `Too many attempts. Try again in ${wait(after.retryAfter)}.` },
        { status: 429, headers: { 'Retry-After': String(after.retryAfter) } }
      );
    }
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await clearLogin(key);

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
