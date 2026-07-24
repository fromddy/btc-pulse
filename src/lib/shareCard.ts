import type { DailyVerdict } from '../domain/types'

export interface ShareCardCopy {
  brand: string
  tagline: string
  regime: string
  temperature: string
  confidence: string
  reason: string
  ahr999Label: string
  mayerLabel: string
  drawdownLabel: string
  priceLabel: string
  footer: string
  dateLabel: string
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const lines: string[] = []
  let line = ''
  const chars = [...text]

  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)

  const shown = lines.slice(0, maxLines)
  if (lines.length > maxLines && shown.length > 0) {
    shown[shown.length - 1] =
      `${shown[shown.length - 1].replace(/[。.?…]*$/, '')}…`
  }
  return shown
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
) {
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight))
  return lines.length * lineHeight
}

function accentFor(temperature: DailyVerdict['temperature']) {
  if (temperature === 'cold') return '#3a6d8c'
  if (temperature === 'hot') return '#a33b2b'
  return '#e11d75'
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export function renderShareCardPng(
  verdict: DailyVerdict,
  copy: ShareCardCopy,
): Promise<Blob> {
  const width = 1080
  const height = 1350
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas unavailable'))

  const ink = '#1f1218'
  const soft = '#6e5660'
  const line = '#e8d0da'
  const panel = '#fff8fb'
  const chip = '#f8eef3'
  const accent = accentFor(verdict.temperature)
  const i = verdict.indicators

  // Outer canvas background
  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#fff5f9')
  bg.addColorStop(1, '#f3e0e8')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  // Soft accent glow (clipped feel, not content)
  ctx.fillStyle =
    verdict.temperature === 'cold'
      ? 'rgba(47, 111, 143, 0.12)'
      : verdict.temperature === 'hot'
        ? 'rgba(179, 58, 44, 0.10)'
        : 'rgba(225, 29, 117, 0.14)'
  ctx.beginPath()
  ctx.arc(860, 160, 240, 0, Math.PI * 2)
  ctx.fill()

  // Card panel
  const cardX = 72
  const cardY = 72
  const cardW = width - cardX * 2
  const cardH = height - cardY * 2
  const pad = 72
  const left = cardX + pad
  const contentW = cardW - pad * 2
  const right = left + contentW

  ctx.fillStyle = panel
  roundRect(ctx, cardX, cardY, cardW, cardH, 40)
  ctx.fill()
  ctx.strokeStyle = line
  ctx.lineWidth = 2
  roundRect(ctx, cardX, cardY, cardW, cardH, 40)
  ctx.stroke()

  let y = cardY + pad

  // Brand: BTC in pink, Pulse in ink
  ctx.textBaseline = 'top'
  ctx.font = '650 78px Fraunces, "PingFang SC", "Noto Sans SC", sans-serif'
  const [brandHead, ...brandRest] = copy.brand.split(' ')
  const brandTail = brandRest.join(' ')
  ctx.fillStyle = '#e11d75'
  ctx.fillText(brandHead, left, y)
  if (brandTail) {
    const headW = ctx.measureText(`${brandHead} `).width
    ctx.fillStyle = ink
    ctx.fillText(brandTail, left + headW, y)
  }
  y += 96

  // Tagline
  ctx.fillStyle = soft
  ctx.font = '500 34px "Source Sans 3", "PingFang SC", "Noto Sans SC", sans-serif'
  const tagLines = wrapLines(ctx, copy.tagline, contentW, 2)
  drawLines(ctx, tagLines, left, y, 46)
  y += tagLines.length * 46 + 48

  // Temperature pill (width follows text, left-aligned to content)
  ctx.font = '700 28px "Source Sans 3", "PingFang SC", "Noto Sans SC", sans-serif'
  const tempWidth = ctx.measureText(copy.temperature).width
  const pillPadX = 28
  const pillH = 52
  const pillW = tempWidth + pillPadX * 2
  ctx.fillStyle = accent
  roundRect(ctx, left, y, pillW, pillH, pillH / 2)
  ctx.fill()
  ctx.fillStyle = '#fbfcf9'
  ctx.textBaseline = 'middle'
  ctx.fillText(copy.temperature, left + pillPadX, y + pillH / 2)
  y += pillH + 28

  // Regime title
  ctx.fillStyle = ink
  ctx.textBaseline = 'top'
  ctx.font = '650 78px Fraunces, "PingFang SC", "Noto Sans SC", sans-serif'
  const regimeLines = wrapLines(ctx, copy.regime, contentW, 2)
  drawLines(ctx, regimeLines, left, y, 88)
  y += regimeLines.length * 88 + 18

  // Confidence
  ctx.fillStyle = soft
  ctx.font = '600 30px "Source Sans 3", "PingFang SC", "Noto Sans SC", sans-serif'
  ctx.fillText(copy.confidence, left, y)
  y += 48

  // Reason
  ctx.fillStyle = ink
  ctx.font = '500 32px "Source Sans 3", "PingFang SC", "Noto Sans SC", sans-serif'
  const reasonLines = wrapLines(ctx, copy.reason, contentW, 4)
  drawLines(ctx, reasonLines, left, y, 46)
  y += reasonLines.length * 46 + 40

  // Metrics 2x2, symmetric
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(i.price)
  const metrics = [
    [copy.ahr999Label, i.ahr999.toFixed(2)],
    [copy.mayerLabel, i.mayer.toFixed(2)],
    [copy.drawdownLabel, `${(i.drawdownFromAth * 100).toFixed(1)}%`],
    [copy.priceLabel, price],
  ] as const

  const gap = 20
  const cellW = (contentW - gap) / 2
  const cellH = 108
  metrics.forEach(([label, value], idx) => {
    const col = idx % 2
    const row = Math.floor(idx / 2)
    const x = left + col * (cellW + gap)
    const cy = y + row * (cellH + gap)
    ctx.fillStyle = chip
    roundRect(ctx, x, cy, cellW, cellH, 22)
    ctx.fill()
    ctx.fillStyle = soft
    ctx.font = '600 24px "Source Sans 3", "PingFang SC", "Noto Sans SC", sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText(label, x + 28, cy + 26)
    ctx.fillStyle = ink
    ctx.font = '700 36px "Source Sans 3", "PingFang SC", "Noto Sans SC", sans-serif'
    ctx.fillText(value, x + 28, cy + 58)
  })
  y += cellH * 2 + gap + 36

  // Footer aligned to same left edge
  ctx.fillStyle = soft
  ctx.font = '500 24px "Source Sans 3", "PingFang SC", "Noto Sans SC", sans-serif'
  ctx.fillText(copy.dateLabel, left, y)
  y += 36
  ctx.fillText(copy.footer, left, y)

  // Safety: keep footer inside card
  void right

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('PNG encode failed'))
      else resolve(blob)
    }, 'image/png')
  })
}

/** Always download the PNG to the device. */
export function downloadCardBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
