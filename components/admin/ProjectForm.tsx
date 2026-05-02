'use client';
import { useState } from 'react';
import { X, Plus, Upload, Loader2 } from 'lucide-react';
import { addProject, updateProject } from '@/lib/firestore';
import { uploadFile, generatePath, validateFile } from '@/lib/storage';
import { Project } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  project?: Project;
  onDone: () => void;
}

const empty = {
  title: '',
  description: '',
  techStack: [] as string[],
  images: [] as string[],
  githubLink: '',
  liveDemoLink: '',
  documentUrl: '',
  featured: false,
  order: 0,
};

export default function ProjectForm({ project, onDone }: Props) {
  const [form, setForm] = useState(project ? { ...project } : { ...empty });
  const [techInput, setTechInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addTech() {
    const tag = techInput.trim();
    if (!tag || form.techStack.includes(tag)) return;
    set('techStack', [...form.techStack, tag]);
    setTechInput('');
  }

  function removeTech(t: string) {
    set('techStack', form.techStack.filter((x) => x !== t));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const f of files) validateFile(f, 'image');
      const urls = await Promise.all(files.map((f) => uploadFile(f, 'projects')));
      set('images', [...form.images, ...urls]);
      toast.success('Images uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      validateFile(file, 'document');
      const url = await uploadFile(file, 'documents');
      set('documentUrl', url);
      toast.success('Document uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { id, createdAt, ...data } = form as Project;
      if (project) {
        await updateProject(project.id, data);
        toast.success('Project updated');
      } else {
        await addProject(data);
        toast.success('Project added');
      }
      onDone();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Title *</label>
          <input
            className="input-dark"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            placeholder="My Awesome Project"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Order</label>
          <input
            type="number"
            className="input-dark"
            value={form.order}
            onChange={(e) => set('order', Number(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Description *</label>
        <textarea
          className="input-dark min-h-[90px] resize-y"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          placeholder="What this project does and why it matters..."
        />
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Tech Stack</label>
        <div className="flex gap-2 mb-2">
          <input
            className="input-dark"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); }}}
            placeholder="React, TypeScript, Firebase..."
          />
          <button type="button" onClick={addTech} className="btn-ghost px-3 py-2 flex-shrink-0">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.techStack.map((t) => (
            <span key={t} className="tech-tag flex items-center gap-1">
              {t}
              <button type="button" onClick={() => removeTech(t)} className="hover:text-red-400 transition-colors ml-0.5">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">GitHub Link</label>
          <input
            className="input-dark"
            value={form.githubLink}
            onChange={(e) => set('githubLink', e.target.value)}
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Live Demo Link</label>
          <input
            className="input-dark"
            value={form.liveDemoLink}
            onChange={(e) => set('liveDemoLink', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Project Images</label>
        <label
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-colors"
          style={{ border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
        >
          {uploading ? (
            <Loader2 size={20} className="text-purple-400 animate-spin" />
          ) : (
            <Upload size={20} className="text-slate-500" />
          )}
          <span className="text-xs text-slate-500">Click to upload images (JPG, PNG, WebP)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        {form.images.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {form.images.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document upload */}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Project Document (PDF)</label>
        <label
          className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors"
          style={{ border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
        >
          <Upload size={16} className="text-slate-500" />
          <span className="text-xs text-slate-500">
            {form.documentUrl ? 'Document uploaded — click to replace' : 'Upload PDF document (optional)'}
          </span>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleDocUpload} className="hidden" />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="featured"
          checked={form.featured}
          onChange={(e) => set('featured', e.target.checked)}
          className="w-4 h-4 accent-purple-500"
        />
        <label htmlFor="featured" className="text-sm text-slate-400">
          Mark as Featured
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : (project ? 'Update Project' : 'Add Project')}
        </button>
        <button type="button" onClick={onDone} className="btn-ghost px-4">
          Cancel
        </button>
      </div>
    </form>
  );
}
