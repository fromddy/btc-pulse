import { computeAhr999Series } from '../domain/ahr999'
import { buildIndicatorSnapshot } from '../domain/indicators'
import { evaluateVerdict } from '../domain/regime'
import type { Ahr999Point, DailyBar, DailyVerdict } from '../domain/types'
import { loadBtcDailyBars } from './binanceKlines'
import { loadFearGreed } from './fearGreed'
import { readCache, writeCache } from './cache'
import { sleep, type LoadStepId } from './loadSteps'

const PULSE_CACHE = 'pulse-payload'

export interface PulsePayload {
  verdict: DailyVerdict
  bars: DailyBar[]
  ahr999Series: Ahr999Point[]
}

export async function loadPulse(opts?: {
  force?: boolean
  /** Pace step transitions so the thinking UI is readable. */
  paced?: boolean
  onStep?: (step: LoadStepId) => void
}): Promise<PulsePayload> {
  const force = opts?.force ?? false
  const paced = opts?.paced ?? false
  const pace = async (ms: number) => {
    if (paced) await sleep(ms)
  }

  opts?.onStep?.('connect')
  await pace(280)

  opts?.onStep?.('price')
  const btcPromise = loadBtcDailyBars({ force })
  await pace(120)

  opts?.onStep?.('sentiment')
  const [btc, fng] = await Promise.all([btcPromise, loadFearGreed({ force })])
  await pace(220)

  opts?.onStep?.('indicators')
  const indicators = buildIndicatorSnapshot(
    btc.bars,
    fng.reading
      ? { value: fng.reading.value, classification: fng.reading.classification }
      : null,
  )
  const ahr999Series = computeAhr999Series(btc.bars)
  await pace(260)

  opts?.onStep?.('verdict')
  const fetchedAt = Math.max(btc.fetchedAt, fng.fetchedAt ?? btc.fetchedAt)
  const fromCache = btc.fromCache && fng.fromCache
  const verdict = evaluateVerdict(indicators, {
    fromCache,
    updatedAt: fetchedAt,
    sourceLabel: 'Binance BTCUSDT · UTC daily',
  })
  await pace(200)

  const payload: PulsePayload = {
    verdict,
    bars: btc.bars,
    ahr999Series,
  }
  writeCache(PULSE_CACHE, payload)
  return payload
}

export function loadCachedPulse(): PulsePayload | null {
  const cached = readCache<PulsePayload>(PULSE_CACHE)
  if (!cached) return null
  return {
    ...cached.data,
    verdict: {
      ...cached.data.verdict,
      fromCache: true,
      updatedAt: cached.data.verdict.updatedAt || cached.savedAt,
    },
  }
}
