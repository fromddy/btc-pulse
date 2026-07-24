/** Thin proxy so the static PWA can read Binance without browser CORS issues. */
export default async function handler(req, res) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(req.query ?? {})) {
    if (typeof value === 'string') params.set(key, value)
  }
  if (!params.has('symbol')) params.set('symbol', 'BTCUSDT')
  if (!params.has('interval')) params.set('interval', '1d')

  const hosts = [
    'https://data-api.binance.vision',
    'https://api.binance.com',
  ]
  let upstream
  for (const host of hosts) {
    upstream = await fetch(`${host}/api/v3/klines?${params.toString()}`)
    if (upstream.ok) break
  }
  if (!upstream) {
    res.status(502).send(JSON.stringify({ error: 'upstream unavailable' }))
    return
  }
  const body = await upstream.text()
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(upstream.status).send(body)
}
