/**
 * The home page's sections, in menu order. The top menu is built from this
 * list and each section heading takes its number from it ("01 · About Me"),
 * so the menu and the numbers always agree.
 */
export const SECTIONS = [
  { id: 'about',      label: 'nav.about' },
  { id: 'skills',     label: 'nav.skills' },
  { id: 'experience', label: 'nav.experience' },
  { id: 'projects',   label: 'nav.projects' },
  { id: 'contact',    label: 'nav.contact' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

/** "01" for the first section in the menu, "02" for the second, and so on. */
export function sectionNumber(id: SectionId): string {
  return String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0');
}
