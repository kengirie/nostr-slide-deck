import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSeoMeta } from '@unhead/react';
import { CropMarks } from '@/components/CropMarks';
import { AppLayout } from '@/components/layout/AppLayout';
import { useToast } from '@/hooks/useToast';

const FEATURES = ['cards', 'viewer', 'zaps'] as const;

const Index = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  useSeoMeta({
    title: `${t('app.name')} — ${t('app.tagline')}`,
    description: t('hero.lead'),
  });

  const showNotReady = () => {
    toast({ title: t('notReady.title'), description: t('notReady.desc') });
  };

  return (
    <AppLayout>
      <section className="container grid items-center gap-10 py-12 md:py-20 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-seal">
            {t('hero.eyebrow')}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mt-6 max-w-prose text-base leading-relaxed text-muted-foreground">
            {t('hero.lead')}
          </p>
          <ul className="mt-8 border-t">
            {FEATURES.map((key) => (
              <li key={key} className="border-b py-3 text-sm">
                {t(`features.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          {/* The sheet: a 16:9 sheet of paper with crop marks, doubling as the drop zone */}
          <div className="relative mx-4 my-4 sm:mx-6">
            <CropMarks />
            <button
              type="button"
              onClick={showNotReady}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                showNotReady();
              }}
              className="group relative block aspect-video w-full bg-card shadow-[0_12px_32px_-16px_rgb(28_26_23/0.35)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="absolute inset-3 flex flex-col items-center justify-center gap-3 border border-dashed border-border px-4 transition-colors group-hover:border-seal sm:inset-4">
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
        </div>
      </section>
    </AppLayout>
  );
};

export default Index;
