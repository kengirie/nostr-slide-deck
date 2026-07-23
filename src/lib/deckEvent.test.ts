import { describe, expect, it } from 'vitest';
import type { NostrEvent } from '@nostrify/nostrify';
import {
  DECK_KIND,
  buildDeckEvent,
  deckAddress,
  parseDeckEvent,
  parseHashtagInput,
  type DeckEventInput,
} from './deckEvent';

const SHA_PDF = '1'.repeat(64);
const SHA_P1 = 'a'.repeat(64);
const SHA_P2 = 'b'.repeat(64);

function makeInput(overrides: Partial<DeckEventInput> = {}): DeckEventInput {
  return {
    identifier: 'my-deck',
    title: 'Nostr for Speakers',
    summary: 'A talk about slides.',
    imageUrl: 'https://gateway.example/my-deck/thumb.webp',
    pdf: { url: 'https://blossom.example/' + SHA_PDF + '.pdf', sha256: SHA_PDF, size: 12345 },
    pages: [
      { url: 'https://blossom.example/' + SHA_P1 + '.webp', sha256: SHA_P1, width: 1600, height: 900 },
      { url: 'https://blossom.example/' + SHA_P2 + '.webp', sha256: SHA_P2, width: 1600, height: 900 },
    ],
    hashtags: ['nostr', 'Slides'],
    publishedAt: 1700000000,
    ...overrides,
  };
}

function sign(template: { kind: number; content: string; tags: string[][] }): NostrEvent {
  return {
    ...template,
    id: '0'.repeat(64),
    pubkey: 'f'.repeat(64),
    sig: 'e'.repeat(128),
    created_at: 1700000001,
  };
}

describe('buildDeckEvent / parseDeckEvent round trip', () => {
  it('preserves all fields and page order', () => {
    const deck = parseDeckEvent(sign(buildDeckEvent(makeInput())));
    expect(deck).not.toBeNull();
    expect(deck!.identifier).toBe('my-deck');
    expect(deck!.title).toBe('Nostr for Speakers');
    expect(deck!.summary).toBe('A talk about slides.');
    expect(deck!.image).toBe('https://gateway.example/my-deck/thumb.webp');
    expect(deck!.publishedAt).toBe(1700000000);
    expect(deck!.pdf).toEqual({
      url: 'https://blossom.example/' + SHA_PDF + '.pdf',
      sha256: SHA_PDF,
      mimeType: 'application/pdf',
      size: 12345,
    });
    expect(deck!.pages.map((p) => p.sha256)).toEqual([SHA_P1, SHA_P2]);
    expect(deck!.pages[0]).toMatchObject({ width: 1600, height: 900, mimeType: 'image/webp' });
    expect(deck!.hashtags).toEqual(['nostr', 'slides']);
  });

  it('includes an alt tag (NIP-31)', () => {
    const template = buildDeckEvent(makeInput());
    const alt = template.tags.find(([n]) => n === 'alt');
    expect(alt?.[1]).toContain('Slide deck');
  });

  it('rejects invalid identifiers and empty decks at build time', () => {
    expect(() => buildDeckEvent(makeInput({ identifier: 'Bad_ID!' }))).toThrow();
    expect(() => buildDeckEvent(makeInput({ identifier: 'way-too-long-id-over-13' }))).toThrow();
    expect(() => buildDeckEvent(makeInput({ title: '  ' }))).toThrow();
    expect(() => buildDeckEvent(makeInput({ pages: [] }))).toThrow();
  });
});

describe('parseDeckEvent validation', () => {
  it('returns null for other kinds', () => {
    const event = sign(buildDeckEvent(makeInput()));
    expect(parseDeckEvent({ ...event, kind: 1 })).toBeNull();
  });

  it('returns null when the PDF hash is malformed', () => {
    const event = sign(buildDeckEvent(makeInput()));
    event.tags = event.tags.map((tag) => (tag[0] === 'x' ? ['x', 'nothex'] : tag));
    expect(parseDeckEvent(event)).toBeNull();
  });

  it('drops pages with non-http URLs and nulls out page-less decks', () => {
    const event = sign(buildDeckEvent(makeInput()));
    event.tags = event.tags.map((tag) =>
      tag[0] === 'imeta'
        ? tag.map((entry) => entry.replace(/^url https:/, 'url javascript:'))
        : tag,
    );
    expect(parseDeckEvent(event)).toBeNull();
  });

  it('returns null when d is not a valid deck id', () => {
    const event = sign(buildDeckEvent(makeInput()));
    event.tags = event.tags.map((tag) => (tag[0] === 'd' ? ['d', 'UPPER CASE ID'] : tag));
    expect(parseDeckEvent(event)).toBeNull();
  });
});

describe('helpers', () => {
  it('parses hashtag input with mixed separators', () => {
    expect(parseHashtagInput('Nostr, bitcoin　#Tech nostr')).toEqual(['nostr', 'bitcoin', 'tech']);
  });

  it('formats the deck address', () => {
    expect(deckAddress({ pubkey: 'f'.repeat(64), identifier: 'my-deck' })).toBe(
      `${DECK_KIND}:${'f'.repeat(64)}:my-deck`,
    );
  });
});
