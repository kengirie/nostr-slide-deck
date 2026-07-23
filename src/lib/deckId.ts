/**
 * Deck identifiers double as the `d` tag of the deck event and as the nsite
 * path segment, so they stay lowercase alphanumeric + hyphen, max 13 chars
 * (NIP-5A named-site compatible).
 */
export const DECK_ID_MAX_LENGTH = 13;
export const DECK_ID_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,11}[a-z0-9])?$/;

export function isValidDeckId(id: string): boolean {
  return id.length <= DECK_ID_MAX_LENGTH && DECK_ID_PATTERN.test(id);
}

/** Random base36 id used when a title yields no usable ASCII (e.g. Japanese). */
export function randomDeckId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

/** ASCII slug derived from a title, or '' when nothing usable remains (e.g. Japanese). */
export function asciiSlug(title: string): string {
  const ascii = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, DECK_ID_MAX_LENGTH)
    .replace(/-+$/g, '');
  return isValidDeckId(ascii) ? ascii : '';
}

/** Derive a deck id from a title, falling back to a random id. */
export function slugifyDeckId(title: string): string {
  return asciiSlug(title) || randomDeckId();
}
