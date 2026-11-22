'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  chart: string;
  id?: string;
}

const FONT = { fontFamily: 'ui-monospace, monospace', fontSize: '13px' };

// Dark: the colours the diagram always had. Light: the light theme's own page,
// ink and teal colours, so the diagram stays readable after the theme switch.
const DARK = {
  primaryColor: '#1e1033',
  primaryTextColor: '#e2e8f0',
  primaryBorderColor: 'rgba(8,145,178,0.5)',
  lineColor: '#0891b2',
  secondaryColor: '#0d121c',
  tertiaryColor: '#0d121c',
  edgeLabelBackground: '#0d121c',
  attributeBackgroundColorEven: 'rgba(8,145,178,0.08)',
  attributeBackgroundColorOdd: 'rgba(6,182,212,0.05)',
  ...FONT,
};
const LIGHT = {
  primaryColor: '#ffffff',
  primaryTextColor: '#0b1220',
  primaryBorderColor: 'rgba(8,145,178,0.5)',
  lineColor: '#0e7490',
  secondaryColor: '#f2f3ff',
  tertiaryColor: '#f2f3ff',
  edgeLabelBackground: '#f2f3ff',
  attributeBackgroundColorEven: 'rgba(8,145,178,0.08)',
  attributeBackgroundColorOdd: 'rgba(6,182,212,0.05)',
  ...FONT,
};

const isLight = () =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';

export default function MermaidDiagram({ chart, id = 'mermaid-diagram' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const renders = useRef(0);
  // The diagram is only drawn in the browser (it is loaded with ssr: false), so the theme can be read at once.
  const [light, setLight] = useState(isLight);

  // Follow the light/dark switch.
  useEffect(() => {
    const watch = new MutationObserver(() => setLight(isLight()));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => watch.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: light ? 'base' : 'dark',
        themeVariables: light ? LIGHT : DARK,
      });
      if (cancelled || !ref.current) return;
      // A fresh id per drawing, so redrawing for the other theme never clashes with the last one.
      const { svg } = await mermaid.render(`${id}-${++renders.current}`, chart);
      if (!cancelled && ref.current) ref.current.innerHTML = svg;
    }
    render();
    return () => { cancelled = true; };
  }, [chart, id, light]);

  return <div ref={ref} className="w-full overflow-x-auto" />;
}
