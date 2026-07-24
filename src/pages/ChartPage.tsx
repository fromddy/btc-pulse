import { useTranslation } from 'react-i18next'
import { Ahr999Chart } from '../components/Ahr999Chart'
import { usePulse } from '../state/PulseContext'

function zoneOf(ahr999: number): 'bottom' | 'dca' | 'watch' {
  if (ahr999 < 0.45) return 'bottom'
  if (ahr999 <= 1.2) return 'dca'
  return 'watch'
}

export function ChartPage() {
  const { t } = useTranslation()
  const { data, loading, refresh } = usePulse()
  const series = data?.ahr999Series ?? []
  const current =
    data?.verdict.indicators.ahr999 ??
    (series.length > 0 ? series[series.length - 1].value : null)
  const zone = current == null ? null : zoneOf(current)

  return (
    <div className="page pt-2">
      <p className="section-label">{t('nav.chart')}</p>
      <h1 className="font-display mt-2 text-[2rem] leading-tight">{t('chart.title')}</h1>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{t('chart.subtitle')}</p>

      <section className="panel mt-4 px-4 py-4">
        <p className="section-label">{t('chart.whatTitle')}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
          {t('chart.whatBody')}
        </p>
      </section>

      {current != null && zone ? (
        <section className={`panel chart-now mt-3 light-${zoneTone(zone)}`}>
          <div>
            <p className="section-label">{t('chart.nowLabel')}</p>
            <p className="chart-now-value">{current.toFixed(2)}</p>
          </div>
          <span className="chart-zone-pill">{t(`chart.zone.${zone}`)}</span>
        </section>
      ) : null}

      <section className="panel mt-3 px-2 py-3">
        {series.length > 0 ? (
          <>
            <Ahr999Chart series={series} />
            <p className="chart-credit">
              {t('chart.credit')}{' '}
              <a
                href="https://www.tradingview.com/"
                target="_blank"
                rel="noreferrer"
              >
                TradingView
              </a>
            </p>
          </>
        ) : (
          <div className="px-3 py-12 text-center text-sm text-[var(--ink-soft)]">
            <p>{loading ? t('common.loading') : t('chart.needData')}</p>
            {!loading ? (
              <button
                type="button"
                className="btn btn-primary mt-5"
                onClick={() => void refresh({ force: true })}
              >
                {t('common.refreshNow')}
              </button>
            ) : null}
          </div>
        )}
      </section>

      <section className="panel mt-3 px-4 py-4">
        <p className="section-label">{t('chart.legendTitle')}</p>
        <ul className="chart-legend">
          <li>
            <span className="swatch swatch-line" aria-hidden />
            <span>{t('chart.legendLine')}</span>
          </li>
          <li>
            <span className="swatch swatch-low" aria-hidden />
            <span>{t('chart.legendLow')}</span>
          </li>
          <li>
            <span className="swatch swatch-high" aria-hidden />
            <span>{t('chart.legendHigh')}</span>
          </li>
        </ul>
      </section>

      <section className="mt-4">
        <p className="section-label">{t('chart.zonesTitle')}</p>
        <div className="chart-zones mt-2">
          <article className="panel chart-zone-card zone-bottom">
            <h2>{t('chart.zones.bottomTitle')}</h2>
            <p>{t('chart.zones.bottomBody')}</p>
          </article>
          <article className="panel chart-zone-card zone-dca">
            <h2>{t('chart.zones.dcaTitle')}</h2>
            <p>{t('chart.zones.dcaBody')}</p>
          </article>
          <article className="panel chart-zone-card zone-watch">
            <h2>{t('chart.zones.watchTitle')}</h2>
            <p>{t('chart.zones.watchBody')}</p>
          </article>
        </div>
      </section>

      <p className="chart-tip mt-4">{t('chart.tip')}</p>
      <p className="mt-2 text-center text-xs text-[var(--ink-soft)]">
        {t('common.disclaimer')}
      </p>
    </div>
  )
}

function zoneTone(zone: 'bottom' | 'dca' | 'watch') {
  if (zone === 'bottom') return 'cold'
  if (zone === 'watch') return 'hot'
  return 'neutral'
}
