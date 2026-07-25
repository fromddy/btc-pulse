import type {
  Confidence,
  DailyVerdict,
  DimensionScore,
  IndicatorSnapshot,
  LightLevel,
  Regime,
  Temperature,
} from './types'

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

function levelFromScore(score: number): LightLevel {
  if (score < 0.28) return 'cold'
  if (score < 0.5) return 'neutral'
  if (score < 0.72) return 'warm'
  return 'hot'
}

function scoreValuation(i: IndicatorSnapshot): number {
  // Lower Ahr999 / Mayer / deeper drawdown => colder (lower score)
  let ahr: number
  if (i.ahr999 < 0.45) ahr = 0.12
  else if (i.ahr999 < 0.8) ahr = 0.35
  else if (i.ahr999 < 1.2) ahr = 0.55
  else if (i.ahr999 < 2) ahr = 0.75
  else ahr = 0.92

  let mayer: number
  if (i.mayer < 0.8) mayer = 0.15
  else if (i.mayer < 1) mayer = 0.4
  else if (i.mayer < 1.4) mayer = 0.6
  else if (i.mayer < 2) mayer = 0.8
  else mayer = 0.95

  // Deep drawdown = cold
  const dd = clamp01(1 - i.drawdownFromAth / 0.75)
  return clamp01(ahr * 0.5 + mayer * 0.3 + dd * 0.2)
}

function scoreTrend(i: IndicatorSnapshot): number {
  let s = 0.45
  if (i.aboveSma200) s += 0.18
  else s -= 0.12
  if (i.sma50AboveSma200) s += 0.12
  else s -= 0.08
  if (i.higherLow) s += 0.1
  if (i.return30d > 0.08) s += 0.08
  else if (i.return30d < -0.08) s -= 0.1
  if (i.return7d > 0.03 && i.volumeExpanding) s += 0.08
  else if (i.return7d > 0.03 && !i.volumeExpanding) s += 0.02
  else if (i.return7d < -0.03) s -= 0.06
  return clamp01(s)
}

function scoreSentiment(i: IndicatorSnapshot): number {
  if (i.fearGreed == null) return 0.5
  // Map 0-100 fear&greed to heat; extreme fear is "cold opportunity"
  return clamp01(i.fearGreed / 100)
}

function halvingPhaseHeat(i: IndicatorSnapshot): number {
  switch (i.halvingPhase) {
    case 'early':
      return 0.35
    case 'mid':
      return 0.55
    case 'late':
      return 0.7
    case 'pre':
      return 0.4
  }
}

function scoreCycle(i: IndicatorSnapshot): number {
  const phase = halvingPhaseHeat(i)
  // CBBI is peak-confidence 0–100: high = nearer cycle top = hotter.
  if (i.cbbi != null) {
    return clamp01((i.cbbi / 100) * 0.7 + phase * 0.3)
  }
  // Fallback: Ahr999 percentile heat + halving phase background
  const pct = Number.isFinite(i.ahr999Percentile) ? i.ahr999Percentile : 0.5
  return clamp01(pct * 0.7 + phase * 0.3)
}

function pickRegime(
  score: number,
  i: IndicatorSnapshot,
  valuation: number,
  trend: number,
): Regime {
  if (i.ahr999 < 0.45 && !i.aboveSma200) return 'deep_bear'
  if (i.ahr999 < 0.45 && i.aboveSma200) return 'accumulate'
  if (valuation < 0.42 && trend < 0.45) return 'accumulate'
  if (valuation < 0.5 && trend >= 0.5 && i.aboveSma200) return 'thaw'
  if (score >= 0.72 || i.ahr999 > 1.2) return 'warm'
  if (trend >= 0.55 && i.aboveSma200) return 'repair'
  if (i.ahr999 < 0.8) return 'accumulate'
  return 'repair'
}

function pickTemperature(score: number, i: IndicatorSnapshot): Temperature {
  if (i.ahr999 < 0.45 || score < 0.35) return 'cold'
  if (i.ahr999 > 1.2 || score > 0.7) return 'hot'
  return 'neutral'
}

function pickConfidence(i: IndicatorSnapshot, trend: number): Confidence {
  let points = 0
  if (i.aboveSma200 === i.sma50AboveSma200) points += 1
  if (i.higherLow && i.aboveSma200) points += 1
  if (i.volumeExpanding === i.return7d > 0) points += 1
  if (i.fearGreed != null) points += 1
  if (i.cbbi != null) points += 1
  if (trend > 0.6 && !i.aboveSma200) return 'low'
  if (points >= 3 && (i.aboveSma200 || i.ahr999 < 0.45)) return 'high'
  if (points >= 2) return 'medium'
  return 'low'
}

function reasonFor(
  regime: Regime,
  i: IndicatorSnapshot,
): { key: string; params: Record<string, string | number> } {
  const params = {
    ahr999: i.ahr999.toFixed(2),
    mayer: i.mayer.toFixed(2),
    drawdown: `${(i.drawdownFromAth * 100).toFixed(1)}%`,
    fng: i.fearGreed ?? 'n/a',
  }
  switch (regime) {
    case 'deep_bear':
      return { key: 'verdict.reason.deep_bear', params }
    case 'accumulate':
      return { key: 'verdict.reason.accumulate', params }
    case 'thaw':
      return { key: 'verdict.reason.thaw', params }
    case 'repair':
      return { key: 'verdict.reason.repair', params }
    case 'warm':
      return { key: 'verdict.reason.warm', params }
  }
}

export function evaluateVerdict(
  indicators: IndicatorSnapshot,
  opts?: { fromCache?: boolean; sourceLabel?: string; updatedAt?: number },
): DailyVerdict {
  const weights = {
    valuation: 0.35,
    trend: 0.35,
    sentiment: 0.2,
    cycle: 0.1,
  } as const

  const valuation = scoreValuation(indicators)
  const trend = scoreTrend(indicators)
  const sentiment = scoreSentiment(indicators)
  const cycle = scoreCycle(indicators)

  const dimensions: DimensionScore[] = [
    {
      id: 'valuation',
      score: valuation,
      level: levelFromScore(valuation),
      weight: weights.valuation,
    },
    {
      id: 'trend',
      score: trend,
      level: levelFromScore(trend),
      weight: weights.trend,
    },
    {
      id: 'sentiment',
      score: sentiment,
      level: levelFromScore(sentiment),
      weight: weights.sentiment,
    },
    {
      id: 'cycle',
      score: cycle,
      level: levelFromScore(cycle),
      weight: weights.cycle,
    },
  ]

  const score = clamp01(
    valuation * weights.valuation +
      trend * weights.trend +
      sentiment * weights.sentiment +
      cycle * weights.cycle,
  )

  const regime = pickRegime(score, indicators, valuation, trend)
  const temperature = pickTemperature(score, indicators)
  const confidence = pickConfidence(indicators, trend)
  const reason = reasonFor(regime, indicators)

  return {
    regime,
    temperature,
    confidence,
    score,
    dimensions,
    reasonKey: reason.key,
    reasonParams: reason.params,
    indicators,
    fromCache: opts?.fromCache ?? false,
    updatedAt: opts?.updatedAt ?? Date.now(),
    sourceLabel: opts?.sourceLabel ?? 'Binance BTCUSDT · UTC daily',
  }
}
