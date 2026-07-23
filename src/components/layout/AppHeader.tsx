import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginArea } from '@/components/auth/LoginArea';
import { LanguageToggle } from './LanguageToggle';
import { SealMark } from './SealMark';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <header className="border-b-2 border-foreground">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <SealMark />
          <span className="min-w-0">
            <span className="block whitespace-nowrap font-display text-xl font-bold leading-none tracking-wide">
              {t('app.name')}
            </span>
            <span className="mt-1 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:block">
              {t('app.tagline')}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <LoginArea />
        </div>
      </div>
    </header>
  );
}
