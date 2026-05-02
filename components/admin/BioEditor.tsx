'use client';
import { useState } from 'react';
import { savePortfolio } from '@/lib/firestore';
import { uploadFile, generatePath, validateFile } from '@/lib/storage';
import { Portfolio } from '@/types';
import { Upload, Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  portfolio: Portfolio | null;
  onSaved: (p: Portfolio) => void;
}

const defaultForm = (): Portfolio => ({
  name: '',
  title: '',
  bio: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  location: '',
  heroTagline: '',
  profileImage: '',
  cvUrl: '',
  availableForWork: true,
  university: '',
  openToRemote: true,
});

export default function BioEditor({ portfolio, onSaved }: Props) {
  const [form, setForm] = useState<Portfolio>(portfolio ? { ...defaultForm(), ...portfolio } : defaultForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  function set(key: keyof Portfolio, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleUpload(key: 'profileImage' | 'cvUrl', e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(key);
    try {
      validateFile(file, key === 'profileImage' ? 'image' : 'document');
      const folder = key === 'profileImage' ? 'avatars' : 'cv';
      const url = await uploadFile(file, folder);
      set(key, url);
      toast.success(key === 'profileImage' ? 'Photo uploaded' : 'CV uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await savePortfolio(form);
      onSaved(form);
      toast.success('Profile saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* ── Identity ── */}
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Identity</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Full Name</label>
            <input className="input-dark" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Fabjan Elezi" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Title / Role</label>
            <input className="input-dark" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Software Engineer" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm text-slate-400 mb-1">Hero Tagline</label>
          <input className="input-dark" value={form.heroTagline || ''} onChange={(e) => set('heroTagline', e.target.value)} placeholder="Building secure, scalable digital experiences." />
        </div>
        <div className="mt-4">
          <label className="block text-sm text-slate-400 mb-1">Bio</label>
          <textarea className="input-dark min-h-[110px] resize-y" value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="A short paragraph about yourself..." />
        </div>
      </div>

      {/* ── Contact ── */}
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Contact</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input type="email" className="input-dark" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Phone</label>
            <input className="input-dark" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+355 069..." />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">LinkedIn URL</label>
            <input className="input-dark" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">GitHub URL</label>
            <input className="input-dark" value={form.github || ''} onChange={(e) => set('github', e.target.value)} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Location</label>
            <input className="input-dark" value={form.location || ''} onChange={(e) => set('location', e.target.value)} placeholder="Tirana, Albania" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">University / Institution</label>
            <input className="input-dark" value={form.university || ''} onChange={(e) => set('university', e.target.value)} placeholder="Metropolitan University of Tirana" />
          </div>
        </div>
      </div>

      {/* ── Status toggles ── */}
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Visibility & Status</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-3 cursor-pointer glass rounded-xl px-5 py-3 flex-1">
            <input
              type="checkbox"
              checked={form.availableForWork !== false}
              onChange={(e) => set('availableForWork', e.target.checked)}
              className="w-4 h-4 accent-purple-500 flex-shrink-0"
            />
            <div>
              <p className="text-sm text-white font-medium">Available for opportunities</p>
              <p className="text-xs text-slate-500">Shows the green badge on the hero section</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer glass rounded-xl px-5 py-3 flex-1">
            <input
              type="checkbox"
              checked={form.openToRemote !== false}
              onChange={(e) => set('openToRemote', e.target.checked)}
              className="w-4 h-4 accent-purple-500 flex-shrink-0"
            />
            <div>
              <p className="text-sm text-white font-medium">Open to Remote</p>
              <p className="text-xs text-slate-500">Shows &ldquo;Open to Remote&rdquo; in the About section</p>
            </div>
          </label>
        </div>
      </div>

      {/* ── Media ── */}
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Media</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Profile photo */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              {form.profileImage ? (
                <div className="relative">
                  <img src={form.profileImage} alt="Profile" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                  <button
                    type="button"
                    onClick={() => set('profileImage', '')}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))', border: '2px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}>
                  {form.name ? form.name.charAt(0).toUpperCase() : 'F'}
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-sm text-slate-400 hover:text-white transition-colors" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
                {uploading === 'profileImage' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {form.profileImage ? 'Replace' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={(e) => handleUpload('profileImage', e)} className="hidden" />
              </label>
            </div>
          </div>

          {/* CV */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">CV / Resume (PDF)</label>
            <div className="flex flex-col gap-2">
              {form.cvUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-400">CV uploaded ✓</span>
                  <button type="button" onClick={() => set('cvUrl', '')} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-sm text-slate-400 hover:text-white transition-colors w-fit" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
                {uploading === 'cvUrl' ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {form.cvUrl ? 'Replace CV' : 'Upload CV'}
                <input type="file" accept=".pdf" onChange={(e) => handleUpload('cvUrl', e)} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Save size={15} /> Save Profile</>}
      </button>
    </form>
  );
}
