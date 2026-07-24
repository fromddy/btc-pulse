# BTC Pulse

**Trust the cycle. See the thaw. / 相信周期，看清回暖**

Daily Bitcoin regime thermometer. An installable PWA that turns a small set of BTC indicators into one clear verdict.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- i18next (中 / EN)
- vite-plugin-pwa
- Binance BTCUSDT daily (via `data-api.binance.vision` / Binance hosts) + Alternative.me Fear & Greed

## Develop

```bash
npm install
cp .env.example .env
npm run dev
```

Edit `.env` for local public config such as `VITE_X_URL`.  
Anything prefixed with `VITE_` is exposed to the browser. Do not put private API secrets there.

Local `/api/*` routes are proxied to Binance market data and Alternative.me.

## Test / Build

```bash
npm test
npm run build
npm run preview
```

## Deploy

Static frontend + thin Vercel serverless proxies in `/api` (CORS). Cloudflare Pages can use the same idea with Functions if preferred.
