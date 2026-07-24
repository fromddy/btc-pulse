import { useEffect, useRef } from 'react'
import {
  createChart,
  LineSeries,
  LineStyle,
  type IChartApi,
  type LineData,
  type Time,
} from 'lightweight-charts'
import type { Ahr999Point } from '../domain/types'

export function Ahr999Chart({ series }: { series: Ahr999Point[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || series.length === 0) return

    const chart: IChartApi = createChart(ref.current, {
      height: 280,
      layout: {
        background: { color: 'transparent' },
        textColor: '#6e5660',
        fontFamily: 'Source Sans 3, system-ui, sans-serif',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: '#edd8e2' },
        horzLines: { color: '#edd8e2' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    })

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#e11d75',
      lineWidth: 2,
    })
    const data: LineData[] = series.map((p) => ({
      time: p.time as Time,
      value: p.value,
    }))
    lineSeries.setData(data)

    const low = chart.addSeries(LineSeries, {
      color: '#3a6d8c',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    const high = chart.addSeries(LineSeries, {
      color: '#a33b2b',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    low.setData(data.map((d) => ({ time: d.time, value: 0.45 })))
    high.setData(data.map((d) => ({ time: d.time, value: 1.2 })))

    chart.timeScale().fitContent()

    const ro = new ResizeObserver(() => {
      if (!ref.current) return
      chart.applyOptions({ width: ref.current.clientWidth })
    })
    ro.observe(ref.current)

    return () => {
      ro.disconnect()
      chart.remove()
    }
  }, [series])

  return <div ref={ref} className="w-full" />
}
