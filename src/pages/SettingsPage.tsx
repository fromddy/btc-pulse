import { useTranslation } from 'react-i18next'
import { LanguageSwitch } from '../components/LanguageSwitch'
import { env } from '../config/env'

export function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="page pt-2">
      <p className="section-label">{t('nav.settings')}</p>
      <h1 className="font-display mt-2 text-[2rem] leading-tight">
        {t('settings.title')}
      </h1>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{t('settings.subtitle')}</p>

      <section className="panel mt-5 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{t('settings.language')}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--ink-soft)]">
              {t('settings.languageHint')}
            </p>
          </div>
          <LanguageSwitch />
        </div>
      </section>

      <section className="panel mt-3 px-4 py-4">
        <p className="section-label">{t('settings.author')}</p>
        <p className="font-display mt-2 text-[1.75rem] leading-tight">
          {env.hasAuthor ? env.authorName : t('settings.authorFallback')}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          {t('social.welcome')}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          {t('social.donate')}
        </p>
        {env.hasX ? (
          <>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
              @{env.xHandle}
            </p>
            <a
              href={env.xUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-accent mt-4 w-full"
            >
              {t('social.openX')}
            </a>
          </>
        ) : (
          <p className="mt-3 text-xs text-[var(--ink-soft)]">
            {t('social.missingX')}
          </p>
        )}
      </section>

      <section className="panel mt-3 px-4 py-4">
        <p className="text-sm font-semibold">{t('settings.about')}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
          {t('brand.name')}: {t('brand.tagline')}
        </p>
        <p className="mt-3 text-xs text-[var(--ink-soft)]">{t('common.disclaimer')}</p>
      </section>
    </div>
  )
}
