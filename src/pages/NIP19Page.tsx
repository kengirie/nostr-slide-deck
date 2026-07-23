import { nip19 } from 'nostr-tools';
import { Navigate, useParams } from 'react-router-dom';
import { DECK_KIND } from '@/lib/deckEvent';
import NotFound from './NotFound';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();

  if (!identifier) {
    return <NotFound />;
  }

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch {
    return <NotFound />;
  }

  const { type } = decoded;

  switch (type) {
    case 'npub':
    case 'nprofile':
      // AI agent should implement profile view here
      return <div>Profile placeholder</div>;

    case 'note':
      // AI agent should implement note view here
      return <div>Note placeholder</div>;

    case 'nevent':
      // AI agent should implement event view here
      return <div>Event placeholder</div>;

    case 'naddr': {
      const { kind, pubkey, identifier } = decoded.data;
      if (kind === DECK_KIND) {
        return <Navigate to={`/${nip19.npubEncode(pubkey)}/${identifier}`} replace />;
      }
      return <NotFound />;
    }

    default:
      return <NotFound />;
  }
} 