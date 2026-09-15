'use client';
import { useEffect, useRef } from 'react';

interface Props {
  chart: string;
  id?: string;
}

export default function MermaidDiagram({ chart, id = 'mermaid-diagram' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#1e1033',
          primaryTextColor: '#e2e8f0',
          primaryBorderColor: 'rgba(37,99,235,0.5)',
          lineColor: '#2563eb',
          secondaryColor: '#0b0c10',
          tertiaryColor: '#0b0c10',
          edgeLabelBackground: '#0b0c10',
          fontFamily: 'ui-monospace, monospace',
          fontSize: '13px',
          attributeBackgroundColorEven: 'rgba(37,99,235,0.08)',
          attributeBackgroundColorOdd: 'rgba(6,182,212,0.05)',
        },
      });
      if (cancelled || !ref.current) return;
      const { svg } = await mermaid.render(id, chart);
      if (!cancelled && ref.current) ref.current.innerHTML = svg;
    }
    render();
    return () => { cancelled = true; };
  }, [chart, id]);

  return <div ref={ref} className="w-full overflow-x-auto" />;
}
