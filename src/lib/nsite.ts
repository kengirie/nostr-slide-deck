import type { NostrEvent } from '@nostrify/nostrify';
import { sha256Hex } from './blossomMulti';

/** NIP-5A root site manifest (single replaceable event per pubkey, no `d`). */
export const ROOT_SITE_KIND = 15128;
/** BUD-03 Blossom server list — nsite gateways use it to locate blobs. */
export const BLOSSOM_SERVER_LIST_KIND = 10063;

export interface SitePath {
  /** Absolute path, e.g. "/my-deck/index.html" */
  path: string;
  sha256: string;
}

/** NIP-5A aggregate hash: sorted "<hash> <path>\n" lines, SHA-256, lowercase hex. */
export async function aggregateHash(paths: SitePath[]): Promise<string> {
  const bytes = new TextEncoder().encode(
    paths
      .map(({ path, sha256 }) => `${sha256} ${path}\n`)
      .sort()
      .join(''),
  );
  return sha256Hex(bytes.buffer as ArrayBuffer);
}

export interface RootManifestTemplate {
  kind: number;
  content: string;
  tags: string[][];
}

/**
 * Build the replaceable root manifest, merging with the user's existing nsite:
 * every existing `path` outside `/<deckId>/` is preserved verbatim, paths under
 * `/<deckId>/` are replaced by `deckPaths`. Non-path tags of the existing
 * manifest (title, app, source…) are preserved; our `server` hints are merged in.
 */
export async function buildRootManifest(
  existing: NostrEvent | null,
  deckId: string,
  deckPaths: SitePath[],
  servers: string[],
): Promise<RootManifestTemplate> {
  const prefix = `/${deckId}/`;

  const keptPaths: SitePath[] = (existing?.tags ?? [])
    .filter((tag): tag is [string, string, string] =>
      tag[0] === 'path' && typeof tag[1] === 'string' && typeof tag[2] === 'string' &&
      !tag[1].startsWith(prefix),
    )
    .map(([, path, sha256]) => ({ path, sha256 }));

  const allPaths = [...keptPaths, ...deckPaths];

  const keptOtherTags = (existing?.tags ?? []).filter(
    ([name]) => name !== 'path' && name !== 'x' && name !== 'server',
  );
  const existingServers = (existing?.tags ?? [])
    .filter(([name]) => name === 'server')
    .map(([, url]) => url)
    .filter((url): url is string => Boolean(url));
  const mergedServers = [...new Set([...existingServers, ...servers])];

  return {
    kind: ROOT_SITE_KIND,
    content: '',
    tags: [
      ...allPaths.map(({ path, sha256 }) => ['path', path, sha256]),
      ['x', await aggregateHash(allPaths), 'aggregate'],
      ...mergedServers.map((url) => ['server', url]),
      ...keptOtherTags,
    ],
  };
}

/** BUD-03 server list template for users who don't have one yet. */
export function buildServerList(servers: string[]): RootManifestTemplate {
  return {
    kind: BLOSSOM_SERVER_LIST_KIND,
    content: '',
    tags: servers.map((url) => ['server', url]),
  };
}
