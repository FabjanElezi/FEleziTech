/**
 * One source of truth for the site's public address.
 *
 * To move the site to a custom domain, set NEXT_PUBLIC_SITE_URL in Vercel
 * (Project -> Settings -> Environment Variables) and redeploy. Everything that
 * needs the URL -- page metadata, canonical links, the sitemap, robots.txt, the
 * social preview image, the admin hints -- reads it from here, so no code has
 * to change. Without the variable the site keeps using the vercel.app address.
 *
 * NEXT_PUBLIC_ means the value is baked into the bundle at build time, so this
 * works in client components too. A redeploy is required after changing it.
 */
const FALLBACK = 'https://felezitech.vercel.app';

/**
 * Accepts what a human would plausibly paste -- "fabjanelezi.me",
 * "https://fabjanelezi.me/", "http://fabjanelezi.me" -- and returns a clean
 * https origin with no trailing slash. Anything unparseable falls back rather
 * than crashing the build, because `new URL()` in metadataBase throws.
 */
function toOrigin(raw: string | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) return FALLBACK;
  try {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const parsed = new URL(withScheme);
    if (!parsed.hostname.includes('.')) return FALLBACK;
    // Always serve over https; the origin drops any path, query and trailing slash.
    return `https://${parsed.host}`;
  } catch {
    return FALLBACK;
  }
}

/** e.g. "https://fabjanelezi.me" */
export const SITE_URL = toOrigin(process.env.NEXT_PUBLIC_SITE_URL);

/** Host on its own, for showing to people: "fabjanelezi.me" */
export const SITE_HOST = SITE_URL.replace(/^https:\/\//, '');

/** Absolute URL for a path: url('/sitemap.xml') */
export function url(path = '/'): string {
  if (!path || path === '/') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
