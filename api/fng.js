export default async function handler(req, res) {
  const limit = typeof req.query?.limit === 'string' ? req.query.limit : '1'
  const upstream = await fetch(
    `https://api.alternative.me/fng/?limit=${encodeURIComponent(limit)}&format=json`,
  )
  const body = await upstream.text()
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(upstream.status).send(body)
}
