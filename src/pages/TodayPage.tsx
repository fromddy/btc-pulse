import { useTranslation } from 'react-i18next'
import { DataStatusBar } from '../components/DataStatusBar'
import { DimensionLights } from '../components/DimensionLights'
import { MetricPanel } from '../components/MetricPanel'
import { ShareCard } from '../components/ShareCard'
import { ThinkingLoader } from '../components/ThinkingLoader'
import { VerdictHero } from '../components/VerdictHero'
import { usePulse } from '../state/PulseContext'

export function TodayPage() {
  const { t } = useTranslation()
  const { data, loading, booting, thinkingSteps, error, refresh } = usePulse()

  const showThinking = booting || (loading && !data)

  return (
    <div className="page">
      {showThinking ? <ThinkingLoader steps={thinkingSteps} /> : null}

      {!showThinking && error && !data?.verdict ? (
        <div className="panel px-5 py-10 text-center">
          <p className="text-[var(--ink-soft)]">{t('errors.load')}</p>
          <button
            type="button"
            className="btn btn-primary mt-5 w-full"
            onClick={() => void refresh({ force: true })}
          >
            {t('common.retry')}
          </button>
        </div>
      ) : null}

      {!showThinking && data?.verdict ? (
        <>
          {error ? (
            <p className="mb-3 text-center text-xs text-[var(--warm)]">
              {t('common.offlineHint')}
            </p>
          ) : null}
          <VerdictHero verdict={data.verdict} />
          <div className="stack-rise" style={{ animationDelay: '60ms' }}>
            <DataStatusBar
              verdict={data.verdict}
              loading={loading}
              offlineFallback={Boolean(error)}
              onRefresh={() => void refresh({ force: true })}
            />
          </div>
          <div className="stack-rise" style={{ animationDelay: '120ms' }}>
            <DimensionLights dimensions={data.verdict.dimensions} />
          </div>
          <div className="stack-rise" style={{ animationDelay: '180ms' }}>
            <ShareCard verdict={data.verdict} />
          </div>
          <div className="stack-rise" style={{ animationDelay: '240ms' }}>
            <MetricPanel i={data.verdict.indicators} />
          </div>
        </>
      ) : null}
    </div>
  )
}
