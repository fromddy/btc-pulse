import type { Ahr999Point, DailyBar } from './types'

/** Bitcoin genesis block date (UTC). */
export const GENESIS_UTC = Date.UTC(2009, 0, 3)

const EXP_A = 5.84
const EXP_B = 17.01

export function daysSinceGenesis(timestampMs: number): number {
  return Math.floor((timestampMs - GENESIS_UTC) / 86_400_000)
}

/** Exponential growth valuation used by Ahr999. */
export function expGrowthValuation(timestampMs: number): number {
  const age = daysSinceGenesis(timestampMs)
  if (age <= 0) return NaN
  return 10 ** (EXP_A * Math.log10(age) - EXP_B)
}

/** 200-day geometric mean of closes (定投成本). */
export function geometricMean200(closes: number[]): number {
  if (closes.length < 200) return NaN
  const window = closes.slice(-200)
  let logSum = 0
  for (const c of window) {
    if (c <= 0) return NaN
    logSum += Math.log(c)
  }
  return Math.exp(logSum / 200)
}

export function ahr999At(
  price: number,
  gma200: number,
  expGrowth: number,
): number {
  if (!(price > 0) || !(gma200 > 0) || !(expGrowth > 0)) return NaN
  return (price / gma200) * (price / expGrowth)
}

export function computeAhr999Series(bars: DailyBar[]): Ahr999Point[] {
  const points: Ahr999Point[] = []
  const closes: number[] = []

  for (const bar of bars) {
    closes.push(bar.close)
    if (closes.length < 200) continue
    const gma = geometricMean200(closes)
    const exp = expGrowthValuation(bar.closeTime)
    const value = ahr999At(bar.close, gma, exp)
    if (!Number.isFinite(value)) continue
    points.push({
      time: Math.floor(bar.closeTime / 1000),
      value,
      price: bar.close,
    })
  }

  return points
}
