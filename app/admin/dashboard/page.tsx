'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import {
  getPortfolio, getProjects, getExperiences, getSkills,
  deleteProject,
} from '@/lib/firestore';
import { seedInitialData } from '@/lib/seed';
import { Portfolio, Project, Experience, Skill } from '@/types';
import BioEditor from '@/components/admin/BioEditor';
import ProjectForm from '@/components/admin/ProjectForm';
import ExperienceEditor from '@/components/admin/ExperienceEditor';
import SkillsEditor from '@/components/admin/SkillsEditor';
import {
  User, FolderOpen, Briefcase, Code2, LogOut,
  Plus, Pencil, Trash2, ExternalLink, Database,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'bio' | 'projects' | 'experience' | 'skills';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('bio');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null | 'new'>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/admin/login');
  }, [user, loading, router]);

  const load = useCallback(async () => {
    setDataLoading(true);
    try {
      const [p, pr, ex, sk] = await Promise.all([
        getPortfolio(),
        getProjects(),
        getExperiences(),
        getSkills(),
      ]);
      setPortfolio(p);
      setProjects(pr);
      setExperiences(ex);
      setSkills(sk);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  async function handleSeed() {
    if (!confirm('This will populate initial data from your CV. Continue?')) return;
    setSeeding(true);
    try {
      await seedInitialData();
      await load();
      toast.success('Initial data seeded!');
    } catch {
      toast.error('Seed failed');
    } finally {
      setSeeding(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id);
    setProjects((p) => p.filter((x) => x.id !== id));
    toast.success('Deleted');
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#040712' }}>
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'bio', label: 'Profile', icon: <User size={16} /> },
    { id: 'projects', label: 'Projects', icon: <FolderOpen size={16} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={16} /> },
    { id: 'skills', label: 'Skills', icon: <Code2 size={16} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#040712' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 h-14 flex items-center justify-between"
        style={{ background: 'rgba(4,7,18,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Fabjan Elezi" width={80} height={26} className="object-contain" />
          <span className="text-slate-500 text-xs">Admin Panel</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-xs hidden sm:block">{user.email}</span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs py-1 px-3 flex items-center gap-1">
            <ExternalLink size={12} /> View Site
          </a>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-ghost text-xs py-1 px-3 flex items-center gap-1"
            title="Seed initial data from CV"
          >
            {seeding ? <RefreshCw size={12} className="animate-spin" /> : <Database size={12} />}
            <span className="hidden sm:inline">Seed Data</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition-colors text-sm">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-8 w-fit"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                tab === t.id
                  ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white' }
                  : { color: '#64748b' }
              }
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 sm:p-8">
            {/* ── Bio ── */}
            {tab === 'bio' && (
              <div>
                <h2 className="text-lg font-bold text-white mb-6">Edit Profile</h2>
                <BioEditor portfolio={portfolio} onSaved={setPortfolio} />
              </div>
            )}

            {/* ── Projects ── */}
            {tab === 'projects' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Projects ({projects.length})</h2>
                  {editingProject === null && (
                    <button onClick={() => setEditingProject('new')} className="btn-primary text-sm py-1.5">
                      <Plus size={15} /> Add Project
                    </button>
                  )}
                </div>

                {editingProject === 'new' && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">New Project</h3>
                    <ProjectForm onDone={() => { setEditingProject(null); load(); }} />
                  </div>
                )}

                {editingProject && editingProject !== 'new' && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4">Edit Project</h3>
                    <ProjectForm project={editingProject} onDone={() => { setEditingProject(null); load(); }} />
                  </div>
                )}

                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p.id} className="glass rounded-xl p-4 flex items-center justify-between gap-3" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(124,58,237,0.2)' }}>
                            📁
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{p.title}</p>
                          <p className="text-slate-500 text-xs truncate">{p.techStack.slice(0, 3).join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setEditingProject(p)} className="p-1.5 text-slate-500 hover:text-white transition-colors" aria-label="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteProject(p.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && !editingProject && (
                    <p className="text-slate-600 text-sm text-center py-8">No projects yet. Add your first project!</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Experience ── */}
            {tab === 'experience' && (
              <div>
                <h2 className="text-lg font-bold text-white mb-6">Experience &amp; Education</h2>
                <ExperienceEditor experiences={experiences} onChanged={setExperiences} />
              </div>
            )}

            {/* ── Skills ── */}
            {tab === 'skills' && (
              <div>
                <h2 className="text-lg font-bold text-white mb-6">Skills</h2>
                <SkillsEditor skills={skills} onChanged={setSkills} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
