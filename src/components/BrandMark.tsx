import { useTranslation } from 'react-i18next'

export function BrandMark({ className = 'brand-mark' }: { className?: string }) {
  const { t } = useTranslation()
  const name = t('brand.name')
  const [head, ...rest] = name.split(' ')
  const tail = rest.join(' ')

  return (
    <p className={`font-display ${className}`.trim()}>
      <span className="btc">{head}</span>
      {tail ? <> {tail}</> : null}
    </p>
  )
}
