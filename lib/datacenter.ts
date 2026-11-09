import ranges from './datacenter-ranges.json';

// Is this IP address inside a cloud or hosting network (AWS, Google, Azure,
// Meta, OVH, ...)? People browse from home, office and phone networks; requests
// from these networks are almost always bots, crawlers and link previews.
// The address is only compared in memory and never stored.

const { providers, v4 } = ranges as { providers: string[]; v4: number[]; v6: (string | number)[] };

let v6: { start: bigint[]; end: bigint[]; p: number[] } | null = null;
function v6Table() {
  if (v6) return v6;
  const raw = ranges.v6 as (string | number)[];
  const t = { start: [] as bigint[], end: [] as bigint[], p: [] as number[] };
  for (let i = 0; i < raw.length; i += 3) {
    t.start.push(BigInt(`0x${raw[i]}`));
    t.end.push(BigInt(`0x${raw[i + 1]}`));
    t.p.push(raw[i + 2] as number);
  }
  return (v6 = t);
}

function parseV4(ip: string) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    const x = Number(part);
    if (!/^\d{1,3}$/.test(part) || x > 255) return null;
    n = n * 256 + x;
  }
  return n;
}

const SIXTEEN = BigInt(16);

/** The first 64 bits of an IPv6 address (enough to match network ranges). */
function parseV6Top64(ip: string) {
  const addr = ip.split('%')[0];
  if (!/^[0-9a-f:.]+$/i.test(addr)) return null;
  const [head, tail, extra] = addr.split('::');
  if (extra !== undefined) return null;
  const h = head ? head.split(':') : [];
  const t = tail ? tail.split(':') : [];
  const missing = 8 - h.length - t.length;
  if (tail === undefined ? h.length !== 8 : missing < 0) return null;
  const groups = tail === undefined ? h : [...h, ...Array(missing).fill('0'), ...t];
  let n = BigInt(0);
  for (const g of groups.slice(0, 4)) {
    if (!/^[0-9a-f]{1,4}$/i.test(g)) return null;
    n = (n << SIXTEEN) | BigInt(parseInt(g, 16));
  }
  return n;
}

function search<T extends number | bigint>(value: T, count: number, start: (i: number) => T, end: (i: number) => T) {
  let lo = 0, hi = count - 1, found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (start(mid) <= value) { found = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return found >= 0 && value <= end(found) ? found : -1;
}

/** Name of the cloud provider the address belongs to, or null for a normal network. */
export function dataCentre(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  const n4 = parseV4(mapped ? mapped[1] : ip);
  if (n4 !== null) {
    const i = search(n4, v4.length / 3, (k) => v4[k * 3], (k) => v4[k * 3 + 1]);
    return i < 0 ? null : providers[v4[i * 3 + 2]];
  }
  const n6 = parseV6Top64(ip);
  if (n6 === null) return null;
  const t = v6Table();
  const i = search(n6, t.start.length, (k) => t.start[k], (k) => t.end[k]);
  return i < 0 ? null : providers[t.p[i]];
}
