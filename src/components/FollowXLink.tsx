import { useTranslation } from 'react-i18next'
import { env } from '../config/env'

export function FollowXLink({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  if (!env.hasX) return null

  return (
    <a
      href={env.xUrl}
      target="_blank"
      rel="noreferrer"
      className={`follow-x ${className}`.trim()}
    >
      {t('social.followX', { handle: env.xHandle || 'X' })}
    </a>
  )
}
