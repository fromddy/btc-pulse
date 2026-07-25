import { useTranslation } from 'react-i18next'
import { BrandMark } from '../components/BrandMark'

const GLOSSARY_IDS = [
  'ahr999',
  'mayer',
  'cbbi',
  'drawdown',
  'fng',
  'halving',
] as const

export function MethodologyPage() {
  const { t } = useTranslation()

  const blocks = [
    ['method.dataTitle', 'method.dataBody'],
    ['method.ahrTitle', 'method.ahrBody'],
    ['method.weightsTitle', 'method.weightsBody'],
    ['method.limitsTitle', 'method.limitsBody'],
  ] as const

  return (
    <div className="page pt-2">
      <BrandMark />
      <h1 className="font-display mt-3 text-[2rem] leading-tight">{t('method.title')}</h1>
      <p className="mt-2 text-[var(--accent)]">{t('brand.tagline')}</p>

      <section className="panel mt-5 space-y-5 px-4 py-5">
        <p className="leading-relaxed">{t('method.intro')}</p>
        <p className="leading-relaxed text-[var(--ink-soft)]">
          {t('method.confidenceNote')}
        </p>

        {blocks.slice(0, 2).map(([title, body]) => (
          <div key={title}>
            <h2 className="font-display text-xl">{t(title)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              {t(body)}
            </p>
          </div>
        ))}

        <div>
          <h2 className="font-display text-xl">{t('method.glossaryTitle')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            {t('method.glossaryLead')}
          </p>
          <ul className="mt-3 space-y-3">
            {GLOSSARY_IDS.map((id) => (
              <li key={id}>
                <p className="text-sm font-semibold">{t(`metrics.${id}`)}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {t(`metrics.explain.${id}`)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {blocks.slice(2).map(([title, body]) => (
          <div key={title}>
            <h2 className="font-display text-xl">{t(title)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              {t(body)}
            </p>
          </div>
        ))}

        <p className="text-xs text-[var(--ink-soft)]">{t('common.disclaimer')}</p>
      </section>
    </div>
  )
}
