"use client"

import { motion, useInView, useReducedMotion } from "motion/react"
import { useId, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type SparkPoint = { label: string; value: number }

/** Catmull-Rom → cubic Bézier for a smooth line through every point. */
function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return ""
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const t = 0.18
    const c1x = p1[0] + (p2[0] - p0[0]) * t
    const c1y = p1[1] + (p2[1] - p0[1]) * t
    const c2x = p2[0] - (p3[0] - p1[0]) * t
    const c2y = p2[1] - (p3[1] - p1[1]) * t
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`
  }
  return d
}

/**
 * A single-series trend line for stat tiles. 2px line, soft area, a
 * crosshair + tooltip on hover, and a screen-reader table of the values.
 */
export function Sparkline({
  data,
  color = "var(--chart-1)",
  height = 44,
  className,
  ariaLabel,
  formatValue = (n) => new Intl.NumberFormat("en-IN").format(n),
}: {
  data: SparkPoint[]
  color?: string
  height?: number
  className?: string
  ariaLabel: string
  formatValue?: (n: number) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })
  const reduceMotion = useReducedMotion()
  const gradId = `spark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [hover, setHover] = useState<number | null>(null)

  const W = 100
  const H = height
  const PAD = 4

  const pts = useMemo<[number, number][]>(() => {
    const values = data.length ? data.map((d) => d.value) : [0, 0]
    const max = Math.max(...values)
    const min = Math.min(...values)
    const span = max - min || 1
    const n = values.length
    return values.map((v, i) => [
      n === 1 ? W / 2 : (i / (n - 1)) * W,
      PAD + (1 - (v - min) / span) * (H - PAD * 2),
    ])
  }, [data, H])

  const line = smoothPath(pts.length === 1 ? [[0, pts[0][1]], [W, pts[0][1]]] : pts)
  const area = line ? `${line} L ${W},${H} L 0,${H} Z` : ""
  const active = hover !== null ? data[hover] : null
  const activePt = hover !== null ? pts[hover] : null

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!data.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(x * (data.length - 1)))))
  }

  return (
    <div
      ref={ref}
      className={cn("relative w-full touch-none select-none", className)}
      style={{ height }}
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill={`url(#${gradId})`}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={inView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>

      {activePt && active && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/20"
            style={{ left: `${activePt[0]}%` }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#0e1020]"
            style={{ left: `${activePt[0]}%`, top: `${(activePt[1] / H) * 100}%`, background: color }}
          />
          <div
            className="pointer-events-none absolute -top-2 z-10 -translate-y-full rounded-lg border border-white/10 bg-[#141729]/95 px-2 py-1 text-[11px] leading-tight whitespace-nowrap shadow-lg backdrop-blur"
            style={{
              left: `${activePt[0]}%`,
              transform: `translate(${activePt[0] > 70 ? "-100%" : activePt[0] < 30 ? "0%" : "-50%"}, -100%)`,
            }}
          >
            <span className="text-muted-foreground">{active.label}</span>
            <span className="ml-1.5 font-semibold text-foreground tabular-nums">{formatValue(active.value)}</span>
          </div>
        </>
      )}

      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
