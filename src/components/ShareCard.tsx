import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DailyVerdict } from '../domain/types'
import { downloadCardBlob, renderShareCardPng } from '../lib/shareCard'

function formatDate(ts: number, lng: string) {
  return new Intl.DateTimeFormat(lng.startsWith('zh') ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(ts))
}

export function ShareCard({ verdict }: { verdict: DailyVerdict }) {
  const { t, i18n } = useTranslation()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    let objectUrl: string | null = null

    void (async () => {
      try {
        const blob = await renderShareCardPng(
          verdict,
          buildCopy(t, i18n.language, verdict),
        )
        if (!alive) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewBlob(blob)
        setPreviewUrl(objectUrl)
      } catch {
        if (alive) {
          setPreviewBlob(null)
          setPreviewUrl(null)
        }
      }
    })()

    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [verdict, t, i18n.language])

  async function onDownload() {
    setBusy(true)
    setNote(null)
    try {
      const blob =
        previewBlob ??
        (await renderShareCardPng(
          verdict,
          buildCopy(t, i18n.language, verdict),
        ))
      const filename = `btc-pulse-${new Date(verdict.updatedAt)
        .toISOString()
        .slice(0, 10)}.png`
      downloadCardBlob(blob, filename)
      setNote(t('share.downloaded'))
    } catch {
      setNote(t('share.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel share-block">
      <p className="section-label">{t('share.title')}</p>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">{t('share.subtitle')}</p>

      <div className="share-preview">
        {previewUrl ? (
          <img src={previewUrl} alt={t('share.title')} />
        ) : (
          <div className="px-4 py-14 text-center text-sm text-[var(--ink-soft)]">
            {t('share.preparing')}
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn btn-accent mt-3 w-full"
        disabled={busy || !previewUrl}
        onClick={() => void onDownload()}
      >
        {busy ? t('share.preparing') : t('share.download')}
      </button>
      {note ? <p className="mt-2 text-center text-xs text-[var(--ink-soft)]">{note}</p> : null}
    </section>
  )
}

function buildCopy(
  t: (key: string, opts?: Record<string, string | number>) => string,
  lng: string,
  verdict: DailyVerdict,
) {
  return {
    brand: t('brand.name'),
    tagline: t('brand.tagline'),
    regime: t(`verdict.regime.${verdict.regime}`),
    temperature: t(`verdict.temperature.${verdict.temperature}`),
    confidence: t(`verdict.confidence.${verdict.confidence}`),
    reason: t(verdict.reasonKey, verdict.reasonParams),
    ahr999Label: t('metrics.ahr999'),
    mayerLabel: t('metrics.mayer'),
    drawdownLabel: t('metrics.drawdown'),
    priceLabel: t('metrics.price'),
    footer: t('share.footer'),
    dateLabel: formatDate(verdict.updatedAt, lng),
  }
}
