'use client';
import { useState } from 'react';
import { addSkill, updateSkill, deleteSkill } from '@/lib/firestore';
import { Skill } from '@/types';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  skills: Skill[];
  onChanged: (items: Skill[]) => void;
}

const CATEGORIES: Skill['category'][] = ['technical', 'language', 'tool'];
const CATEGORY_LABELS: Record<Skill['category'], string> = {
  technical: 'Technical Skills',
  language: 'Languages',
  tool: 'Tools & Software',
};

export default function SkillsEditor({ skills, onChanged }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Skill['category']>('technical');
  const [level, setLevel] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; category: Skill['category']; level: string }>({ name: '', category: 'technical', level: '' });
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const data: Omit<Skill, 'id'> = { name: name.trim(), category, level: level.trim() || undefined, order: skills.length };
      const id = await addSkill(data);
      onChanged([...skills, { ...data, id }]);
      setName('');
      setLevel('');
      setAdding(false);
      toast.success('Skill added');
    } catch {
      toast.error('Failed to add skill');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(skill: Skill) {
    setEditingId(skill.id);
    setEditForm({ name: skill.name, category: skill.category, level: skill.level || '' });
  }

  async function saveEdit(id: string) {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      const update = { name: editForm.name.trim(), category: editForm.category, level: editForm.level.trim() || undefined };
      await updateSkill(id, update);
      onChanged(skills.map((s) => s.id === id ? { ...s, ...update } : s));
      setEditingId(null);
      toast.success('Skill updated');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this skill?')) return;
    try {
      await deleteSkill(id);
      onChanged(skills.filter((s) => s.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Delete failed');
    }
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Add new skill */}
      {!adding ? (
        <button onClick={() => setAdding(true)} className="btn-primary text-sm">
          <Plus size={15} /> Add Skill
        </button>
      ) : (
        <div className="glass rounded-xl p-5 space-y-3">
          <p className="text-sm font-semibold text-slate-300">New Skill</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Skill Name *</label>
              <input
                className="input-dark"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                placeholder="e.g. Python, React, Figma"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select className="input-dark" value={category} onChange={(e) => setCategory(e.target.value as Skill['category'])}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Level (optional)</label>
              <input className="input-dark" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Fluent, Basic…" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={add} disabled={saving || !name.trim()} className="btn-primary text-sm py-1.5">
              {saving ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Add</>}
            </button>
            <button type="button" onClick={() => { setAdding(false); setName(''); setLevel(''); }} className="btn-ghost text-sm py-1.5">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skills grouped by category */}
      {CATEGORIES.map((cat) => {
        const items = grouped[cat] || [];
        if (!items.length) return null;
        return (
          <div key={cat}>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-semibold">{CATEGORY_LABELS[cat]}</h3>
            <div className="space-y-2">
              {items.map((skill) =>
                editingId === skill.id ? (
                  <div key={skill.id} className="glass rounded-xl p-4 space-y-3">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Name</label>
                        <input
                          className="input-dark"
                          value={editForm.name}
                          onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Category</label>
                        <select className="input-dark" value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value as Skill['category'] }))}>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Level</label>
                        <input className="input-dark" value={editForm.level} onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))} placeholder="Fluent, Basic…" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => saveEdit(skill.id)} disabled={saving} className="btn-primary text-sm py-1">
                        {saving ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Check size={13} /> Save</>}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-ghost text-sm py-1">
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={skill.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white text-sm font-medium">{skill.name}</span>
                      {skill.level && <span className="text-xs text-slate-500">· {skill.level}</span>}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button onClick={() => startEdit(skill)} className="p-1.5 text-slate-500 hover:text-white transition-colors" aria-label="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => remove(skill.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}

      {skills.length === 0 && !adding && (
        <p className="text-slate-600 text-sm text-center py-6">No skills yet. Click &quot;Add Skill&quot; to begin.</p>
      )}
    </div>
  );
}
