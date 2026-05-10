'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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
  {
    name: 'game',
    cols: [
      { name: 'game_id', type: 'INT', note: 'PK, AUTO_INCREMENT' },
      { name: 'title', type: 'VARCHAR(150)', note: 'NOT NULL' },
      { name: 'release_year', type: 'YEAR', note: '' },
      { name: 'developer_id', type: 'INT', note: 'FK → developer' },
      { name: 'publisher_id', type: 'INT', note: 'FK → publisher' },
    ],
  },
  {
    name: 'user',
    cols: [
      { name: 'user_id', type: 'INT', note: 'PK, AUTO_INCREMENT' },
      { name: 'username', type: 'VARCHAR(50)', note: 'UNIQUE, NOT NULL' },
      { name: 'email', type: 'VARCHAR(100)', note: 'UNIQUE, NOT NULL' },
    ],
  },
  {
    name: 'borrowing',
    cols: [
      { name: 'borrowing_id', type: 'INT', note: 'PK, AUTO_INCREMENT' },
      { name: 'user_id', type: 'INT', note: 'FK → user, NOT NULL' },
      { name: 'game_id', type: 'INT', note: 'FK → game, NOT NULL' },
      { name: 'borrow_date', type: 'DATE', note: 'NOT NULL' },
      { name: 'return_date', type: 'DATE', note: 'nullable' },
    ],
  },
  {
    name: 'developer',
    cols: [
      { name: 'developer_id', type: 'INT', note: 'PK, AUTO_INCREMENT' },
      { name: 'name', type: 'VARCHAR(100)', note: 'NOT NULL' },
      { name: 'country', type: 'VARCHAR(50)', note: '' },
    ],
  },
  {
    name: 'publisher',
    cols: [
      { name: 'publisher_id', type: 'INT', note: 'PK, AUTO_INCREMENT' },
      { name: 'name', type: 'VARCHAR(100)', note: 'NOT NULL' },
      { name: 'country', type: 'VARCHAR(50)', note: '' },
    ],
  },
  {
    name: 'genre',
    cols: [
      { name: 'genre_id', type: 'INT', note: 'PK, AUTO_INCREMENT' },
      { name: 'name', type: 'VARCHAR(50)', note: 'UNIQUE, NOT NULL' },
    ],
  },
];

const RELATIONS = [
  { from: 'game', to: 'developer', type: 'MANY → ONE', via: 'developer_id', label: 'A game has one developer' },
  { from: 'game', to: 'publisher', type: 'MANY → ONE', via: 'publisher_id', label: 'A game has one publisher' },
  { from: 'game', to: 'genre', type: 'MANY ↔ MANY', via: 'game_genre', label: 'Junction table, composite PK' },
  { from: 'game', to: 'platform', type: 'MANY ↔ MANY', via: 'game_platform', label: 'Junction table, composite PK' },
  { from: 'user', to: 'borrowing', type: 'ONE → MANY', via: 'user_id', label: 'A user can borrow many games' },
  { from: 'game', to: 'borrowing', type: 'ONE → MANY', via: 'game_id', label: 'A game can be borrowed many times' },
];

const KW = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#ff7b72' }}>{children}</span>
);
const TBL = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#ffa657' }}>{children}</span>
);
const COL = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#79c0ff' }}>{children}</span>
);
const CMT = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#8b949e' }}>{children}</span>
);
const STR = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: '#a5d6ff' }}>{children}</span>
);

