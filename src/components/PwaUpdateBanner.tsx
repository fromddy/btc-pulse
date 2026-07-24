import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdateBanner() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(needRefresh)
  }, [needRefresh])

  if (!visible) return null

  return (
    <div className="update-banner">
      <div className="panel update-banner-inner">
        <span>{t('common.updateAvailable')}</span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            void updateServiceWorker(true)
            setNeedRefresh(false)
          }}
        >
          {t('common.refresh')}
        </button>
      </div>
    </div>
  )
}
