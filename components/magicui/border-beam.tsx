"use client"

import { motion, useReducedMotion, type MotionStyle, type Transition } from "motion/react"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

/**
 * Adapted from Magic UI's Border Beam (MIT). A short light that travels
 * around the border of its (relative, rounded) parent.
 */
export function BorderBeam({
  className,
  size = 60,
  delay = 0,
  duration = 7,
  colorFrom = "#a08cff",
  colorTo = "#67e8f9",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: {
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  transition?: Transition
  className?: string
  style?: CSSProperties
  reverse?: boolean
  initialOffset?: number
  borderWidth?: number
}) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-(length:--border-beam-width) border-transparent [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-composite:intersect] [mask-clip:padding-box,border-box]"
      style={{ "--border-beam-width": `${borderWidth}px` } as CSSProperties}
    >
      <motion.div
        className={cn(
          "absolute aspect-square bg-gradient-to-l from-(--color-from) via-(--color-to) to-transparent",
          className
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay, ...transition }}
      />
    </div>
  )
}