function SqlBlock() {
  const lines: React.ReactNode[] = [
    <><CMT>-- Core tables and constraints</CMT>{'\n'}</>,
    <><KW>CREATE TABLE </KW><TBL>game</TBL>{' ('}{'\n'}</>,
    <>{'    '}<COL>game_id</COL>{'     '}<STR>INT</STR><KW> AUTO_INCREMENT PRIMARY KEY</KW>{','}{'\n'}</>,
    <>{'    '}<COL>title</COL>{'       '}<STR>VARCHAR(150)</STR><KW> NOT NULL</KW>{','}{'\n'}</>,
    <>{'    '}<COL>release_year</COL>{'  '}<STR>YEAR</STR>{','}{'\n'}</>,
    <>{'    '}<COL>developer_id</COL>{'  '}<STR>INT</STR>{'  '}<KW>REFERENCES </KW><TBL>developer</TBL>{'('}<COL>developer_id</COL>{')'},{'\n'}</>,
    <>{'    '}<COL>publisher_id</COL>{'   '}<STR>INT</STR>{'  '}<KW>REFERENCES </KW><TBL>publisher</TBL>{'('}<COL>publisher_id</COL>{')'}{'\n'}</>,
    <>{');\n\n'}</>,
    <><CMT>-- M:N junction: a game can span many genres</CMT>{'\n'}</>,
    <><KW>CREATE TABLE </KW><TBL>game_genre</TBL>{' ('}{'\n'}</>,
    <>{'    '}<COL>game_id</COL>{'   '}<STR>INT</STR><KW> NOT NULL REFERENCES </KW><TBL>game</TBL>{'('}<COL>game_id</COL>{'),'}{'\n'}</>,
    <>{'    '}<COL>genre_id</COL>{'  '}<STR>INT</STR><KW> NOT NULL REFERENCES </KW><TBL>genre</TBL>{'('}<COL>genre_id</COL>{'),'}{'\n'}</>,
    <>{'    '}<KW>PRIMARY KEY</KW>{'('}<COL>game_id</COL>{', '}<COL>genre_id</COL>{')'}{'\n'}</>,
    <>{');\n\n'}</>,
    <><CMT>-- Borrow log: tracks who borrowed what and when</CMT>{'\n'}</>,
    <><KW>CREATE TABLE </KW><TBL>borrowing</TBL>{' ('}{'\n'}</>,
    <>{'    '}<COL>borrowing_id</COL>{'  '}<STR>INT</STR><KW>  AUTO_INCREMENT PRIMARY KEY</KW>{','}{'\n'}</>,
    <>{'    '}<COL>user_id</COL>{'      '}<STR>INT</STR><KW>  NOT NULL REFERENCES </KW><TBL>user</TBL>{'('}<COL>user_id</COL>{'),'}{'\n'}</>,
    <>{'    '}<COL>game_id</COL>{'      '}<STR>INT</STR><KW>  NOT NULL REFERENCES </KW><TBL>game</TBL>{'('}<COL>game_id</COL>{'),'}{'\n'}</>,
    <>{'    '}<COL>borrow_date</COL>{'  '}<STR>DATE</STR><KW>  NOT NULL</KW>{','}{'\n'}</>,
    <>{'    '}<COL>return_date</COL>{'  '}<STR>DATE</STR>{'\n'}</>,
    <>{');\n\n'}</>,
    <><CMT>-- Performance indexes</CMT>{'\n'}</>,
    <><KW>CREATE INDEX </KW><COL>idx_game_title</COL><KW>    ON </KW><TBL>game</TBL>{'('}<COL>title</COL>{');'}{'\n'}</>,
    <><KW>CREATE INDEX </KW><COL>idx_borrowing_user</COL><KW> ON </KW><TBL>borrowing</TBL>{'('}<COL>user_id</COL>{');'}{'\n'}</>,
    <><KW>CREATE INDEX </KW><COL>idx_borrowing_game</COL><KW> ON </KW><TBL>borrowing</TBL>{'('}<COL>game_id</COL>{');'}</>,
  ];
  return <>{lines.map((l, i) => <React.Fragment key={i}>{l}</React.Fragment>)}</>;
}

