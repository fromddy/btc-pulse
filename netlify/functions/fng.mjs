/** Same-origin proxy for Alternative.me Fear & Greed (CORS). */
export default async (req) => {
  const url = new URL(req.url)
  const limit = url.searchParams.get('limit') || '1'
  const upstream = await fetch(
    `https://api.alternative.me/fng/?limit=${encodeURIComponent(limit)}&format=json`,
  )
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
  path: '/api/fng',
}
