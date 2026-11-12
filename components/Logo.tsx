import Image from 'next/image';

interface Props {
  width: number;
  height: number;
  className?: string;
  /** For the logo at the top of the page: fetch it first. */
  priority?: boolean;
}

/**
 * The "FE" logo with the name under it.
 *
 * The name is part of the picture, and CSS cannot recolour a picture. So the
 * logo is in the page twice: `logo.svg` has a light name for the dark theme,
 * `logo-light.svg` a dark name for the light theme. `globals.css` shows the
 * one that fits (`.logo-for-dark` / `.logo-for-light`), so the right one is
 * there on the first paint and no script is involved. Both are loaded right
 * away, so the theme button can swap them at once.
 */
export default function Logo({ width, height, className = '', priority = false }: Props) {
  const load = priority
    ? ({ priority: true, fetchPriority: 'high' } as const)
    : ({ loading: 'eager' } as const);

  return (
    <>
      <Image src="/logo.svg" alt="Fabjan Elezi" width={width} height={height} className={`logo-for-dark ${className}`} {...load} />
      <Image src="/logo-light.svg" alt="Fabjan Elezi" width={width} height={height} className={`logo-for-light ${className}`} {...load} />
    </>
  );
}
