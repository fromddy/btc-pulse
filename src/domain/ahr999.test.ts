import { describe, expect, it } from 'vitest'
import {
  ahr999At,
  daysSinceGenesis,
  expGrowthValuation,
  geometricMean200,
} from './ahr999'

describe('ahr999', () => {
  it('computes days since genesis', () => {
    expect(daysSinceGenesis(Date.UTC(2009, 0, 3))).toBe(0)
    expect(daysSinceGenesis(Date.UTC(2009, 0, 4))).toBe(1)
  })

  it('computes geometric mean of 200 values', () => {
    const closes = Array.from({ length: 200 }, () => 100)
    expect(geometricMean200(closes)).toBeCloseTo(100, 8)
  })

  it('computes ahr999 product of ratios', () => {
    expect(ahr999At(50_000, 40_000, 100_000)).toBeCloseTo(0.625, 6)
  })

  it('exp growth valuation is positive for recent dates', () => {
    const v = expGrowthValuation(Date.UTC(2024, 0, 1))
    expect(v).toBeGreaterThan(1000)
    expect(Number.isFinite(v)).toBe(true)
  })
})
