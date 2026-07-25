import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DailyVerdict, IndicatorSnapshot } from '../domain/types'
import { BrandMark } from './BrandMark'

type HeroMetricId = 'ahr999' | 'mayer' | 'cbbi' | 'drawdown'

type BandKey = string

interface BandRow {
  key: BandKey
  range: string
  label: string
  active: boolean
}

function ahr999Zone(value: number): 'bottom' | 'dca' | 'watch' {
  if (value < 0.45) return 'bottom'
  if (value <= 1.2) return 'dca'
  return 'watch'
}

function cbbiZone(value: number): 'bottom' | 'mid' | 'top' {
  if (value < 15) return 'bottom'
  if (value <= 85) return 'mid'
  return 'top'
}

function mayerZone(value: number): 'cold' | 'mid' | 'hot' {
  if (value < 1) return 'cold'
  if (value <= 2) return 'mid'
  return 'hot'
}

function drawdownZone(value: number): 'deep' | 'mid' | 'near' {
  if (value > 0.4) return 'deep'
  if (value >= 0.2) return 'mid'
  return 'near'
}

const BAND_KEYS: Record<HeroMetricId, BandKey[]> = {
  ahr999: ['bottom', 'dca', 'watch'],
  cbbi: ['bottom', 'mid', 'top'],
  mayer: ['cold', 'mid', 'hot'],
  drawdown: ['deep', 'mid', 'near'],
}

function activeBand(
  id: HeroMetricId,
  i: IndicatorSnapshot,
): BandKey | null {
  switch (id) {
    case 'ahr999':
      return ahr999Zone(i.ahr999)
    case 'mayer':
      return mayerZone(i.mayer)
    case 'cbbi':
      return i.cbbi == null ? null : cbbiZone(i.cbbi)
    case 'drawdown':
      return drawdownZone(i.drawdownFromAth)
  }
}

export function VerdictHero({ verdict }: { verdict: DailyVerdict }) {
  const { t } = useTranslation()
  const { indicators: i } = verdict
  const [selected, setSelected] = useState<HeroMetricId>('ahr999')

  const chips: Array<{ id: HeroMetricId; label: string; value: string }> = [
    {
      id: 'ahr999',
      label: t('metrics.ahr999'),
      value: i.ahr999.toFixed(2),
    },
    {
      id: 'mayer',
      label: t('metrics.mayer'),
      value: i.mayer.toFixed(2),
    },
    {
      id: 'cbbi',
      label: t('metrics.cbbi'),
      value: i.cbbi == null ? t('common.na') : String(i.cbbi),
    },
    {
      id: 'drawdown',
      label: t('metrics.drawdown'),
      value: `${(i.drawdownFromAth * 100).toFixed(1)}%`,
    },
  ]

  const active = activeBand(selected, i)
  const bands: BandRow[] = BAND_KEYS[selected].map((key) => ({
    key,
    range: t(`metrics.bands.${selected}.${key}.range`),
    label: t(`metrics.bands.${selected}.${key}.name`),
    active: active === key,
  }))
  const nowLabel =
    active == null
      ? t('common.na')
      : t(`metrics.bands.${selected}.${active}.name`)

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

      <div className="metric-rail" role="tablist" aria-label={t('metrics.details')}>
        {chips.map((chip) => (
          <Metric
            key={chip.id}
            label={chip.label}
            value={chip.value}
            selected={selected === chip.id}
            onSelect={() => setSelected(chip.id)}
          />
        ))}
      </div>

      <MetricGuide
        nowPrefix={t('metrics.zoneNow')}
        nowLabel={nowLabel}
        blurb={t(`metrics.explain.${selected}`)}
        bands={bands}
      />

      <p className="mt-4 text-[0.72rem] leading-relaxed text-[var(--ink-soft)]">
        {t('common.disclaimer')}
      </p>
    </section>
  )
}

function MetricGuide({
  nowPrefix,
  nowLabel,
  blurb,
  bands,
}: {
  nowPrefix: string
  nowLabel: string
  blurb: string
  bands: BandRow[]
}) {
  return (
    <div className="metric-guide" role="status">
      <p className="metric-guide-now">
        {nowPrefix}
        <span className="metric-guide-now-zone">{nowLabel}</span>
      </p>
      <p className="metric-guide-blurb">{blurb}</p>
      <ul className="metric-guide-bands">
        {bands.map((band) => (
          <li
            key={band.key}
            className="metric-guide-band"
            data-active={band.active ? '1' : '0'}
          >
            <span className="range">{band.range}</span>
            <span className="name">{band.label}</span>
            <span className="pip" aria-hidden />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Metric({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string
  value: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      className="metric-chip"
      data-selected={selected ? '1' : '0'}
      aria-selected={selected}
      onClick={onSelect}
    >
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </button>
  )
}
