'use client';
import { useState } from 'react';
import { addExperience, updateExperience, deleteExperience } from '@/lib/firestore';
import { Experience } from '@/types';
import {
  Plus, Pencil, Trash2, Check, X, Upload,
  ChevronUp, ChevronDown, Briefcase, GraduationCap, Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'work' | 'education' | 'award';

interface Props {
  experiences: Experience[];
  onChanged: (items: Experience[]) => void;
}

interface FormState extends Omit<Experience, 'id'> {
  location: string;
}

const blank = (): FormState => ({
  company: '', role: '', startDate: '', endDate: '',
  current: false, description: '', location: '',
  type: 'work', order: 0, certificateUrl: '',
});

function parseDescription(raw: string): { location: string; description: string } {
  if (raw?.includes(' — ')) {
    const idx = raw.indexOf(' — ');
    return { location: raw.slice(0, idx).trim(), description: raw.slice(idx + 3).trim() };
  }
  return { location: '', description: raw ?? '' };
}

function buildDescription(location: string, description: string): string {
  const loc = location.trim();
  const desc = description.trim();
  if (loc && desc) return `${loc} — ${desc}`;
  if (loc) return loc;
  return desc;
}

function expToForm(exp: Experience): FormState {
  const { location, description } = parseDescription(exp.description);
  return { ...exp, location, description };
}

const TYPE_STYLE = {
  work:      { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.35)', text: '#c4b5fd', label: 'Work',      icon: Briefcase },
  education: { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.35)',  text: '#67e8f9', label: 'Education', icon: GraduationCap },
  award:     { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#fcd34d', label: 'Award',     icon: Trophy },
};

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'work',      label: 'Work' },
  { id: 'education', label: 'Education' },
  { id: 'award',     label: 'Awards' },
];

