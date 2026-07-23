import { cn } from '@/lib/utils';

/** The vermilion hanko-style seal that anchors the brand. */
export function SealMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-9 shrink-0 select-none items-center justify-center rounded-[3px] bg-seal font-display text-lg font-bold leading-none text-seal-foreground',
        className,
      )}
    >
      紙
    </span>
  );
}
