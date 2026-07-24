/**
 * The nsite gateway that serves published deck pages. A dumb pipe: any
 * NIP-5A-compatible gateway can be swapped in here without republishing —
 * the manifests and blobs live on relays and Blossom servers.
 */
export const GATEWAY_DOMAIN = 'nosto.re';

/** Extra relays the gateway ecosystem uses to look up user data (10063 etc.). */
export const LOOKUP_RELAYS = ['wss://user.kindpag.es/', 'wss://purplepag.es/'];

export function deckGatewayUrl(npub: string, deckId: string): string {
  return `https://${npub}.${GATEWAY_DOMAIN}/${deckId}/`;
}

/** Absolute in-app URL honoring the deploy base path (e.g. GitHub Pages subpath). */
export function absoluteAppUrl(path: string): string {
  return `${location.origin}${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
