import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { DECK_KIND, parseDeckEvent, type Deck } from '@/lib/deckEvent';

/** Fetch and validate a deck by author + identifier. Resolves to null when missing. */
export function useDeck(pubkey: string | undefined, identifier: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<Deck | null>({
    queryKey: ['nostr', 'deck', pubkey, identifier],
    enabled: Boolean(pubkey && identifier),
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [{ kinds: [DECK_KIND], authors: [pubkey!], '#d': [identifier!], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]) },
      );
      const decks = events
        .map(parseDeckEvent)
        .filter((deck): deck is Deck => deck !== null)
        .sort((a, b) => b.event.created_at - a.event.created_at);
      return decks[0] ?? null;
    },
  });
}
