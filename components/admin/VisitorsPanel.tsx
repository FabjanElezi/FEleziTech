'use client';
import { useEffect, useState, useCallback, Fragment } from 'react';
import {
  RefreshCw, Globe, Monitor, Link2, FileText, Tag, MapPin,
  Languages, MousePointerClick, ChevronDown, Clock,
} from 'lucide-react';

type Recent = {
  at: string; path: string;
  country: string | null; region: string | null; city: string | null;
  coords: string | null; tz: string | null; lang: string | null;
  device: string; browser: string; os: string | null;
  screen: string | null; viewport: string | null;
  hardware: string | null; connection: string | null;
  source: string; referrerUrl: string | null; tag: string | null;
  dwell: number | null; scroll: number | null; actions: string | null;
};

type Stats = {
  totals: {
    views: number; visitors: number; views24h: number; visitors24h: number;
    views7d: number; visitors7d: number; avgDwell: number; avgScroll: number;
  };
  daily: { day: string; views: number; visitors: number }[];
  paths: { path: string; views: number }[];
  sources: { host: string | null; label: string; views: number; visitors: number }[];
  tags: { tag: string; views: number; visitors: number; lastSeen: string }[];
  places: { country: string; city: string | null; region: string | null; views: number; visitors: number }[];
  systems: { device: string; os: string; views: number }[];
  languages: { lang: string; views: number }[];
  clicks: { action: string; views: number }[];
  recent: Recent[];
};

const flag = (cc: string) =>
  /^[A-Z]{2}$/.test(cc)
    ? String.fromCodePoint(...[...cc].map((c) => 127397 + c.charCodeAt(0)))
    : '🌍';

const place = (p: { country: string | null; city: string | null; region: string | null }) =>
  [p.city, p.region && p.region !== p.city ? p.region : null, p.country].filter(Boolean).join(', ');