export default function ExperienceEditor({ experiences, onChanged }: Props) {
  const [filter, setFilter]   = useState<FilterType>('all');
  const [adding, setAdding]   = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm]       = useState<FormState>(blank());
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [moving, setMoving]   = useState<string | null>(null);

  const sorted   = [...experiences].sort((a, b) => a.order - b.order);
  const filtered = filter === 'all' ? sorted : sorted.filter((e) => e.type === filter);

  function setField(key: string, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function startAdd() {
    setForm(blank());
    setAdding(true);
    setEditing(null);
  }

  function startEdit(exp: Experience) {
    setForm(expToForm(exp));
    setEditing(exp.id);
    setAdding(false);
  }

  async function move(id: string, direction: 'up' | 'down') {
    const idx = sorted.findIndex((e) => e.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    setMoving(id);
    try {
      await Promise.all([
        fetch(`/api/experience/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: b.order }) }),
        fetch(`/api/experience/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: a.order }) }),
      ]);
      onChanged(experiences.map((e) => {
        if (e.id === a.id) return { ...e, order: b.order };
        if (e.id === b.id) return { ...e, order: a.order };
        return e;
      }));
    } catch {
      toast.error('Reorder failed');
    } finally {
      setMoving(null);
    }
  }

  async function uploadCertificate(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'certificates');
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!r.ok) throw new Error();
      const { url } = await r.json();
      setField('certificateUrl', url);
      toast.success('Certificate uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const { location, ...rest } = form;
      const payload: Omit<Experience, 'id'> = {
        ...rest,
        description: buildDescription(location, form.description),
      };
      if (editing) {
        await updateExperience(editing, payload);
        onChanged(experiences.map((e) => (e.id === editing ? { ...e, ...payload } : e)));
        toast.success('Updated');
      } else {
        const nextOrder = sorted.length ? sorted[sorted.length - 1].order + 1 : 0;
        const id = await addExperience({ ...payload, order: nextOrder });
        onChanged([...experiences, { ...payload, id, order: nextOrder }]);
        toast.success('Added');
      }
      setAdding(false);
      setEditing(null);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return;
    await deleteExperience(id);
    onChanged(experiences.filter((e) => e.id !== id));
    toast.success('Deleted');
  }

  const entryForm = (
    <div className="rounded-xl p-5 space-y-4 mt-3 mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Company / Institution *</label>
          <input className="input-dark" value={form.company} onChange={(e) => setField('company', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Role / Degree *</label>
          <input className="input-dark" value={form.role} onChange={(e) => setField('role', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Type</label>
          <select className="input-dark" value={form.type} onChange={(e) => setField('type', e.target.value)}>
            <option value="work">Work</option>
            <option value="education">Education</option>
            <option value="award">Award</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Start</label>
          <input className="input-dark" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} placeholder="2023" />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">End</label>
          <input className="input-dark" value={form.endDate || ''} onChange={(e) => setField('endDate', e.target.value)} placeholder="2026" disabled={form.current} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.current} onChange={(e) => setField('current', e.target.checked)} className="accent-purple-500" />
            Current
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Location</label>
        <input className="input-dark" value={form.location} onChange={(e) => setField('location', e.target.value)} placeholder="Tirana, Albania" />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Description</label>
        <textarea className="input-dark min-h-[70px] resize-y" value={form.description} onChange={(e) => setField('description', e.target.value)} />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Certificate (URL or upload image)</label>
        <div className="flex gap-2">
          <input
            className="input-dark flex-1"
            value={form.certificateUrl || ''}
            onChange={(e) => setField('certificateUrl', e.target.value)}
            placeholder="https://..."
          />
          <label className="btn-ghost text-xs py-1.5 px-3 cursor-pointer flex items-center gap-1.5 shrink-0">
            {uploading
              ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Upload size={13} /> Upload</>}
            <input type="file" accept="image/*" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCertificate(f); }} />
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={saving} className="btn-primary text-sm py-1.5">
          {saving ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Save</>}
        </button>
        <button type="button" onClick={() => { setAdding(false); setEditing(null); }} className="btn-ghost text-sm py-1.5">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {FILTERS.map((f) => {
            const count = f.id === 'all' ? experiences.length : experiences.filter((e) => e.type === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                style={filter === f.id
                  ? { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white' }
                  : { color: '#64748b' }}
              >
                {f.label}
                <span
                  className="text-xs px-1 rounded"
                  style={{ background: filter === f.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', color: filter === f.id ? 'white' : '#475569' }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <button onClick={startAdd} className="btn-primary text-sm py-1.5">
          <Plus size={15} /> Add Entry
        </button>
      </div>

      {filter !== 'all' && (
        <p className="text-slate-600 text-xs mb-4">Reorder is available in the <button onClick={() => setFilter('all')} className="text-purple-400 hover:underline">All</button> view.</p>
      )}

      {adding && entryForm}

      <div className="space-y-2">
        {filtered.map((exp, i) => {
          const style = TYPE_STYLE[exp.type] ?? TYPE_STYLE.work;
          const Icon  = style.icon;
          const isFirst = sorted[0]?.id === exp.id;
          const isLast  = sorted[sorted.length - 1]?.id === exp.id;

          return (
            <div key={exp.id}>
              <div
                className="group rounded-xl p-4 flex items-center gap-3 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.055)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                {/* Type icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                  <Icon size={14} style={{ color: style.text }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white text-sm font-medium truncate">{exp.role}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: style.text }}>{exp.company}</p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {exp.startDate}{(exp.current || exp.endDate) ? ` – ${exp.current ? 'Present' : exp.endDate}` : ''}
                    {exp.description && <span className="ml-2 text-slate-700">· {exp.description.slice(0, 40)}{exp.description.length > 40 ? '…' : ''}</span>}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {filter === 'all' && (
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(exp.id, 'up')}
                        disabled={isFirst || moving === exp.id}
                        className="p-1 rounded text-slate-600 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        {moving === exp.id ? <span className="w-3 h-3 border border-slate-500 border-t-white rounded-full animate-spin inline-block" /> : <ChevronUp size={14} />}
                      </button>
                      <button
                        onClick={() => move(exp.id, 'down')}
                        disabled={isLast || moving === exp.id}
                        className="p-1 rounded text-slate-600 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  )}
                  <button onClick={() => startEdit(exp)} className="p-1.5 text-slate-500 hover:text-white transition-colors" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(exp.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {editing === exp.id && entryForm}
            </div>
          );
        })}

        {filtered.length === 0 && !adding && (
          <p className="text-slate-600 text-sm text-center py-8">
            {filter === 'all' ? 'No entries yet. Click "Add Entry" to begin.' : `No ${filter} entries yet.`}
          </p>
        )}
      </div>

      {/* Order hint */}
      {experiences.length > 1 && (
        <p className="text-slate-700 text-xs mt-5">
          Order is controlled by the ↑↓ buttons above (saved to the database instantly). Items are shown top-to-bottom by their <code className="text-slate-600">order</code> value.
        </p>
      )}
    </div>
  );
}
