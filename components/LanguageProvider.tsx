'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_LANG, isLang, Lang, localized, translate } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** A UI string. */
  t: (key: string) => string;
  /** A database field in the current language, falling back to English. */
  L: (row: object | null | undefined, field: string) => string;
};

const LanguageContext = createContext<Ctx>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (k) => translate(DEFAULT_LANG, k),
  L: (row, field) => localized(row, field, DEFAULT_LANG),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // English on the server and on the first paint, so the markup always matches;
  // a stored choice is applied immediately afterwards.
  const [lang, setStored] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the stored language is only readable in the browser
      if (isLang(saved)) setStored(saved);
    } catch { /* private mode */ }
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setStored(l);
    try { localStorage.setItem('lang', l); } catch { /* private mode */ }
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);
  const L = useCallback(
    (row: object | null | undefined, field: string) => localized(row, field, lang),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, L }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
