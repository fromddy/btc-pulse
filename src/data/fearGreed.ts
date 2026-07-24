import { isFresh, readCache, writeCache } from './cache'

const CACHE_KEY = 'fear-greed'
const MAX_AGE_MS = 6 * 60 * 60 * 1000

export interface FearGreedReading {
  value: number
  classification: string
  timestamp: number
}

interface FngApiResponse {
  data: Array<{
    value: string
    value_classification: string
    timestamp: string
  }>
}

export async function loadFearGreed(opts?: {
  force?: boolean
}): Promise<{
  reading: FearGreedReading | null
  fromCache: boolean
  fetchedAt: number | null
}> {
  const force = opts?.force ?? false
  const cached = readCache<FearGreedReading>(CACHE_KEY)
  if (!force && cached && isFresh(cached.savedAt, MAX_AGE_MS)) {
    return {
      reading: cached.data,
      fromCache: true,
      fetchedAt: cached.savedAt,
    }
  }

  const urls = [
    '/api/fng?limit=1&format=json',
    'https://api.alternative.me/fng/?limit=1&format=json',
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const json = (await res.json()) as FngApiResponse
      const row = json.data?.[0]
      if (!row) continue
      const reading: FearGreedReading = {
        value: Number(row.value),
        classification: row.value_classification,
        timestamp: Number(row.timestamp) * 1000,
      }
      const fetchedAt = Date.now()
      writeCache(CACHE_KEY, reading)
      return { reading, fromCache: false, fetchedAt }
    } catch {
      // try next
    }
  }

  if (cached) {
    return {
      reading: cached.data,
      fromCache: true,
      fetchedAt: cached.savedAt,
    }
  }
  return { reading: null, fromCache: false, fetchedAt: null }
}
