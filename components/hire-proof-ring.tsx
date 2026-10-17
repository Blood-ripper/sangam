"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * Score ring (Hire-Proof score or Idea Pulse): an inline SVG arc, colored
 * green (>=80), amber (60-79), or red (<60). The arc sweeps in from empty
 * to the score on mount, unless prefers-reduced-motion is set.
 */
export function HireProofRing({
  score,
  size = 40,
  className,
}: {
  score: number
  size?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const stroke = Math.max(3, Math.round(size / 10))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const offset = circumference * (1 - clamped / 100)
  const colorClass =
    clamped >= 80
      ? "stroke-emerald-500"
      : clamped >= 60
        ? "stroke-amber-500"
        : "stroke-red-500"

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Hire-Proof score: ${clamped} out of 100`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={colorClass}
          initial={{ strokeDashoffset: reduceMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-medium"
        style={{ fontSize: Math.max(9, size / 4) }}
      >
        {clamped}
      </span>
    </div>
  )
}
