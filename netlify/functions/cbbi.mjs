/** Same-origin proxy for CBBI — returns latest confidence only (not full history). */

const UPSTREAM = 'https://colintalkscrypto.com/cbbi/data/latest.json'

function slimLatest(json) {
  const conf = json?.Confidence
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
    confidence: Math.round(raw * 100),
    asOf: Number(latestTs),
  }
}

export default async () => {
  try {
    const upstream = await fetch(UPSTREAM)
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: 'upstream_error' }), {
        status: upstream.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
        },
      })
    }
    const json = await upstream.json()
    const slim = slimLatest(json)
    if (!slim) {
      return new Response(JSON.stringify({ error: 'parse_error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify(slim), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'fetch_failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = {
  path: '/api/cbbi',
}
