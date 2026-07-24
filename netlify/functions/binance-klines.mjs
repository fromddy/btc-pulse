/** Same-origin proxy for Binance klines (CORS + host fallback). */
export default async (req) => {
  const url = new URL(req.url)
  const params = new URLSearchParams(url.search)
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
    return new Response(JSON.stringify({ error: 'upstream unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await upstream.text()
  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

export const config = {
  path: '/api/binance/klines',
}
