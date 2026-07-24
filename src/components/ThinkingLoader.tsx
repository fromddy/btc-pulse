import { useTranslation } from 'react-i18next'
import type { LoadStepState } from '../data/loadSteps'
import { BrandMark } from './BrandMark'

export function ThinkingLoader({ steps }: { steps: LoadStepState[] }) {
  const { t } = useTranslation()

  return (
    <section className="thinking-shell">
      <BrandMark />
      <p className="mt-2 max-w-[18rem] text-[0.98rem] leading-snug text-[var(--ink-soft)]">
        {t('brand.tagline')}
      </p>

      <div className="mt-8 flex items-center gap-2 text-sm font-semibold">
        <span className="thinking-pulse-dot" aria-hidden />
        <span className="thinking-shimmer">{t('thinking.title')}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
        {t('thinking.subtitle')}
      </p>

      <ol className="thinking-steps">
        {steps.map((step) => {
          const active = step.status === 'active'
          const done = step.status === 'done'
          return (
            <li
              key={step.id}
              className={`thinking-step ${active ? 'active' : done ? 'done' : 'pending'}`}
            >
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold ${
                  done
                    ? 'bg-[var(--accent)] text-white'
                    : active
                      ? 'border border-[var(--accent)] text-[var(--accent)]'
                      : 'border border-[var(--line)] text-[var(--ink-soft)]'
                }`}
                aria-hidden
              >
                {done ? '✓' : active ? '·' : ''}
              </span>
              <p className="text-[0.95rem] font-medium leading-snug text-[var(--ink)]">
                {t(`thinking.steps.${step.id}`)}
                {active ? <span className="thinking-caret">▍</span> : null}
              </p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
