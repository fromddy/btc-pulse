import { useTranslation } from 'react-i18next'
import type { IndicatorSnapshot } from '../domain/types'

function pct(n: number) {
  if (!Number.isFinite(n)) return 'n/a'
  const sign = n > 0 ? '+' : ''
  return `${sign}${(n * 100).toFixed(1)}%`
}

export function MetricPanel({ i }: { i: IndicatorSnapshot }) {
  const { t } = useTranslation()

  const rows = [
    {
      label: t('metrics.sma200'),
      value: i.sma200.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    },
    {
      label: t('metrics.gma200'),
      value: i.gma200.toLocaleString('en-US', { maximumFractionDigits: 0 }),
    },
    {
      label: t('metrics.fng'),
      value:
        i.fearGreed == null
          ? t('common.na')
          : `${i.fearGreed}${i.fearGreedLabel ? ` · ${i.fearGreedLabel}` : ''}`,
    },
    {
      label: t('metrics.halving'),
      value: `${t('metrics.daysSince', { n: i.daysSinceLastHalving })} · ${t(
        'metrics.daysTo',
        { n: i.daysToNextHalving },
      )}`,
    },
    { label: t('metrics.return7d'), value: pct(i.return7d) },
    { label: t('metrics.return30d'), value: pct(i.return30d) },
  ]

  return (
    <section className="mt-5">
      <p className="section-label">{t('metrics.details')}</p>
      <ul className="panel details-list mt-2">
        {rows.map((row) => (
          <li key={row.label}>
            <span className="text-[var(--ink-soft)]">{row.label}</span>
            <span className="text-right font-semibold tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
