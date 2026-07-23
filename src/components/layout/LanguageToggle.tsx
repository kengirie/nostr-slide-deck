import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ja', label: 'JA' },
] as const;

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? 'en';

  return (
    <div role="group" aria-label={t('lang.label')} className="flex items-center font-mono text-xs">
      {LANGS.map(({ code, label }, i) => (
        <span key={code} className="flex items-center">
          {i > 0 && <span aria-hidden className="text-muted-foreground/60">/</span>}
          <button
            type="button"
            onClick={() => i18n.changeLanguage(code)}
            aria-pressed={current === code}
            className={cn(
              'px-1.5 py-1 tracking-widest transition-colors',
              current === code
                ? 'text-foreground underline decoration-seal decoration-2 underline-offset-4'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        </span>
      ))}
    </div>
  );
}
