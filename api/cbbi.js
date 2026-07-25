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

export default async function handler(_req, res) {
  try {
    const upstream = await fetch(UPSTREAM)
    if (!upstream.ok) {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=3600')
      res.status(upstream.status).json({ error: 'upstream_error' })
      return
    }
    const json = await upstream.json()
    const slim = slimLatest(json)
    if (!slim) {
      res.setHeader('Content-Type', 'application/json')
      res.status(502).json({ error: 'parse_error' })
      return
    }
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json(slim)
  } catch {
    res.setHeader('Content-Type', 'application/json')
    res.status(502).json({ error: 'fetch_failed' })
  }
}
