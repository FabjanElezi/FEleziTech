/**
 * "11/2026": the month the CV was uploaded, read from its stored file name
 * (…/cv/1795268546591-….pdf carries the upload time), so the label stays true
 * whenever a new CV is uploaded in /admin. Null if the name carries no time.
 */
export function cvUpdated(cvUrl?: string): string | null {
  const m = /\/(\d{13})-[^/]*$/.exec(cvUrl ?? '');
  if (!m) return null;
  const d = new Date(Number(m[1]));
  return `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

/** "CV (EN, PDF, updated 11/2026)", or "CV (EN, PDF)" when the date can't be read. */
export function cvLabel(cvUrl: string | undefined, t: (key: string) => string): string {
  const updated = cvUpdated(cvUrl);
  return updated ? t('cv.label').replace('{date}', updated) : t('cv.labelPlain');
}
