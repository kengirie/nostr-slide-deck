import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfRenderError, renderPdf, type RenderedDeck } from '@/lib/pdfRender';

export interface PdfPagePreview {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
}

interface PdfPagesState {
  status: 'idle' | 'rendering' | 'ready' | 'error';
  file: File | null;
  deck: RenderedDeck | null;
  previews: PdfPagePreview[];
  thumbnailUrl: string | null;
  progress: { done: number; total: number };
  errorKind: PdfRenderError['kind'] | null;
}

const IDLE: PdfPagesState = {
  status: 'idle',
  file: null,
  deck: null,
  previews: [],
  thumbnailUrl: null,
  progress: { done: 0, total: 0 },
  errorKind: null,
};

/** Client-side PDF → page images pipeline with object-URL previews. */
export function usePdfPages() {
  const [state, setState] = useState<PdfPagesState>(IDLE);
  const urlsRef = useRef<string[]>([]);

  const revokeUrls = useCallback(() => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  }, []);

  useEffect(() => revokeUrls, [revokeUrls]);

  const start = useCallback(
    async (file: File) => {
      revokeUrls();
      setState({ ...IDLE, status: 'rendering', file });
      try {
        const deck = await renderPdf(file, (done, total) => {
          setState((prev) => ({ ...prev, progress: { done, total } }));
        });
        const previews = deck.pages.map((page) => {
          const url = URL.createObjectURL(page.blob);
          urlsRef.current.push(url);
          return { pageNumber: page.pageNumber, url, width: page.width, height: page.height };
        });
        const thumbnailUrl = URL.createObjectURL(deck.thumbnail);
        urlsRef.current.push(thumbnailUrl);
        setState((prev) => ({ ...prev, status: 'ready', deck, previews, thumbnailUrl }));
      } catch (err) {
        const errorKind = err instanceof PdfRenderError ? err.kind : 'invalid';
        setState((prev) => ({ ...prev, status: 'error', errorKind }));
      }
    },
    [revokeUrls],
  );

  const reset = useCallback(() => {
    revokeUrls();
    setState(IDLE);
  }, [revokeUrls]);

  return { ...state, start, reset };
}
