/**
 * The RevoWeb logo: the infinity whose line runs from the purple of the Reels into
 * the cyan of this site, with the white point where it crosses, and the name with
 * "Web" in the same gradient. Mark and proportions are the ones from the RevoWeb
 * brand sheet (mark 132x59 beside 76px Geist Bold, 34px apart).
 *
 * It scales with the font size of `.rw-logo`; the colours are in globals.css, so
 * the light page gets deeper tones that stay readable on white.
 */
export default function RevoWebLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`rw-logo ${className}`} role="img" aria-label="RevoWeb">
      <svg className="rw-logo-mark" viewBox="0 0 76 34" aria-hidden="true">
        <defs>
          <linearGradient id="rw-line" gradientUnits="userSpaceOnUse" x1="7" y1="17" x2="69" y2="17">
            <stop offset="0" className="rw-s1" />
            <stop offset=".38" className="rw-s2" />
            <stop offset=".72" className="rw-s3" />
            <stop offset="1" className="rw-s4" />
          </linearGradient>
        </defs>
        <path
          d="M38 17 C30 4 7 3 7 17 C7 31 30 30 38 17 C46 4 69 3 69 17 C69 31 46 30 38 17 Z"
          fill="none"
          stroke="url(#rw-line)"
          strokeWidth="5.8"
          strokeLinejoin="round"
        />
        <circle className="rw-dot" cx="38" cy="17" r="3.1" />
      </svg>
      <span className="rw-logo-word" aria-hidden="true">
        Revo<b>Web</b>
      </span>
    </span>
  );
}
