import { useTranslation } from 'react-i18next';
import { useSeoMeta } from '@unhead/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PdfDropZone } from '@/components/publish/PdfDropZone';
import { PublishSection } from '@/components/publish/PublishSection';
import { usePdfPages } from '@/hooks/usePdfPages';

const FEATURES = ['cards', 'viewer', 'zaps'] as const;

const Index = () => {
  const { t } = useTranslation();
  const pdf = usePdfPages();

  useSeoMeta({
    title: `${t('app.name')} — ${t('app.tagline')}`,
    description: t('hero.lead'),
  });

  return (
    <AppLayout>
      {pdf.status === 'idle' ? (
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
            <PdfDropZone onFile={pdf.start} />
          </div>
        </section>
      ) : (
        <PublishSection
          key={pdf.file ? `${pdf.file.name}:${pdf.file.size}:${pdf.file.lastModified}` : 'none'}
          pdf={pdf}
          onReset={pdf.reset}
        />
      )}
    </AppLayout>
  );
};

export default Index;
