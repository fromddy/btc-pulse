import { useTranslation } from 'react-i18next'
import { setAppLanguage } from '../i18n'

export function LanguageSwitch() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language.startsWith('zh') ? 'zh' : 'en'

  return (
    <div className="lang-switch" role="group" aria-label={t('settings.language')}>
      <button
        type="button"
        className={lng === 'zh' ? 'active' : undefined}
        onClick={() => setAppLanguage('zh')}
      >
        {t('common.langZh')}
      </button>
      <button
        type="button"
        className={lng === 'en' ? 'active' : undefined}
        onClick={() => setAppLanguage('en')}
      >
        {t('common.langEn')}
      </button>
    </div>
  )
}
