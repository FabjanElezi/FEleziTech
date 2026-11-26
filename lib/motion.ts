/**
 * "Pause animations" (WCAG 2.2.2): one setting for everything that moves by itself,
 * the hero's data story, the particle background and the globe. It lives as
 * data-motion="paused" on <html> (set before the first paint by the layout's head
 * script) and is remembered in localStorage.
 */
const KEY = 'motion';

export function motionPaused(): boolean {
  return typeof document !== 'undefined' && document.documentElement.getAttribute('data-motion') === 'paused';
}

export function setMotionPaused(paused: boolean) {
  const html = document.documentElement;
  if (paused) html.setAttribute('data-motion', 'paused');
  else html.removeAttribute('data-motion');
  try {
    if (paused) localStorage.setItem(KEY, 'paused');
    else localStorage.removeItem(KEY);
  } catch { /* private mode: the choice holds for this visit only */ }
}

/** Calls `onChange` whenever the setting changes. Returns the function that stops listening. */
export function onMotionChange(onChange: () => void): () => void {
  const watch = new MutationObserver(onChange);
  watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => watch.disconnect();
}
