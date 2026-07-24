import { useTranslation } from 'react-i18next'
import type { DailyVerdict } from '../domain/types'

function formatTime(ts: number, lng: string) {
  return new Intl.DateTimeFormat(lng.startsWith('zh') ? 'zh-CN' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(ts))
}

interface Props {
  verdict: DailyVerdict
  loading: boolean
  offlineFallback: boolean
  onRefresh: () => void
}

export function DataStatusBar({
  verdict,
  loading,
  offlineFallback,
  onRefresh,
}: Props) {
  const { t, i18n } = useTranslation()
  const time = formatTime(verdict.updatedAt, i18n.language)

  let statusKey = 'common.statusLive'
  if (offlineFallback) statusKey = 'common.statusOffline'
  else if (verdict.fromCache) statusKey = 'common.statusCached'

  return (
    <section className="panel status-bar">
      <div className="meta">
        <p className="time">{t('common.fetchedAt', { time })}</p>
        <p className="hint">{t(statusKey)}</p>
      </div>
      <button
        type="button"
        className="btn btn-primary status-refresh"
        disabled={loading}
        onClick={onRefresh}
      >
        {loading ? t('common.refreshing') : t('common.refreshNow')}
      </button>
    </section>
  )
}
