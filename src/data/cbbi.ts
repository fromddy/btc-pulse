import { isFresh, readCache, writeCache } from './cache'

const CACHE_KEY = 'cbbi'
const MAX_AGE_MS = 6 * 60 * 60 * 1000
const UPSTREAM = 'https://colintalkscrypto.com/cbbi/data/latest.json'

export interface CbbiReading {
  /** Peak-confidence score on a 0–100 scale (website percent). */
  value: number
  timestamp: number
}

interface SlimCbbiResponse {
  confidence: number
  asOf: number
}

interface FullCbbiResponse {
  Confidence?: Record<string, number>
}

function parseSlim(json: SlimCbbiResponse): CbbiReading | null {
  if (
    typeof json.confidence !== 'number' ||
    !Number.isFinite(json.confidence) ||
    typeof json.asOf !== 'number' ||
    !Number.isFinite(json.asOf)
  ) {
    return null
  }
  return {
    value: Math.round(json.confidence),
    timestamp: json.asOf * 1000,
  }
}

function parseFull(json: FullCbbiResponse): CbbiReading | null {
  const conf = json.Confidence
  if (!conf || typeof conf !== 'object') return null
  const keys = Object.keys(conf)
  if (keys.length === 0) return null
  let latestTs = keys[0]
  for (const k of keys) {
    if (Number(k) > Number(latestTs)) latestTs = k
  }
  const raw = conf[latestTs]
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null
  return {
    value: Math.round(raw * 100),
    timestamp: Number(latestTs) * 1000,
  }
}

export async function loadCbbi(opts?: {
  force?: boolean
}): Promise<{
  reading: CbbiReading | null
  fromCache: boolean
  fetchedAt: number | null
}> {
  const force = opts?.force ?? false
  const cached = readCache<CbbiReading>(CACHE_KEY)
  if (!force && cached && isFresh(cached.savedAt, MAX_AGE_MS)) {
    return {
      reading: cached.data,
      fromCache: true,
      fetchedAt: cached.savedAt,
    }
  }

  // Prefer slim same-origin proxy; fall back to full upstream (parse latest only).
  const attempts: Array<() => Promise<CbbiReading | null>> = [
    async () => {
      const res = await fetch('/api/cbbi')
      if (!res.ok) return null
      return parseSlim((await res.json()) as SlimCbbiResponse)
    },
    async () => {
      const res = await fetch(UPSTREAM)
      if (!res.ok) return null
      return parseFull((await res.json()) as FullCbbiResponse)
    },
  ]

  for (const attempt of attempts) {
    try {
      const reading = await attempt()
      if (!reading) continue
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
