import { describe, expect, it } from 'vitest'
import { evaluateVerdict } from './regime'
import type { IndicatorSnapshot } from './types'

function base(partial: Partial<IndicatorSnapshot>): IndicatorSnapshot {
  return {
    asOf: Date.UTC(2024, 0, 1),
    price: 40_000,
    ahr999: 0.4,
    gma200: 45_000,
    expGrowth: 120_000,
    mayer: 0.9,
    sma50: 38_000,
    sma200: 44_000,
    ath: 70_000,
    drawdownFromAth: 0.42,
    aboveSma200: false,
    sma50AboveSma200: false,
    return7d: -0.02,
    return30d: -0.1,
    volumeExpanding: false,
    higherLow: false,
    fearGreed: 20,
    fearGreedLabel: 'Extreme Fear',
    cbbi: null,
    daysSinceLastHalving: 100,
    daysToNextHalving: 1300,
    halvingPhase: 'early',
    ahr999Percentile: 0.1,
    mayerPercentile: 0.2,
    ...partial,
  }
}

describe('evaluateVerdict', () => {
  it('flags deep bear when ahr999 low and below SMA200', () => {
    const v = evaluateVerdict(base({}))
    expect(v.regime).toBe('deep_bear')
    expect(v.temperature).toBe('cold')
  })

  it('flags thaw when cheap-ish valuation and trend above SMA200', () => {
    const v = evaluateVerdict(
      base({
        ahr999: 0.6,
        aboveSma200: true,
        sma50AboveSma200: true,
        higherLow: true,
        return30d: 0.12,
        return7d: 0.04,
        volumeExpanding: true,
        mayer: 1.05,
        fearGreed: 45,
      }),
    )
    expect(['thaw', 'repair', 'accumulate']).toContain(v.regime)
    expect(v.dimensions).toHaveLength(4)
  })

  it('flags warm when ahr999 elevated', () => {
    const v = evaluateVerdict(
      base({
        ahr999: 1.5,
        mayer: 1.8,
        aboveSma200: true,
        sma50AboveSma200: true,
        drawdownFromAth: 0.05,
        fearGreed: 75,
      }),
    )
    expect(v.regime).toBe('warm')
    expect(v.temperature).toBe('hot')
  })

  it('raises cycle score when CBBI is high', () => {
    const low = evaluateVerdict(base({ cbbi: 15, ahr999Percentile: 0.9 }))
    const high = evaluateVerdict(base({ cbbi: 90, ahr999Percentile: 0.1 }))
    const cycleLow = low.dimensions.find((d) => d.id === 'cycle')!.score
    const cycleHigh = high.dimensions.find((d) => d.id === 'cycle')!.score
    expect(cycleHigh).toBeGreaterThan(cycleLow)
  })

  it('falls back to ahr percentile for cycle when CBBI is null', () => {
    const coldPct = evaluateVerdict(
      base({ cbbi: null, ahr999Percentile: 0.1, halvingPhase: 'early' }),
    )
    const hotPct = evaluateVerdict(
      base({ cbbi: null, ahr999Percentile: 0.95, halvingPhase: 'early' }),
    )
    const cycleCold = coldPct.dimensions.find((d) => d.id === 'cycle')!.score
    const cycleHot = hotPct.dimensions.find((d) => d.id === 'cycle')!.score
    expect(cycleHot).toBeGreaterThan(cycleCold)
  })
})
