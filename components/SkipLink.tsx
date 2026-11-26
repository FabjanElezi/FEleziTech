'use client';
import { useLang } from '@/components/LanguageProvider';

/**
 * "Skip to content": off screen until a keyboard user reaches it with Tab, then it
 * jumps past the menu to the page's main content. It looks for the page's <main>,
 * so it works on every page without each page needing an id.
 */
export default function SkipLink() {
  const { t } = useLang();
  return (
    <a
      href="#main"
      className="btn-primary skip-link"
      onClick={(e) => {
        const main = document.querySelector('main');
        if (!main) return;
        e.preventDefault();
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
        main.scrollIntoView();
      }}
    >
      {t('skip.link')}
    </a>
  );
}
