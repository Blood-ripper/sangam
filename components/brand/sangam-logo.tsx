"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * The Sangam mark: three overlapping circles — Talent (blue, top),
 * Ideas (amber, bottom-left), Opportunity (emerald, bottom-right) —
 * meeting in the middle. Colours and geometry follow the team's logo.
 */
const CIRCLES = [
  { cx: 50, cy: 35, color: "#4d66e9", from: { x: 0, y: -18 } },
  { cx: 35.5, cy: 61, color: "#e89e31", from: { x: -16, y: 12 } },
  { cx: 64.5, cy: 61, color: "#24b07f", from: { x: 16, y: 12 } },
] as const

const R = 25

export function SangamMark({
  size = 32,
  animated = false,
  className,
  title = "Sangam",
}: {
  size?: number
  /** Circles drift in from apart and meet — use once per page, e.g. in a hero. */
  animated?: boolean
  className?: string
  title?: string
}) {
  const reduceMotion = useReducedMotion()
  const animate = animated && !reduceMotion

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("shrink-0 overflow-visible", className)}
    >
      {CIRCLES.map((c, i) =>
        animate ? (
          <motion.circle
            key={c.color}
            cx={c.cx}
            cy={c.cy}
            r={R}
            fill={c.color}
            fillOpacity={0.92}
            initial={{ x: c.from.x, y: c.from.y, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.15 + i * 0.12 }}
          />
        ) : (
          <circle key={c.color} cx={c.cx} cy={c.cy} r={R} fill={c.color} fillOpacity={0.92} />
        )
      )}
    </svg>
  )
}

export function SangamLogo({
  size = 32,
  animated = false,
  className,
  wordmarkClassName,
  showWordmark = true,
}: {
  size?: number
  animated?: boolean
  className?: string
  wordmarkClassName?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <SangamMark size={size} animated={animated} title={showWordmark ? "" : "Sangam"} />
      {showWordmark && (
        <span
          className={cn("font-semibold tracking-[-0.02em] text-white", wordmarkClassName)}
          style={{ fontSize: Math.round(size * 0.72), lineHeight: 1 }}
        >
          Sangam
        </span>
      )}
    </span>
  )
}
