/**
 * Fonts for the share-preview images. Google Fonts serves a TTF (which the
 * image renderer needs) when asked for just the characters used.
 *
 * One request can fail without the fonts being gone (an address that does not
 * answer, a timeout). A card drawn without its font falls back to other fonts
 * and, being built once per deploy, would stay wrong until the next one. So
 * each font gets three tries. If all fail the card still renders, in the
 * built-in font.
 */
export async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const css = await fetch(url, { signal: AbortSignal.timeout(8000) }).then((r) => r.text());
      const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
      if (!src) continue;
      const res = await fetch(src, { signal: AbortSignal.timeout(8000) });
      if (res.ok) return await res.arrayBuffer();
    } catch {
      // try again
    }
  }
  return null;
}
