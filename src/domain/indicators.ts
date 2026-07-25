import {
  ahr999At,
  computeAhr999Series,
  expGrowthValuation,
  geometricMean200,
} from './ahr999'
import type { DailyBar, IndicatorSnapshot } from './types'

/** Known BTC halving UTC midnights (approx block times as dates). */
export const HALVING_DATES_UTC = [
  Date.UTC(2012, 10, 28),
  Date.UTC(2016, 6, 9),
  Date.UTC(2020, 4, 11),
  Date.UTC(2024, 3, 20),
  // Approximate next (~2028-04)
  Date.UTC(2028, 3, 20),
] as const

const DAY_MS = 86_400_000

export function sma(values: number[], period: number): number {
  if (values.length < period) return NaN
  const window = values.slice(-period)
  return window.reduce((a, b) => a + b, 0) / period
}

export function percentileRank(series: number[], value: number): number {
  const finite = series.filter((v) => Number.isFinite(v))
  if (finite.length === 0 || !Number.isFinite(value)) return NaN
  let below = 0
  for (const v of finite) {
    if (v <= value) below += 1
  }
  return below / finite.length
}

export function athDrawdown(closes: number[]): { ath: number; drawdown: number } {
  let ath = 0
  for (const c of closes) ath = Math.max(ath, c)
  const price = closes[closes.length - 1] ?? 0
  const drawdown = ath > 0 ? (ath - price) / ath : 0
  return { ath, drawdown }
}

export function periodReturn(closes: number[], days: number): number {
  if (closes.length <= days) return NaN
  const now = closes[closes.length - 1]
  const prev = closes[closes.length - 1 - days]
  if (!(prev > 0)) return NaN
  return now / prev - 1
}

export function volumeExpanding(bars: DailyBar[], lookback = 20): boolean {
  if (bars.length < lookback * 2) return false
  const recent = bars.slice(-lookback)
  const prior = bars.slice(-lookback * 2, -lookback)
  const avg = (xs: DailyBar[]) =>
    xs.reduce((s, b) => s + b.volume, 0) / xs.length
  const r = avg(recent)
  const p = avg(prior)
  return p > 0 && r > p * 1.05
}

export function hasHigherLow(bars: DailyBar[], window = 60): boolean {
  if (bars.length < window) return false
  const slice = bars.slice(-window)
  const mid = Math.floor(slice.length / 2)
  const first = slice.slice(0, mid)
  const second = slice.slice(mid)
  const minOf = (xs: DailyBar[]) => Math.min(...xs.map((b) => b.low))
  return minOf(second) > minOf(first)
}

export function halvingPosition(asOfMs: number): {
  daysSinceLastHalving: number
  daysToNextHalving: number
  halvingPhase: IndicatorSnapshot['halvingPhase']
} {
  let last = HALVING_DATES_UTC[0]
  let next = HALVING_DATES_UTC[1]
  for (let i = 0; i < HALVING_DATES_UTC.length - 1; i++) {
    if (asOfMs >= HALVING_DATES_UTC[i]) {
      last = HALVING_DATES_UTC[i]
      next = HALVING_DATES_UTC[i + 1]
    }
  }
  const daysSinceLastHalving = Math.floor((asOfMs - last) / DAY_MS)
  const daysToNextHalving = Math.max(0, Math.floor((next - asOfMs) / DAY_MS))
  const cycleLen = Math.max(1, (next - last) / DAY_MS)
  const progress = daysSinceLastHalving / cycleLen
  let halvingPhase: IndicatorSnapshot['halvingPhase'] = 'mid'
  if (progress < 0.25) halvingPhase = 'early'
  else if (progress < 0.55) halvingPhase = 'mid'
  else if (progress < 0.85) halvingPhase = 'late'
  else halvingPhase = 'pre'
  return { daysSinceLastHalving, daysToNextHalving, halvingPhase }
}

export function buildIndicatorSnapshot(
  bars: DailyBar[],
  fearGreed: { value: number; classification: string } | null,
  cbbi: { value: number } | null = null,
): IndicatorSnapshot {
  if (bars.length < 200) {
    throw new Error('Need at least 200 daily bars')
  }

  const closes = bars.map((b) => b.close)
  const last = bars[bars.length - 1]
  const price = last.close
  const asOf = last.closeTime
  const gma200 = geometricMean200(closes)
  const expGrowth = expGrowthValuation(asOf)
  const ahr999 = ahr999At(price, gma200, expGrowth)
  const sma50 = sma(closes, 50)
  const sma200 = sma(closes, 200)
  const mayer = price / sma200
  const { ath, drawdown } = athDrawdown(closes)
  const ahrSeries = computeAhr999Series(bars).map((p) => p.value)
  const mayerSeries: number[] = []
  for (let i = 199; i < closes.length; i++) {
    const window = closes.slice(i - 199, i + 1)
    const s = window.reduce((a, b) => a + b, 0) / 200
    mayerSeries.push(closes[i] / s)
  }

  const halv = halvingPosition(asOf)

  return {
    asOf,
    price,
    ahr999,
    gma200,
    expGrowth,
    mayer,
    sma50,
    sma200,
    ath,
    drawdownFromAth: drawdown,
    aboveSma200: price >= sma200,
    sma50AboveSma200: sma50 >= sma200,
    return7d: periodReturn(closes, 7),
    return30d: periodReturn(closes, 30),
    volumeExpanding: volumeExpanding(bars),
    higherLow: hasHigherLow(bars),
    fearGreed: fearGreed?.value ?? null,
    fearGreedLabel: fearGreed?.classification ?? null,
    cbbi: cbbi?.value ?? null,
    daysSinceLastHalving: halv.daysSinceLastHalving,
    daysToNextHalving: halv.daysToNextHalving,
    halvingPhase: halv.halvingPhase,
    ahr999Percentile: percentileRank(ahrSeries, ahr999),
    mayerPercentile: percentileRank(mayerSeries, mayer),
  }
}
