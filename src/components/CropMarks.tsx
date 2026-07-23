import { cn } from '@/lib/utils';

/**
 * Printer's crop marks (トンボ) drawn just outside the parent's corners.
 * The parent must be `relative` and leave ~1rem of clearance around itself.
 */
export function CropMarks({ className }: { className?: string }) {
  const seg = 'absolute bg-current';
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 text-muted-foreground/70', className)}
    >
      <i className={`${seg} top-0 -left-4 h-px w-2.5`} />
      <i className={`${seg} -top-4 left-0 h-2.5 w-px`} />
      <i className={`${seg} top-0 -right-4 h-px w-2.5`} />
      <i className={`${seg} -top-4 right-0 h-2.5 w-px`} />
      <i className={`${seg} bottom-0 -left-4 h-px w-2.5`} />
      <i className={`${seg} -bottom-4 left-0 h-2.5 w-px`} />
      <i className={`${seg} bottom-0 -right-4 h-px w-2.5`} />
      <i className={`${seg} -bottom-4 right-0 h-2.5 w-px`} />
    </div>
  );
}
