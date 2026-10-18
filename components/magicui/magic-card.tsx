"use client"

import { motion, useMotionTemplate, useMotionValue } from "motion/react"
import { type ReactNode, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Adapted from Magic UI's Magic Card (MIT). A glass panel whose border and
 * surface light up under the pointer — a spotlight that answers the cursor.
 */
export function MagicCard({
  children,
  className,
  contentClassName,
  gradientSize = 260,
  gradientColor = "rgb(139 124 246 / 0.16)",
  gradientFrom = "#a08cff",
  gradientTo = "#67e8f9",
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
  gradientSize?: number
  gradientColor?: string
  gradientFrom?: string
  gradientTo?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el) return
      const { left, top } = el.getBoundingClientRect()
      mouseX.set(e.clientX - left)
      mouseY.set(e.clientY - top)
    },
    [mouseX, mouseY]
  )
  const onLeave = useCallback(() => {
    mouseX.set(-gradientSize)
    mouseY.set(-gradientSize)
  }, [mouseX, mouseY, gradientSize])

  const borderBg = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo}, rgb(255 255 255 / 0.08) 100%)`
  const glowBg = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("group relative overflow-hidden rounded-[1.25rem]", className)}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: borderBg }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-px rounded-[inherit] bg-[linear-gradient(180deg,rgb(255_255_255/0.045),rgb(255_255_255/0.01)),#0c0e1d]"
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glowBg }}
      />
      <div className={cn("relative h-full", contentClassName)}>{children}</div>
    </div>
  )
}
