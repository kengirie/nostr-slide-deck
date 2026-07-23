import { useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CropMarks } from '@/components/CropMarks';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/** The paper sheet with crop marks — the app's signature element and file input. */
export function PdfDropZone({ onFile }: { onFile: (file: File) => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const accept = (file: File | undefined | null) => {
    if (!file) return;
    if (!isPdf(file)) {
      toast({ variant: 'destructive', title: t('publish.notPdf') });
      return;
    }
    onFile(file);
  };

  return (
    <div className="relative mx-4 my-4 sm:mx-6">
      <CropMarks />
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          accept(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className="group relative block aspect-video w-full bg-card shadow-[0_12px_32px_-16px_rgb(28_26_23/0.35)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span
          className={cn(
            'absolute inset-3 flex flex-col items-center justify-center gap-3 border border-dashed px-4 transition-colors group-hover:border-seal sm:inset-4',
            dragOver ? 'border-seal bg-seal/5' : 'border-border',
          )}
        >
          <FileText className="size-8 text-muted-foreground" aria-hidden />
          <span className="font-display text-lg font-semibold sm:text-xl">
            {t('hero.dropTitle')}
          </span>
          <span className="text-xs text-muted-foreground">{t('hero.dropHint')}</span>
        </span>
        <span
          aria-hidden
          className="absolute bottom-1 right-1 hidden font-mono text-[10px] tracking-widest text-muted-foreground sm:block"
        >
          00 / 00
        </span>
      </button>
    </div>
  );
}
