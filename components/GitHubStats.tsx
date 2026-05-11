'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Star, Users, BookOpen } from 'lucide-react';

interface GitHubUser {
  public_repos: number;
  followers: number;
}

interface GitHubRepo {
  stargazers_count: number;
  language: string | null;
  fork: boolean;
}

const ease = [0.22, 1, 0.36, 1] as const;

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python:     '#3776ab',
  CSS:        '#563d7c',
  HTML:       '#e34c26',
  SQL:        '#e38c00',
  'C#':       '#239120',
  Java:       '#b07219',
  Go:         '#00add8',
  Rust:       '#dea584',
  PHP:        '#777bb4',
  Shell:      '#89e051',
};

export default function GitHubStats() {
  const [user, setUser]   = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('https://api.github.com/users/FabjanElezi').then(r => r.json()),
      fetch('https://api.github.com/users/FabjanElezi/repos?per_page=100&sort=updated').then(r => r.json()),
    ]).then(([u, r]) => {
      setUser(u);
      setRepos(Array.isArray(r) ? r : []);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);

  const langCount: Record<string, number> = {};
  repos.forEach(r => {
    if (r.language && !r.fork) langCount[r.language] = (langCount[r.language] || 0) + 1;
  });
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const stats = [
    { icon: <BookOpen size={15} className="text-purple-400" />, label: 'Repositories', value: user?.public_repos ?? '—' },
    { icon: <Star size={15} className="text-amber-400" />,      label: 'Total Stars',  value: totalStars || '—' },
    { icon: <Users size={15} className="text-cyan-400" />,      label: 'Followers',    value: user?.followers ?? '—' },
  ];

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">

        <motion.div
          className="flex items-center gap-2 mb-3"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease }}
        >
          <span className="w-8 h-px bg-purple-500" />
          <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Open Source</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.08 }}
        >
          <GitBranch size={22} className="text-white" />
          <h2 className="section-title text-white">
            GitHub <span className="gradient-text">Activity</span>
          </h2>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.14 }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex justify-center mb-2">{s.icon}</div>
              <p
                className="text-2xl font-bold mb-1"
                style={{ background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                {loaded ? s.value : '…'}
              </p>
              <p className="text-slate-500 text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Top languages */}
        {topLangs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease, delay: 0.22 }}
          >
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Top Languages</p>
            <div className="flex flex-wrap gap-2">
              {topLangs.map(([lang, count]) => (
                <span
                  key={lang}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#cbd5e1',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: LANG_COLORS[lang] ?? '#94a3b8' }}
                  />
                  {lang}
                  <span className="text-slate-600 ml-0.5">{count}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* GitHub link */}
        <motion.a
          href="https://github.com/FabjanElezi"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 text-sm text-slate-500 hover:text-white transition-colors"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease, delay: 0.3 }}
        >
          <GitBranch size={14} /> View full profile on GitHub →
        </motion.a>

      </div>
    </section>
  );
}
