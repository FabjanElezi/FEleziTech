import { cookies } from 'next/headers';
import { createToken } from '@/lib/token';
import { COOKIE_NAME } from '@/lib/auth-server';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = createToken(email as string);
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
