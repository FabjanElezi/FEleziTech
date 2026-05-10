'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Database, GitBranch } from 'lucide-react';

const MermaidDiagram = dynamic(() => import('@/components/MermaidDiagram'), { ssr: false });

const ER_DIAGRAM = `erDiagram
    DEVELOPER {
        int developer_id PK
        varchar name
        varchar country
    }
    PUBLISHER {
        int publisher_id PK
        varchar name
        varchar country
    }
    GENRE {
        int genre_id PK
        varchar name
    }
    PLATFORM {
        int platform_id PK
        varchar name
    }
    GAME {
        int game_id PK
        varchar title
        year release_year
        int developer_id FK
        int publisher_id FK
    }
    USER {
        int user_id PK
        varchar username
        varchar email
    }
    GAME_GENRE {
        int game_id FK
        int genre_id FK
    }
    GAME_PLATFORM {
        int game_id FK
        int platform_id FK
    }
    BORROWING {
        int borrowing_id PK
        int user_id FK
        int game_id FK
        date borrow_date
        date return_date
    }

    DEVELOPER ||--o{ GAME : "develops"
    PUBLISHER  ||--o{ GAME : "publishes"
    GAME       }o--o{ GENRE    : "game_genre"
    GAME       }o--o{ PLATFORM : "game_platform"
    USER       ||--o{ BORROWING : "borrows"
    GAME       ||--o{ BORROWING : "borrowed in"
`;

const TABLES = [
  { name: 'developer', color: 'purple', desc: 'Game studio info' },
  { name: 'publisher', color: 'cyan', desc: 'Publishing company info' },
  { name: 'genre', color: 'emerald', desc: 'Game categories' },
  { name: 'platform', color: 'amber', desc: 'Gaming platforms' },
  { name: 'game', color: 'purple', desc: 'Core game records' },
  { name: 'user', color: 'cyan', desc: 'Library members' },
  { name: 'game_genre', color: 'slate', desc: 'M:N game ↔ genre' },
  { name: 'game_platform', color: 'slate', desc: 'M:N game ↔ platform' },
  { name: 'borrowing', color: 'emerald', desc: 'Borrow & return log' },
];

const colorMap: Record<string, string> = {
  purple:  'rgba(124,58,237,0.15)',
  cyan:    'rgba(6,182,212,0.12)',
  emerald: 'rgba(16,185,129,0.12)',
  amber:   'rgba(245,158,11,0.12)',
  slate:   'rgba(100,116,139,0.12)',
};
const borderMap: Record<string, string> = {
  purple:  'rgba(124,58,237,0.35)',
  cyan:    'rgba(6,182,212,0.35)',
  emerald: 'rgba(16,185,129,0.35)',
  amber:   'rgba(245,158,11,0.35)',
  slate:   'rgba(100,116,139,0.3)',
};
const textMap: Record<string, string> = {
  purple:  '#c4b5fd',
  cyan:    '#67e8f9',
  emerald: '#6ee7b7',
  amber:   '#fcd34d',
  slate:   '#94a3b8',
};

export default function VideoGameLibraryPage() {
  return (
    <div className="min-h-screen px-6 py-16" style={{ background: '#040712' }}>
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-10"
        >
          <ArrowLeft size={15} /> Back to Portfolio
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-px bg-purple-500" />
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Database Project</span>
            <span className="w-8 h-px bg-cyan-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Video Game <span style={{ background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Library</span>
          </h1>
          <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
            A relational MySQL database for managing a video game lending library. Tracks games, developers, publishers, genres, platforms, users, and borrow history — with proper normalisation and foreign key constraints.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            {['MySQL', 'SQL', 'Relational DB', 'ER Design', 'Normalisation'].map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#c4b5fd' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Tables', value: '9' },
            { label: 'Relationships', value: '6' },
            { label: 'M:N Junctions', value: '2' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg,#a78bfa,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ER Diagram */}
        <div
          className="rounded-2xl p-6 mb-12"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Database size={16} className="text-cyan-400" />
            <h2 className="text-white font-semibold">Entity Relationship Diagram</h2>
          </div>
          <MermaidDiagram chart={ER_DIAGRAM} id="er-diagram" />
        </div>

        {/* Table overview */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <GitBranch size={16} className="text-purple-400" />
            <h2 className="text-white font-semibold">Table Overview</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TABLES.map((t) => (
              <div
                key={t.name}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: colorMap[t.color], border: `1px solid ${borderMap[t.color]}` }}
              >
                <span className="font-mono text-sm font-semibold" style={{ color: textMap[t.color] }}>{t.name}</span>
                <span className="text-slate-500 text-xs">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SQL snippet */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white font-semibold mb-4">Schema Snippet — Core Relations</h2>
          <pre
            className="text-xs leading-relaxed overflow-x-auto"
            style={{ color: '#94a3b8', fontFamily: 'ui-monospace, monospace' }}
          >
{`-- game references developer & publisher
CREATE TABLE game (
    game_id      INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(150) NOT NULL,
    release_year YEAR,
    developer_id INT,
    publisher_id INT,
    FOREIGN KEY (developer_id) REFERENCES developer(developer_id),
    FOREIGN KEY (publisher_id) REFERENCES publisher(publisher_id)
);

-- M:N — a game can belong to many genres
CREATE TABLE game_genre (
    game_id  INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (game_id, genre_id),
    FOREIGN KEY (game_id)  REFERENCES game(game_id),
    FOREIGN KEY (genre_id) REFERENCES genre(genre_id)
);

-- borrowing tracks who borrowed what and when
CREATE TABLE borrowing (
    borrowing_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT  NOT NULL,
    game_id      INT  NOT NULL,
    borrow_date  DATE NOT NULL,
    return_date  DATE,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (game_id) REFERENCES game(game_id)
);`}
          </pre>
        </div>

      </div>
    </div>
  );
}
