import { isFresh, readCache, writeCache } from './cache'
import type { DailyBar } from '../domain/types'

const CACHE_KEY = 'btc-daily-bars'
const MAX_AGE_MS = 6 * 60 * 60 * 1000
const SYMBOL = 'BTCUSDT'
const LIMIT = 1000

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
]

function parseKlines(rows: BinanceKline[]): DailyBar[] {
  return rows.map((k) => ({
    openTime: k[0],
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
    closeTime: k[6],
  }))
}

function isKlinePayload(data: unknown): data is BinanceKline[] {
  return Array.isArray(data) && Array.isArray(data[0])
}

async function fetchPage(endTime?: number): Promise<DailyBar[]> {
  const params = new URLSearchParams({
    symbol: SYMBOL,
    interval: '1d',
    limit: String(LIMIT),
  })
  if (endTime != null) params.set('endTime', String(endTime))

  const urls = [
    `/api/binance/klines?${params}`,
    `https://data-api.binance.vision/api/v3/klines?${params}`,
    `https://api.binance.com/api/v3/klines?${params}`,
  ]

  let lastError: unknown
  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Binance HTTP ${res.status}`)
      const json: unknown = await res.json()
      if (!isKlinePayload(json)) {
        throw new Error('Unexpected kline payload')
      }
      return parseKlines(json)
    } catch (err) {
      lastError = err
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Binance fetch failed')
}

/** Fetch ~4y of daily bars (two pages) with local cache. */
export async function loadBtcDailyBars(opts?: {
  force?: boolean
}): Promise<{
  bars: DailyBar[]
  fromCache: boolean
  fetchedAt: number
}> {
  const force = opts?.force ?? false
  const cached = readCache<DailyBar[]>(CACHE_KEY)
  if (
    !force &&
    cached &&
    isFresh(cached.savedAt, MAX_AGE_MS) &&
    cached.data.length >= 200
  ) {
    return { bars: cached.data, fromCache: true, fetchedAt: cached.savedAt }
  }

  try {
    const newest = await fetchPage()
    if (newest.length === 0) throw new Error('Empty klines')
    const earlier = await fetchPage(newest[0].openTime - 1)
    const map = new Map<number, DailyBar>()
    for (const b of [...earlier, ...newest]) map.set(b.openTime, b)
    const bars = [...map.values()].sort((a, b) => a.openTime - b.openTime)
    const fetchedAt = Date.now()
    writeCache(CACHE_KEY, bars)
    return { bars, fromCache: false, fetchedAt }
  } catch (err) {
    if (cached && cached.data.length >= 200) {
      return { bars: cached.data, fromCache: true, fetchedAt: cached.savedAt }
    }
    throw err
  }
}
