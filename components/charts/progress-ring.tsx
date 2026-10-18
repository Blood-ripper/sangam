"use client"

import { useInView, useReducedMotion } from "motion/react"
import { type ReactNode, useId, useRef } from "react"
import { cn } from "@/lib/utils"

/** A single-value gauge (0–100) with a violet → cyan arc and a centre readout. */
export function ProgressRing({
  value,
  size = 150,
  thickness = 12,
  label,
  children,
  className,
  from = "#a08cff",
  to = "#67e8f9",
}: {
  value: number
  size?: number
  thickness?: number
  label?: string
  children?: ReactNode
  className?: string
  from?: string
  to?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })
  const reduceMotion = useReducedMotion()
  const id = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const v = Math.max(0, Math.min(100, value))
  const r = (size - thickness) / 2
  const C = 2 * Math.PI * r
  const len = (v / 100) * C
  const drawn = inView || reduceMotion

  return (
    <div ref={ref} className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label={`${label ?? "Progress"}: ${Math.round(v)}%`}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={drawn ? `${len} ${C}` : `0 ${C}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: reduceMotion ? undefined : "stroke-dasharray 1.2s cubic-bezier(.2,.8,.2,1) .15s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <>
            <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{Math.round(v)}%</span>
            {label && <span className="text-xs text-muted-foreground">{label}</span>}
          </>
        )}
      </div>
    </div>
  )
}
