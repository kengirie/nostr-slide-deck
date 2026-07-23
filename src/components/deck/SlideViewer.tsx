import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CropMarks } from '@/components/CropMarks';
import { Button } from '@/components/ui/button';
import type { Deck } from '@/lib/deckEvent';
import { cn } from '@/lib/utils';

function folio(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Page-flip viewer. Page image URLs come from parseDeckEvent, which only
 * accepts http(s) URLs — event-sourced data never reaches the DOM unchecked.
 */
export function SlideViewer({ deck }: { deck: Deck }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = deck.pages.length;

  const go = useCallback(
    (delta: number) => setPage((prev) => Math.min(total, Math.max(1, prev + delta))),
    [total],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // Preload neighboring pages so flipping feels instant
  useEffect(() => {
    for (const neighbor of [page + 1, page - 1]) {
      const url = deck.pages[neighbor - 1]?.url;
      if (url) new Image().src = url;
    }
  }, [page, deck]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current?.requestFullscreen();
    }
  };

  const current = deck.pages[page - 1];
  if (!current) return null;
  const aspect = current.width && current.height ? `${current.width} / ${current.height}` : '16 / 9';

  return (
    <div
      ref={containerRef}
      className={cn('outline-none', fullscreen && 'flex h-full flex-col justify-center bg-background p-4')}
    >
      <div className="relative mx-4 my-4 sm:mx-6">
        <CropMarks />
        <div
          className="relative bg-card shadow-[0_12px_32px_-16px_rgb(28_26_23/0.35)]"
          style={{ aspectRatio: aspect }}
        >
          <img
            src={current.url}
            alt={`${deck.title} — ${page}/${total}`}
            className="absolute inset-0 size-full object-contain"
          />
          {/* Tap zones: left third = back, rest = forward */}
          <button
            type="button"
            aria-label={t('deck.prevPage')}
            onClick={() => go(-1)}
            disabled={page <= 1}
            className="group absolute inset-y-0 left-0 w-1/3 cursor-w-resize outline-none disabled:cursor-default"
          >
            <ChevronLeft
              aria-hidden
              className="absolute left-2 top-1/2 size-7 -translate-y-1/2 text-foreground/0 transition-colors group-hover:text-foreground/50 group-disabled:hidden"
            />
          </button>
          <button
            type="button"
            aria-label={t('deck.nextPage')}
            onClick={() => go(1)}
            disabled={page >= total}
            className="group absolute inset-y-0 right-0 w-2/3 cursor-e-resize outline-none disabled:cursor-default"
          >
            <ChevronRight
              aria-hidden
              className="absolute right-2 top-1/2 size-7 -translate-y-1/2 text-foreground/0 transition-colors group-hover:text-foreground/50 group-disabled:hidden"
            />
          </button>
        </div>
      </div>

      <div className="mx-4 flex items-center justify-between sm:mx-6">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label={t('deck.prevPage')} onClick={() => go(-1)} disabled={page <= 1}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('deck.nextPage')} onClick={() => go(1)} disabled={page >= total}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <p className="font-mono text-xs tracking-widest text-muted-foreground">
          {folio(page)} / {folio(total)}
        </p>
        <Button variant="ghost" size="icon" aria-label={t('deck.fullscreen')} onClick={toggleFullscreen}>
          {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
