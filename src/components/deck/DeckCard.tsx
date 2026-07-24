import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthor } from '@/hooks/useAuthor';
import type { Deck } from '@/lib/deckEvent';

export function DeckCard({ deck }: { deck: Deck }) {
  const { t, i18n } = useTranslation();
  const author = useAuthor(deck.pubkey);
  const npub = nip19.npubEncode(deck.pubkey);
  const name = author.data?.metadata?.name ?? `${npub.slice(0, 12)}…`;
  const date = new Date((deck.publishedAt ?? deck.event.created_at) * 1000).toLocaleDateString(
    i18n.language,
    { year: 'numeric', month: 'short', day: 'numeric' },
  );

  return (
    <Link
      to={`/${npub}/${deck.identifier}`}
      className="group block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="block aspect-video overflow-hidden border bg-card shadow-[0_8px_24px_-16px_rgb(28_26_23/0.4)] transition-colors group-hover:border-seal">
        {deck.pages[0] && (
          <img
            src={deck.pages[0].url}
            alt=""
            loading="lazy"
            className="size-full object-contain"
          />
        )}
      </span>
      <span className="mt-3 block truncate font-display text-base font-semibold leading-snug">
        {deck.title}
      </span>
      <span className="mt-1 block truncate font-mono text-[11px] text-muted-foreground">
        {name} ・ {date} ・ {t('deck.pageCount', { count: deck.pages.length })}
      </span>
    </Link>
  );
}
