import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-changeme';

export function createToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 7 * 86_400_000 })).toString('base64url');
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): string | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'base64url'), Buffer.from(expected, 'base64url'))) return null;
  } catch { return null; }
  try {
    const { email, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (exp < Date.now()) return null;
    return email as string;
  } catch { return null; }
}
