import { describe, expect, it } from 'vitest';
import type { NostrEvent } from '@nostrify/nostrify';
import { aggregateHash, buildRootManifest } from './nsite';

const H1 = 'a'.repeat(64);
const H2 = 'b'.repeat(64);
const H3 = 'c'.repeat(64);

function manifestEvent(tags: string[][]): NostrEvent {
  return {
    id: '0'.repeat(64),
    pubkey: 'f'.repeat(64),
    sig: 'e'.repeat(128),
    kind: 15128,
    content: '',
    created_at: 1700000000,
    tags,
  };
}

describe('aggregateHash', () => {
  it('is order-independent', async () => {
    const a = await aggregateHash([
      { path: '/index.html', sha256: H1 },
      { path: '/b/index.html', sha256: H2 },
    ]);
    const b = await aggregateHash([
      { path: '/b/index.html', sha256: H2 },
      { path: '/index.html', sha256: H1 },
    ]);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('buildRootManifest', () => {
  it('starts fresh when there is no existing manifest', async () => {
    const template = await buildRootManifest(null, 'deck', [
      { path: '/deck/index.html', sha256: H1 },
    ], ['https://blossom.example/']);
    expect(template.tags).toContainEqual(['path', '/deck/index.html', H1]);
    expect(template.tags).toContainEqual(['server', 'https://blossom.example/']);
    expect(template.tags.find(([n, , label]) => n === 'x' && label === 'aggregate')).toBeTruthy();
  });

  it('preserves foreign paths and replaces only the deck prefix', async () => {
    const existing = manifestEvent([
      ['path', '/index.html', H2],
      ['path', '/deck/index.html', 'stale'.padEnd(64, '0')],
      ['path', '/deck/pages/001.webp', 'stale'.padEnd(64, '0')],
      ['x', 'old', 'aggregate'],
      ['server', 'https://old.example/'],
      ['title', 'My site'],
    ]);
    const template = await buildRootManifest(existing, 'deck', [
      { path: '/deck/index.html', sha256: H1 },
      { path: '/deck/pages/001.webp', sha256: H3 },
    ], ['https://new.example/']);

    // foreign path kept
    expect(template.tags).toContainEqual(['path', '/index.html', H2]);
    // deck paths replaced, stale ones gone
    expect(template.tags).toContainEqual(['path', '/deck/index.html', H1]);
    expect(template.tags).toContainEqual(['path', '/deck/pages/001.webp', H3]);
    expect(template.tags.filter(([n]) => n === 'path')).toHaveLength(3);
    // servers merged, title preserved, single fresh aggregate
    expect(template.tags).toContainEqual(['server', 'https://old.example/']);
    expect(template.tags).toContainEqual(['server', 'https://new.example/']);
    expect(template.tags).toContainEqual(['title', 'My site']);
    expect(template.tags.filter(([n]) => n === 'x')).toHaveLength(1);
    expect(template.tags.find(([n]) => n === 'x')?.[1]).toMatch(/^[0-9a-f]{64}$/);
  });
});
