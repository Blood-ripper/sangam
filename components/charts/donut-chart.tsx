"use client"

import { useInView, useReducedMotion } from "motion/react"
import { type ReactNode, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type DonutSegment = { label: string; value: number; color: string }

/**
 * Parts-of-a-whole donut. 2px surface gaps between segments, a legend with
 * values (identity is never colour alone), and a hover/focus readout in the
 * centre in place of a floating tooltip.
 */
export function DonutChart({
  segments,
  size = 168,
  thickness = 18,
  centerValue,
  centerLabel,
  ariaLabel,
  className,
  formatValue = (n) => new Intl.NumberFormat("en-IN").format(n),
}: {
  segments: DonutSegment[]
  size?: number
  thickness?: number
  centerValue?: ReactNode
  centerLabel?: string
  ariaLabel: string
  className?: string
  formatValue?: (n: number) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })
  const reduceMotion = useReducedMotion()
  const drawn = inView || reduceMotion
  const [active, setActive] = useState<number | null>(null)

  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0)
  const r = (size - thickness) / 2
  const C = 2 * Math.PI * r
  const GAP = segments.filter((s) => s.value > 0).length > 1 ? 2 : 0

  const fracs = segments.map((s) => (total ? Math.max(0, s.value) / total : 0))
  const arcs = segments.map((s, i) => {
    const frac = fracs[i]
    const before = fracs.slice(0, i).reduce((a, b) => a + b, 0)
    return { ...s, frac, len: Math.max(0, frac * C - GAP), angle: before * 360 }
  })

  const shown = active !== null ? arcs[active] : null

  return (
    <div ref={ref} className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={ariaLabel}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgb(255 255 255 / 0.06)"
            strokeWidth={thickness}
          />
          {arcs.map((a, i) =>
            a.len > 0 ? (
              <circle
                key={a.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={thickness}
                strokeDasharray={drawn ? `${a.len} ${C}` : `0 ${C}`}
                transform={`rotate(${a.angle - 90} ${size / 2} ${size / 2})`}
                opacity={active === null || active === i ? 1 : 0.35}
                style={{
                  transition: reduceMotion
                    ? "opacity .2s"
                    : `stroke-dasharray .9s cubic-bezier(.2,.8,.2,1) ${i * 0.12}s, opacity .2s`,
                  cursor: "pointer",
                }}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
              />
            ) : null
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {shown ? formatValue(shown.value) : (centerValue ?? formatValue(total))}
          </span>
          <span className="max-w-[70%] truncate text-xs text-muted-foreground">
            {shown ? shown.label : centerLabel}
          </span>
        </div>
      </div>

      <ul className="flex w-full min-w-0 flex-col gap-2 text-sm">
        {arcs.map((a, i) => (
          <li key={a.label}>
            <button
              type="button"
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2 py-1 text-left transition-colors hover:bg-white/5",
                active === i && "bg-white/5"
              )}
            >
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: a.color }} />
              <span className="min-w-0 flex-1 truncate text-foreground">{a.label}</span>
              <span className="font-semibold text-foreground tabular-nums">{formatValue(a.value)}</span>
              <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                {Math.round(a.frac * 100)}%
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
