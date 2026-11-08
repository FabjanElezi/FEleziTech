'use client';
import { useState } from 'react';
import { addService, updateService, deleteService } from '@/lib/firestore';
import { Service, ServiceIcon } from '@/types';
import { Plus, Pencil, Trash2, Check, X, Globe, BarChart3, Network, Database, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  services: Service[];
  onChanged: (items: Service[]) => void;
}

const ICONS: { id: ServiceIcon; label: string; Icon: typeof Globe }[] = [
  { id: 'web',      label: 'Web',      Icon: Globe },
  { id: 'data',     label: 'Data',     Icon: BarChart3 },
  { id: 'network',  label: 'Network',  Icon: Network },
  { id: 'database', label: 'Database', Icon: Database },
];
const iconFor = (id: ServiceIcon) => (ICONS.find((i) => i.id === id) ?? ICONS[0]).Icon;

type Form = Omit<Service, 'id' | 'order'>;
const EMPTY: Form = {
  title: '', description: '', icon: 'web',
  title_de: '', title_sq: '', description_de: '', description_sq: '',
};

export default function ServicesEditor({ services, onChanged }: Props) {
  // 'new' while adding, a service id while editing, null otherwise.
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  function startAdd() { setForm(EMPTY); setEditing('new'); }
  function startEdit(s: Service) {
    setForm({
      title: s.title, description: s.description, icon: s.icon,
      title_de: s.title_de ?? '', title_sq: s.title_sq ?? '',
      description_de: s.description_de ?? '', description_sq: s.description_sq ?? '',
    });
    setEditing(s.id);
  }
  function cancel() { setEditing(null); setForm(EMPTY); }

  async function save() {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (editing === 'new') {
        const data = { ...form, order: services.length };
        const id = await addService(data);
        onChanged([...services, { ...data, id }]);
        toast.success('Service added');
      } else if (editing) {
        const current = services.find((s) => s.id === editing)!;
        const data = { ...form, order: current.order };
        await updateService(editing, data);
        onChanged(services.map((s) => (s.id === editing ? { ...s, ...data } : s)));
        toast.success('Service updated');
      }
      cancel();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this service from the site?')) return;
    try {
      await deleteService(id);
      onChanged(services.filter((s) => s.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Delete failed');
    }
  }

  // Swap with the neighbour and persist both orders. Two small writes keep the
  // sequence exact without renumbering the whole list.
  async function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= services.length) return;
    const list = [...services];
    [list[index], list[j]] = [list[j], list[index]];
    const renumbered = list.map((s, i) => ({ ...s, order: i }));
    onChanged(renumbered);
    try {
      const { id: a, ...ra } = renumbered[index];
      const { id: b, ...rb } = renumbered[j];
      await Promise.all([updateService(a, ra), updateService(b, rb)]);
    } catch {
      toast.error('Reorder failed');
      onChanged(services);
    }
  }

  const formBlock = (
    <div className="glass rounded-xl p-5 space-y-4">
      <p className="text-sm font-semibold text-slate-300">{editing === 'new' ? 'New service' : 'Edit service'}</p>

      <div className="grid sm:grid-cols-[1fr_auto] gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Title — English *</label>
          <input className="input-dark" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Website building" autoFocus />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Icon</label>
          <div className="flex gap-1.5">
            {ICONS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => set('icon', id)}
                title={label}
                aria-label={label}
                aria-pressed={form.icon === id}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                style={form.icon === id
                  ? { background: 'rgba(8,145,178,0.25)', border: '1px solid rgba(34,211,238,0.6)', color: '#67e8f9' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">Description — English</label>
        <textarea className="input-dark min-h-[80px] resize-y" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Title — Deutsch</label>
          <input className="input-dark" value={form.title_de || ''} onChange={(e) => set('title_de', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Title — Shqip</label>
          <input className="input-dark" value={form.title_sq || ''} onChange={(e) => set('title_sq', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Description — Deutsch</label>
          <textarea className="input-dark min-h-[80px] resize-y" value={form.description_de || ''} onChange={(e) => set('description_de', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Description — Shqip</label>
          <textarea className="input-dark min-h-[80px] resize-y" value={form.description_sq || ''} onChange={(e) => set('description_sq', e.target.value)} />
        </div>
      </div>
      <p className="text-[11px] text-slate-600">Leave a translation empty and the English text is shown in that language.</p>

      <div className="flex gap-2">
        <button type="button" onClick={save} disabled={saving || !form.title.trim()} className="btn-primary text-sm py-1.5">
          {saving ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Save</>}
        </button>
        <button type="button" onClick={cancel} className="btn-ghost text-sm py-1.5">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Shown on the site in the Services section, between Projects and Contact. Pricing is always shown as “on request”.
      </p>

      {editing === 'new' ? formBlock : (
        <button onClick={startAdd} className="btn-primary text-sm">
          <Plus size={15} /> Add service
        </button>
      )}

      {services.length === 0 && editing !== 'new' && (
        <p className="text-sm text-slate-500">No services yet — the section is hidden on the site until you add one.</p>
      )}

      <div className="space-y-2">
        {services.map((s, i) => {
          if (editing === s.id) return <div key={s.id}>{formBlock}</div>;
          const Icon = iconFor(s.icon);
          return (
            <div key={s.id} className="glass rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(8,145,178,0.15)' }}>
                <Icon size={16} className="text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{s.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{s.description}</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  DE {s.title_de ? '✓' : '—'} · SQ {s.title_sq ? '✓' : '—'}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="p-1.5 text-slate-500 hover:text-cyan-400 disabled:opacity-30"><ArrowUp size={14} /></button>
                <button onClick={() => move(i, 1)} disabled={i === services.length - 1} aria-label="Move down" className="p-1.5 text-slate-500 hover:text-cyan-400 disabled:opacity-30"><ArrowDown size={14} /></button>
                <button onClick={() => startEdit(s)} aria-label="Edit" className="p-1.5 text-slate-500 hover:text-cyan-400"><Pencil size={14} /></button>
                <button onClick={() => remove(s.id)} aria-label="Delete" className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
