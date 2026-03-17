/**
 * Safety guard for text cleaning functions.
 *
 * Any function that strips or replaces parts of a string MUST be wrapped
 * with this guard so that an overly aggressive regex never silently
 * empties user content.
 *
 * Rule: if cleaned.length / original.length < MIN_RATIO (0.3),
 * the cleaning is rolled back and the original text is returned.
 */

const MIN_RATIO = 0.3;

export function safeClean(
  original: string,
  cleanFn: (text: string) => string,
  label: string,
): string {
  const raw = original ?? "";
  if (raw.length === 0) return raw;

  const cleaned = cleanFn(raw);
  const ratio = cleaned.length / Math.max(1, raw.length);

  if (ratio < MIN_RATIO) {
    console.warn(
      `[SAFETY] ${label} removed too much content, fallback to original text`,
      {
        originalLength: raw.length,
        cleanedLength: cleaned.length,
        ratio,
      },
    );
    return raw;
  }

  return cleaned;
}
