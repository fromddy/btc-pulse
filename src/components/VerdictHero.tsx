import { useTranslation } from 'react-i18next'
import type { DailyVerdict } from '../domain/types'
import { BrandMark } from './BrandMark'

export function VerdictHero({ verdict }: { verdict: DailyVerdict }) {
  const { t } = useTranslation()
  const { indicators: i } = verdict

  return (
    <section className="verdict-hero" data-temp={verdict.temperature}>
      <BrandMark />
      <p className="mt-2 max-w-[18rem] text-[0.98rem] leading-snug text-[var(--ink-soft)]">
        {t('brand.tagline')}
      </p>

      <div className="mt-7">
        <p className="section-label" style={{ color: 'var(--accent)' }}>
          {t(`verdict.temperature.${verdict.temperature}`)}
        </p>
        <h1 className="font-display regime-title">
          {t(`verdict.regime.${verdict.regime}`)}
        </h1>
        <p className="mt-2 text-sm font-semibold text-[var(--ink-soft)]">
          {t(`verdict.confidence.${verdict.confidence}`)}
        </p>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-[var(--ink)]">
          {t(verdict.reasonKey, verdict.reasonParams)}
        </p>
      </div>

      <div className="metric-rail">
        <Metric label={t('metrics.ahr999')} value={i.ahr999.toFixed(2)} />
        <Metric label={t('metrics.mayer')} value={i.mayer.toFixed(2)} />
        <Metric
          label={t('metrics.drawdown')}
          value={`${(i.drawdownFromAth * 100).toFixed(1)}%`}
        />
        <Metric
          label={t('metrics.price')}
          value={new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          }).format(i.price)}
        />
      </div>

      <p className="mt-4 text-[0.72rem] leading-relaxed text-[var(--ink-soft)]">
        {t('common.disclaimer')}
      </p>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-chip">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}