const secs = (s: number | null) => {
  if (s == null || s <= 0) return '—';
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">{label}</p>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
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
          {rows.map((r, i) => (
            <li key={`${r.label}-${i}`} className="relative">
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

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-slate-600">{label}</span>
      <p className="text-slate-300 break-words">{value}</p>
    </div>
  );
}

export default function VisitorsPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

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
          Page views on the public site. No cookies and no IP address stored — only what a
          browser sends anyway, plus how long the page was open.
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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Tile label="Last 24 hours" value={stats.totals.views24h.toLocaleString()}
              sub={`${stats.totals.visitors24h} ${stats.totals.visitors24h === 1 ? 'visitor' : 'visitors'}`} />
        <Tile label="Last 7 days" value={stats.totals.views7d.toLocaleString()}
              sub={`${stats.totals.visitors7d} ${stats.totals.visitors7d === 1 ? 'visitor' : 'visitors'}`} />
        <Tile label="All time" value={stats.totals.views.toLocaleString()}
              sub={`${stats.totals.visitors} ${stats.totals.visitors === 1 ? 'visitor' : 'visitors'}`} />
        <Tile label="Avg. time" value={secs(stats.totals.avgDwell)} sub="on the page" />
        <Tile label="Avg. scroll" value={stats.totals.avgScroll ? `${stats.totals.avgScroll}%` : '—'} sub="of the page read" />
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

      {/* Shared links — as close to "who" as a website can honestly get */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Tag size={12} /> Shared links
        </p>
        {stats.tags.length === 0 ? (
          <p className="text-xs text-slate-500 leading-relaxed">
            Add <span className="text-cyan-400">?ref=name</span> to the link when you share it, and every opening shows up here.
            For an application: <span className="text-slate-300">felezitech.vercel.app/?ref=bmw</span>.
            In your LinkedIn profile: <span className="text-slate-300">?ref=linkedin</span>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-600 text-left text-xs">
                  <th className="font-medium py-1 pr-4">Link</th>
                  <th className="font-medium py-1 pr-4">Opens</th>
                  <th className="font-medium py-1 pr-4">People</th>
                  <th className="font-medium py-1">Last opened</th>
                </tr>
              </thead>
              <tbody>
                {stats.tags.map((t) => (
                  <tr key={t.tag} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="py-1.5 pr-4 text-cyan-400">?ref={t.tag}</td>
                    <td className="py-1.5 pr-4 text-slate-300">{t.views}</td>
                    <td className="py-1.5 pr-4 text-slate-400">{t.visitors}</td>
                    <td className="py-1.5 text-slate-500 text-xs whitespace-nowrap">{t.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <List icon={<Link2 size={12} />} title="Where they came from" empty="Nothing yet"
              rows={stats.sources.map((s) => ({ label: s.label, value: s.views, sub: `${s.visitors} visitors` }))} />
        <List icon={<MapPin size={12} />} title="Places" empty="Nothing yet"
              rows={stats.places.map((p) => ({ label: `${flag(p.country)} ${place(p) || p.country}`, value: p.views, sub: `${p.visitors} visitors` }))} />
        <List icon={<MousePointerClick size={12} />} title="What they clicked" empty="No clicks recorded yet"
              rows={stats.clicks.map((c) => ({ label: c.action, value: c.views }))} />
        <List icon={<FileText size={12} />} title="Pages" empty="Nothing yet"
              rows={stats.paths.map((p) => ({ label: p.path, value: p.views }))} />
        <List icon={<Monitor size={12} />} title="Devices & systems" empty="Nothing yet"
              rows={stats.systems.map((s) => ({ label: `${s.device} · ${s.os}`, value: s.views }))} />
        <List icon={<Languages size={12} />} title="Browser language" empty="Nothing yet"
              rows={stats.languages.map((l) => ({ label: l.lang, value: l.views }))} />
      </div>

      {stats.recent.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Globe size={12} /> Recent visits <span className="text-slate-600 normal-case tracking-normal">— click a row for everything</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-600 text-left">
                  <th className="font-medium py-1 pr-4">When</th>
                  <th className="font-medium py-1 pr-4">Page</th>
                  <th className="font-medium py-1 pr-4">Came from</th>
                  <th className="font-medium py-1 pr-4">Place</th>
                  <th className="font-medium py-1 pr-4">Stayed</th>
                  <th className="font-medium py-1">Device</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((v, i) => (
                  <Fragment key={i}>
                    <tr onClick={() => setOpen(open === i ? null : i)}
                        className="cursor-pointer hover:bg-white/[0.03]"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="py-1.5 pr-4 text-slate-500 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <ChevronDown size={11} className="transition-transform" style={{ transform: open === i ? 'none' : 'rotate(-90deg)' }} />
                          {v.at}
                        </span>
                      </td>
                      <td className="py-1.5 pr-4 text-slate-300 truncate max-w-[130px]">{v.path}</td>
                      <td className="py-1.5 pr-4 text-slate-400 truncate max-w-[160px]" title={v.referrerUrl ?? undefined}>
                        {v.source}
                        {v.tag && <span className="text-cyan-400"> · ?ref={v.tag}</span>}
                      </td>
                      <td className="py-1.5 pr-4 text-slate-400 whitespace-nowrap">
                        {v.country ? `${flag(v.country)} ${place(v) || v.country}` : '—'}
                      </td>
                      <td className="py-1.5 pr-4 text-slate-400 whitespace-nowrap">
                        {secs(v.dwell)}{v.scroll ? ` · ${v.scroll}%` : ''}
                      </td>
                      <td className="py-1.5 text-slate-500 whitespace-nowrap">{v.device} · {v.browser}</td>
                    </tr>
                    {open === i && (
                      <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <td colSpan={6} className="p-3" style={{ background: 'rgba(8,145,178,0.05)' }}>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                            <Detail label="Operating system" value={v.os} />
                            <Detail label="Browser" value={v.browser} />
                            <Detail label="Screen" value={v.screen} />
                            <Detail label="Window" value={v.viewport} />
                            <Detail label="Hardware" value={v.hardware} />
                            <Detail label="Connection" value={v.connection} />
                            <Detail label="Browser language" value={v.lang} />
                            <Detail label="Time zone" value={v.tz} />
                            <Detail label="Approx. coordinates" value={v.coords} />
                            <Detail label="Referring page" value={v.referrerUrl} />
                            <Detail label="Shared link" value={v.tag ? `?ref=${v.tag}` : null} />
                            <Detail label="Clicked" value={v.actions ? v.actions.split('|').join(', ') : null} />
                          </div>
                          <p className="text-[10px] text-slate-600 mt-3 flex items-center gap-1.5">
                            <Clock size={10} /> Stayed {secs(v.dwell)}{v.scroll ? `, read about ${v.scroll}% of the page` : ''}.
                          </p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