export default function VideoGameLibraryPage() {
  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: '#e6edf3' }}>

      {/* Top bar */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #30363d', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ color: '#8b949e' }}>◈</span>
          <span style={{ color: '#8b949e' }}>videogame_library</span>
          <span style={{ color: '#30363d' }}>/</span>
          <span style={{ color: '#e6edf3' }}>schema.sql</span>
        </div>
        <Link
          href="/#projects"
          style={{ fontSize: 12, color: '#58a6ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          ← portfolio
        </Link>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Title */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>
            <CMT>-- MySQL · Relational Database Design · InnoDB</CMT>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e6edf3', margin: 0, letterSpacing: -0.5 }}>
            Video Game Library <span style={{ color: '#3fb950' }}>Database</span>
          </h1>
          <p style={{ color: '#8b949e', fontSize: 14, marginTop: 10, lineHeight: 1.6, maxWidth: 600 }}>
            A normalised relational schema for managing a video game lending library.
            Tracks games, studios, genres, platforms, members, and borrow history.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {['MySQL', 'InnoDB', 'Foreign Keys', 'M:N Relations', 'Normalised'].map(t => (
              <span key={t} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
          {[
            { label: 'Tables', value: '9', color: '#3fb950' },
            { label: 'Relations', value: '6', color: '#58a6ff' },
            { label: 'M:N Junctions', value: '2', color: '#ffa657' },
            { label: 'Indexes', value: '3', color: '#f78166' },
          ].map(s => (
            <div key={s.label} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#8b949e', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ER Diagram */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f78166', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffa657', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#3fb950', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 8 }}>ER Diagram — videogame_library</span>
          </div>
          <div style={{ padding: 24 }}>
            <MermaidDiagram chart={ER_DIAGRAM} id="er-diagram" />
          </div>
        </div>

        {/* Table definitions */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16 }}>
            <CMT>-- Table Definitions (core tables)</CMT>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {TABLES.map(t => (
              <div key={t.name} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ padding: '8px 14px', borderBottom: '1px solid #30363d', background: '#21262d' }}>
                  <span style={{ fontSize: 12 }}>
                    <KW>TABLE</KW> <TBL>{t.name}</TBL>
                  </span>
                </div>
                {/* Columns */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <tbody>
                    {t.cols.map(col => (
                      <tr key={col.name} style={{ borderBottom: '1px solid #21262d' }}>
                        <td style={{ padding: '5px 14px', color: '#79c0ff' }}>{col.name}</td>
                        <td style={{ padding: '5px 6px', color: '#ffa657', whiteSpace: 'nowrap' }}>{col.type}</td>
                        <td style={{ padding: '5px 14px 5px 0', color: '#8b949e', fontSize: 10 }}>{col.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* Relations */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16 }}>
            <CMT>-- Foreign Key Relationships</CMT>
          </div>
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #30363d', background: '#21262d' }}>
                  <th style={{ padding: '8px 14px', color: '#8b949e', fontWeight: 500, textAlign: 'left' }}>From</th>
                  <th style={{ padding: '8px 14px', color: '#8b949e', fontWeight: 500, textAlign: 'left' }}>To</th>
                  <th style={{ padding: '8px 14px', color: '#8b949e', fontWeight: 500, textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '8px 14px', color: '#8b949e', fontWeight: 500, textAlign: 'left' }}>Via</th>
                  <th style={{ padding: '8px 14px', color: '#8b949e', fontWeight: 500, textAlign: 'left' }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {RELATIONS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #21262d' }}>
                    <td style={{ padding: '7px 14px' }}><TBL>{r.from}</TBL></td>
                    <td style={{ padding: '7px 14px' }}><TBL>{r.to}</TBL></td>
                    <td style={{ padding: '7px 14px' }}>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 4,
                        background: r.type.includes('↔') ? 'rgba(255,164,87,0.12)' : 'rgba(63,185,80,0.1)',
                        color: r.type.includes('↔') ? '#ffa657' : '#3fb950',
                        border: `1px solid ${r.type.includes('↔') ? 'rgba(255,164,87,0.3)' : 'rgba(63,185,80,0.25)'}`,
                      }}>{r.type}</span>
                    </td>
                    <td style={{ padding: '7px 14px' }}><COL>{r.via}</COL></td>
                    <td style={{ padding: '7px 14px', color: '#8b949e', fontSize: 11 }}>{r.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SQL snippet */}
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #30363d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#f78166', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffa657', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#3fb950', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#8b949e', marginLeft: 8 }}>schema.sql</span>
          </div>
          <pre style={{ margin: 0, padding: '20px 24px', fontSize: 12, lineHeight: 1.8, overflowX: 'auto', color: '#e6edf3' }}>
            <SqlBlock />
          </pre>
        </div>

      </div>
    </div>
  );
}
