/// <reference types="vitest/config" />
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

function slimCbbiLatest(json: {
  Confidence?: Record<string, number>
}): { confidence: number; asOf: number } | null {
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

/** Dev-only: slim CBBI proxy so local `/api/cbbi` matches production. */
function cbbiDevProxy(): Plugin {
  return {
    name: 'cbbi-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/cbbi', async (_req, res) => {
        try {
          const upstream = await fetch(
            'https://colintalkscrypto.com/cbbi/data/latest.json',
          )
          if (!upstream.ok) {
            res.statusCode = upstream.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'upstream_error' }))
            return
          }
          const json = (await upstream.json()) as {
            Confidence?: Record<string, number>
          }
          const slim = slimCbbiLatest(json)
          if (!slim) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'parse_error' }))
            return
          }
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.setHeader(
            'Cache-Control',
            's-maxage=3600, stale-while-revalidate=86400',
          )
          res.end(JSON.stringify(slim))
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'fetch_failed' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cbbiDevProxy(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-maskable-512.png',
      ],
      manifest: {
        name: 'BTC Pulse',
        short_name: 'BTC Pulse',
        description: 'BTC Pulse. Trust the cycle. See the thaw.',
        theme_color: '#1f1218',
        background_color: '#e11d75',
        display: 'standalone',
        start_url: '/',
        lang: 'en',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pulse-market-data',
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api/binance': {
        // Public market-data host (api.binance.com is geo-blocked in some regions)
        target: 'https://data-api.binance.vision',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/binance/, '/api/v3'),
      },
      '/api/fng': {
        target: 'https://api.alternative.me',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fng/, '/fng'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
