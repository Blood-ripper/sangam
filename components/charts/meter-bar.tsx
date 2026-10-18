"use client"

import { useInView, useReducedMotion } from "motion/react"
import { useRef } from "react"
import { cn } from "@/lib/utils"

/** Horizontal 0–100 meter (e.g. idea validation), filled with a CSS transition on first view. */
export function MeterBar({
  value,
  color,
  className,
  label,
  showValue = true,
}: {
  value: number
  /** CSS colour or gradient; defaults to the violet → cyan accent. */
  color?: string
  className?: string
  label: string
  showValue?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" })
  const reduceMotion = useReducedMotion()
  const v = Math.max(0, Math.min(100, Math.round(value)))
  const filled = inView || reduceMotion

  return (
    <div ref={ref} className={cn("flex items-center gap-3", className)}>
      <div
        className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: filled ? `${v}%` : "0%",
            background: color ?? "linear-gradient(90deg, #8c72ee, #67e8f9)",
            transition: reduceMotion ? undefined : "width .9s cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </div>
      {showValue && <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">{v}%</span>}
    </div>
  )
}
