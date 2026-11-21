import { sectionNumber, type SectionId } from '@/lib/sections';

/**
 * The "01 · " in front of a section's eyebrow. Hidden from screen readers:
 * the number only shows the order, the label after it says what the section is.
 */
export default function SectionNumber({ id }: { id: SectionId }) {
  return <span aria-hidden="true">{sectionNumber(id)} · </span>;
}
