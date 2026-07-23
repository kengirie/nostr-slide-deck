import { useCallback, useState } from 'react';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import type { DeckMetadata } from '@/components/publish/DeckMetadataForm';
import { getEffectiveBlossomServers } from '@/lib/appBlossom';
import { uploadToServers, type BlossomServerResult } from '@/lib/blossomMulti';
import { DECK_KIND, buildDeckEvent, parseHashtagInput } from '@/lib/deckEvent';
import type { RenderedDeck } from '@/lib/pdfRender';
import { useAppContext } from './useAppContext';
import { useCurrentUser } from './useCurrentUser';
import { useNostrPublish } from './useNostrPublish';

export interface PublishResult {
  naddr: string;
  identifier: string;
  pubkey: string;
  npub: string;
}

interface PublishState {
  step: 'idle' | 'uploading' | 'publishing' | 'done' | 'error';
  uploaded: number;
  totalUploads: number;
  /** Servers that rejected at least one blob (upload still succeeded elsewhere) */
  failedServers: string[];
  error: string | null;
  result: PublishResult | null;
}

const IDLE: PublishState = {
  step: 'idle',
  uploaded: 0,
  totalUploads: 0,
  failedServers: [],
  error: null,
  result: null,
};

export interface PublishDeckArgs {
  file: File;
  deck: RenderedDeck;
  meta: DeckMetadata;
}

/** Orchestrates upload → deck event, entirely in the browser. */
export function usePublishDeck() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { config } = useAppContext();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const [state, setState] = useState<PublishState>(IDLE);

  const reset = useCallback(() => setState(IDLE), []);

  const publish = useCallback(
    async ({ file, deck, meta }: PublishDeckArgs) => {
      if (!user) return;
      const servers = getEffectiveBlossomServers(
        config.blossomServerMetadata,
        config.useAppBlossomServers,
      );

      const totalUploads = deck.pages.length + 2;
      const failed = new Set<string>();
      let uploaded = 0;
      setState({ ...IDLE, step: 'uploading', totalUploads });

      const track = (results: BlossomServerResult[]) => {
        for (const result of results) {
          if (!result.ok) failed.add(result.server);
        }
        uploaded += 1;
        setState((prev) => ({
          ...prev,
          uploaded,
          failedServers: Array.from(failed),
        }));
      };

      try {
        const pdfUpload = await uploadToServers({
          blob: file,
          name: file.name,
          type: 'application/pdf',
          servers,
          signer: user.signer,
        });
        track(pdfUpload.results);

        const thumbUpload = await uploadToServers({
          blob: deck.thumbnail,
          name: 'thumbnail.webp',
          type: 'image/webp',
          servers,
          signer: user.signer,
        });
        track(thumbUpload.results);

        const pageUploads = [];
        for (const page of deck.pages) {
          const upload = await uploadToServers({
            blob: page.blob,
            name: `page-${String(page.pageNumber).padStart(3, '0')}.webp`,
            type: 'image/webp',
            servers,
            signer: user.signer,
          });
          track(upload.results);
          pageUploads.push({
            url: upload.url,
            sha256: upload.sha256,
            width: page.width,
            height: page.height,
          });
        }

        // Keep published_at stable when replacing an existing deck
        let publishedAt = Math.floor(Date.now() / 1000);
        try {
          const [prev] = await nostr.query(
            [{ kinds: [DECK_KIND], authors: [user.pubkey], '#d': [meta.slug], limit: 1 }],
            { signal: AbortSignal.timeout(3000) },
          );
          if (prev) {
            const prevPublishedAt = Number(prev.tags.find(([n]) => n === 'published_at')?.[1]);
            publishedAt = Number.isFinite(prevPublishedAt) ? prevPublishedAt : prev.created_at;
          }
        } catch {
          // No relay answer in time — treat as first publication
        }

        setState((prev) => ({ ...prev, step: 'publishing' }));

        const template = buildDeckEvent({
          identifier: meta.slug,
          title: meta.title,
          summary: meta.summary,
          imageUrl: thumbUpload.url,
          pdf: { url: pdfUpload.url, sha256: pdfUpload.sha256, size: file.size },
          pages: pageUploads,
          hashtags: parseHashtagInput(meta.hashtags),
          publishedAt,
        });
        await publishEvent(template);

        const result: PublishResult = {
          naddr: nip19.naddrEncode({
            kind: DECK_KIND,
            pubkey: user.pubkey,
            identifier: meta.slug,
          }),
          identifier: meta.slug,
          pubkey: user.pubkey,
          npub: nip19.npubEncode(user.pubkey),
        };
        setState((prev) => ({ ...prev, step: 'done', result }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          step: 'error',
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    },
    [user, config.blossomServerMetadata, config.useAppBlossomServers, nostr, publishEvent],
  );

  return { ...state, publish, reset };
}
