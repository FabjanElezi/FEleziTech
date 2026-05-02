'use client';
import { useState } from 'react';
import { addExperience, updateExperience, deleteExperience } from '@/lib/firestore';
import { Experience } from '@/types';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  experiences: Experience[];
  onChanged: (items: Experience[]) => void;
}

const blank = (): Omit<Experience, 'id'> => ({
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  type: 'education',
  order: 0,
});

export default function ExperienceEditor({ experiences, onChanged }: Props) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);

  function setField(key: string, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function startAdd() {
    setForm(blank());
    setAdding(true);
    setEditing(null);
  }

  function startEdit(exp: Experience) {
    setForm({ ...exp });
    setEditing(exp.id);
    setAdding(false);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        await updateExperience(editing, form);
        onChanged(experiences.map((e) => (e.id === editing ? { ...e, ...form } : e)));
        toast.success('Updated');
      } else {
        const id = await addExperience(form);
        onChanged([...experiences, { ...form, id }]);
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

  // Inline form JSX — NOT a nested component, so focus is never lost
  const entryForm = (
    <div className="glass rounded-xl p-5 space-y-4 mt-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Company / Institution *</label>
          <input className="input-dark" value={form.company} onChange={(e) => setField('company', e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Role / Degree *</label>
          <input className="input-dark" value={form.role} onChange={(e) => setField('role', e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Type</label>
          <select className="input-dark" value={form.type} onChange={(e) => setField('type', e.target.value)}>
            <option value="education">Education</option>
            <option value="work">Work</option>
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
        <label className="block text-xs text-slate-400 mb-1">Description</label>
        <textarea className="input-dark min-h-[70px] resize-y" value={form.description} onChange={(e) => setField('description', e.target.value)} />
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
      <button onClick={startAdd} className="btn-primary text-sm mb-4">
        <Plus size={15} /> Add Entry
      </button>

      {adding && entryForm}

      <div className="space-y-3 mt-4">
        {experiences.map((exp) => (
          <div key={exp.id}>
            <div className="glass rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-sm font-medium">{exp.role}</p>
                <p className="text-purple-400 text-xs">{exp.company}</p>
                <p className="text-slate-600 text-xs mt-0.5">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate} · {exp.type}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
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
        ))}
        {experiences.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-4">No entries yet. Click &quot;Add Entry&quot; to begin.</p>
        )}
      </div>
    </div>
  );
}
