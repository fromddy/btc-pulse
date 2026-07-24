import { useTranslation } from 'react-i18next'
import type { DimensionScore } from '../domain/types'

export function DimensionLights({ dimensions }: { dimensions: DimensionScore[] }) {
  const { t } = useTranslation()

  return (
    <section className="mt-5">
      <p className="section-label">{t('dims.stripLabel')}</p>
      <div className="dim-strip" role="list">
        {dimensions.map((d) => (
          <div key={d.id} className={`dim-cell light-${d.level}`} role="listitem">
            <div className="dot" aria-hidden />
            <div className="name">{t(`dims.${d.id}`)}</div>
            <div className="level">{t(`dims.level.${d.level}`)}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
