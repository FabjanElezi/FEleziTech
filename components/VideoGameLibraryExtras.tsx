'use client';
import dynamic from 'next/dynamic';
import { useLang } from '@/components/LanguageProvider';

const MermaidDiagram = dynamic(() => import('@/components/MermaidDiagram'), { ssr: false });

// The diagram and the schema excerpt are the ones the page showed before it became a case study.
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

const SCHEMA = `-- game references developer & publisher
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
);`;

export default function VideoGameLibraryExtras() {
  const { t } = useLang();
  return (
    <div className="space-y-5 mt-5">
      <div>
        <h3 className="text-white text-sm font-semibold mb-2">{t('cs.erDiagram')}</h3>
        <div className="glass rounded-2xl p-4">
          <MermaidDiagram chart={ER_DIAGRAM} id="er-diagram" />
        </div>
      </div>
      <div>
        <h3 className="text-white text-sm font-semibold mb-2">{t('cs.schema')}</h3>
        <div className="glass rounded-2xl p-4">
          <pre className="text-xs leading-relaxed overflow-x-auto text-slate-400 font-mono">{SCHEMA}</pre>
        </div>
      </div>
    </div>
  );
}
