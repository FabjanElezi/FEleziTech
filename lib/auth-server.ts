import { cookies } from 'next/headers';
import { verifyToken } from './token';

export const COOKIE_NAME = 'admin_token';

export async function getAuthEmail(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
