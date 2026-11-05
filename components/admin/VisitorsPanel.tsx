'use client';
import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Globe, Monitor, Link2, FileText } from 'lucide-react';

type Stats = {
  totals: { views: number; visitors: number; views24h: number; visitors24h: number; views7d: number; visitors7d: number };
  daily: { day: string; views: number; visitors: number }[];
  paths: { path: string; views: number }[];
  referrers: { referrer: string; views: number }[];
  countries: { country: string; views: number; visitors: number }[];
  devices: { device: string; views: number }[];
  recent: { at: string; path: string; country: string | null; city: string | null; device: string; browser: string; referrer: string }[];
};

const flag = (cc: string) =>
  /^[A-Z]{2}$/.test(cc)
    ? String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)))
    : '🌍';

function Tile({ label, views, visitors }: { label: string; views: number; visitors: number }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">{label}</p>
      <p className="text-2xl font-bold text-white leading-none">{views.toLocaleString()}</p>
      <p className="text-xs text-slate-500 mt-1">{visitors.toLocaleString()} {visitors === 1 ? 'visitor' : 'visitors'}</p>
    </div>
  );
}

function List({ icon, title, rows, empty }: {
  icon: React.ReactNode; title: string; empty: string;
  rows: { label: string; value: number; sub?: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">{icon} {title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-slate-600">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.label} className="relative">
              <div className="absolute inset-y-0 left-0 rounded" style={{ width: `${(r.value / max) * 100}%`, background: 'rgba(8,145,178,0.16)' }} />
              <div className="relative flex items-center justify-between gap-3 px-2 py-1 text-sm">
                <span className="text-slate-300 truncate">{r.label}{r.sub && <span className="text-slate-600 text-xs"> · {r.sub}</span>}</span>
                <span className="text-slate-400 text-xs shrink-0">{r.value.toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function VisitorsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const r = await fetch('/api/visits', { cache: 'no-store', signal });
      if (!r.ok) throw new Error();
      const data = await r.json();
      if (signal?.aborted) return;
      setStats(data);
      setError('');
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      setError('Could not load visitor statistics.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Refresh button: show the spinner, then refetch.
  const load = useCallback(() => {
    setLoading(true);
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading stats on mount is the point of this panel
    void fetchStats(ac.signal);
    return () => ac.abort();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) return <p className="text-sm text-slate-400">{error}</p>;
  if (!stats) return null;

  const maxDay = Math.max(1, ...stats.daily.map((d) => d.views));
  const noData = stats.totals.views === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Page views on the public site. No cookies, no IP addresses stored.
        </p>
        <button onClick={load} className="btn-ghost text-xs flex items-center gap-1.5 shrink-0" style={{ padding: '6px 12px' }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {noData && (
        <p className="text-sm text-slate-400 rounded-xl p-4" style={{ background: 'rgba(8,145,178,0.07)', border: '1px solid rgba(8,145,178,0.2)' }}>
          No visits recorded yet. Open the site in a normal browser tab and come back in a minute.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Tile label="Last 24 hours" views={stats.totals.views24h} visitors={stats.totals.visitors24h} />
        <Tile label="Last 7 days"   views={stats.totals.views7d}  visitors={stats.totals.visitors7d} />
        <Tile label="All time"      views={stats.totals.views}    visitors={stats.totals.visitors} />
      </div>

      {/* 14-day chart */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-4">Last 14 days</p>
        <div className="flex items-end gap-1.5 h-28">
          {stats.daily.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${d.day}: ${d.views} views, ${d.visitors} visitors`}>
              <span className="text-[10px] text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.views}</span>
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${Math.max(2, (d.views / maxDay) * 100)}%`,
                  background: d.views ? 'linear-gradient(180deg, #22d3ee, #0891b2)' : 'rgba(255,255,255,0.06)',
                }}
              />
              <span className="text-[9px] text-slate-600 mt-1">{d.day.slice(8)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <List icon={<FileText size={12} />} title="Pages" empty="Nothing yet"
              rows={stats.paths.map((p) => ({ label: p.path, value: p.views }))} />
        <List icon={<Link2 size={12} />} title="Where they came from" empty="Nothing yet"
              rows={stats.referrers.map((r) => ({ label: r.referrer, value: r.views }))} />
        <List icon={<Globe size={12} />} title="Countries" empty="Nothing yet"
              rows={stats.countries.map((c) => ({ label: `${flag(c.country)} ${c.country}`, value: c.views, sub: `${c.visitors} visitors` }))} />
        <List icon={<Monitor size={12} />} title="Devices" empty="Nothing yet"
              rows={stats.devices.map((d) => ({ label: d.device, value: d.views }))} />
      </div>

      {stats.recent.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">Recent visits</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 text-left">
                  <th className="font-medium py-1 pr-4">When</th>
                  <th className="font-medium py-1 pr-4">Page</th>
                  <th className="font-medium py-1 pr-4">From</th>
                  <th className="font-medium py-1 pr-4">Where</th>
                  <th className="font-medium py-1">Device</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((v, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="py-1.5 pr-4 text-slate-500 whitespace-nowrap">{v.at}</td>
                    <td className="py-1.5 pr-4 text-slate-300 truncate max-w-[170px]">{v.path}</td>
                    <td className="py-1.5 pr-4 text-slate-500 truncate max-w-[130px]">{v.referrer}</td>
                    <td className="py-1.5 pr-4 text-slate-400 whitespace-nowrap">
                      {v.country ? `${flag(v.country)} ${v.city ? `${v.city}, ` : ''}${v.country}` : '—'}
                    </td>
                    <td className="py-1.5 text-slate-500 whitespace-nowrap">{v.device} · {v.browser}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
