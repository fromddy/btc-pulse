export type Regime =
  | 'deep_bear'
  | 'accumulate'
  | 'thaw'
  | 'repair'
  | 'warm'

export type Temperature = 'cold' | 'neutral' | 'hot'
export type Confidence = 'low' | 'medium' | 'high'
export type LightLevel = 'cold' | 'neutral' | 'warm' | 'hot'

export interface DailyBar {
  openTime: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  closeTime: number
}

export interface IndicatorSnapshot {
  asOf: number
  price: number
  ahr999: number
  gma200: number
  expGrowth: number
  mayer: number
  sma50: number
  sma200: number
  ath: number
  drawdownFromAth: number
  aboveSma200: boolean
  sma50AboveSma200: boolean
  return7d: number
  return30d: number
  volumeExpanding: boolean
  higherLow: boolean
  fearGreed: number | null
  fearGreedLabel: string | null
  /** CBBI peak-confidence score 0–100; null if unavailable. */
  cbbi: number | null
  daysSinceLastHalving: number
  daysToNextHalving: number
  halvingPhase: 'early' | 'mid' | 'late' | 'pre'
  ahr999Percentile: number
  mayerPercentile: number
}

export interface DimensionScore {
  id: 'valuation' | 'trend' | 'sentiment' | 'cycle'
  score: number
  level: LightLevel
  weight: number
}

export interface DailyVerdict {
  regime: Regime
  temperature: Temperature
  confidence: Confidence
  score: number
  dimensions: DimensionScore[]
  reasonKey: string
  reasonParams: Record<string, string | number>
  indicators: IndicatorSnapshot
  fromCache: boolean
  updatedAt: number
  sourceLabel: string
}

export interface Ahr999Point {
  time: number
  value: number
  price: number
}
