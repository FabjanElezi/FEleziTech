import Image from 'next/image';

interface Props {
  width: number;
  height: number;
  className?: string;
  /** For the logo at the top of the page: fetch it first. */
  priority?: boolean;
  /** The FE mark alone, without the name under it (the menu bar). */
  mark?: boolean;
}

/**
 * The "FE" logo. The middle bar of the E is the infinity sign of RevoWeb, his
 * web studio, so the two brands share a sign. With `mark` it is the letters
 * alone; without it the name stands under them (footer).
 *
 * The logo is a picture, and CSS cannot recolour a picture. So it is in the
 * page twice: one file for the dark theme (bright cyan, light name) and one for
 * the light theme (deeper teal, dark name). `globals.css` shows the one that
 * fits (`.logo-for-dark` / `.logo-for-light`), so the right one is there on
 * the first paint and no script is involved. Both are loaded right away, so the
 * theme button can swap them at once.
 */
export default function Logo({ width, height, className = '', priority = false, mark = false }: Props) {
  const load = priority
    ? ({ priority: true, fetchPriority: 'high' } as const)
    : ({ loading: 'eager' } as const);
  const dark = mark ? '/logo-mark.svg' : '/logo.svg';
  const light = mark ? '/logo-mark-light.svg' : '/logo-light.svg';

  return (
    <>
      <Image src={dark} alt="Fabjan Elezi" width={width} height={height} className={`logo-for-dark ${className}`} {...load} />
      <Image src={light} alt="Fabjan Elezi" width={width} height={height} className={`logo-for-light ${className}`} {...load} />
    </>
  );
}
