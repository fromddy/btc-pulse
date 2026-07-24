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

Static frontend + same-origin `/api/*` proxies (CORS).

### Netlify

`netlify-cli` is a local `devDependency` (install once via `npm install`; avoids slow `npx` downloads).

```bash
npm install
cp .env.example .env   # set VITE_* if needed
npx netlify login
npm run deploy         # production
# npm run deploy:preview
```

Config lives in `netlify.toml` (build → `dist`, SPA fallback). Same-origin `/api/*` proxies are Netlify Functions under `netlify/functions/`. Set the same `VITE_*` keys in the Netlify UI (Site configuration → Environment variables) so remote builds match local.

### Vercel

Thin serverless proxies in `/api` + `vercel.json` SPA rewrite.
