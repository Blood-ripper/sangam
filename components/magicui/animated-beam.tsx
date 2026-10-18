"use client"

import { motion, useReducedMotion } from "motion/react"
import { type RefObject, useEffect, useId, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Adapted from Magic UI's Animated Beam (MIT, magicui.design).
 * Draws a curved line between two elements inside `containerRef` with a
 * light travelling along it — used to show nodes joining Sangam.
 */
export interface AnimatedBeamProps {
  className?: string
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  delay?: number
  duration?: number
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 4,
  delay = 0,
  pathColor = "rgb(255 255 255)",
  pathWidth = 2,
  pathOpacity = 0.08,
  gradientStartColor = "#a08cff",
  gradientStopColor = "#67e8f9",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const rawId = useId()
  const id = `beam-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const reduceMotion = useReducedMotion()
  const [pathD, setPathD] = useState("")
  const [size, setSize] = useState({ width: 0, height: 0 })

  const coords = reverse
    ? { x1: ["90%", "-10%"], x2: ["100%", "0%"], y1: ["0%", "0%"], y2: ["0%", "0%"] }
    : { x1: ["10%", "110%"], x2: ["0%", "100%"], y1: ["0%", "0%"], y2: ["0%", "0%"] }

  useEffect(() => {
    const update = () => {
      const container = containerRef.current
      const a = fromRef.current
      const b = toRef.current
      if (!container || !a || !b) return
      const c = container.getBoundingClientRect()
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      setSize({ width: c.width, height: c.height })
      const startX = ra.left - c.left + ra.width / 2 + startXOffset
      const startY = ra.top - c.top + ra.height / 2 + startYOffset
      const endX = rb.left - c.left + rb.width / 2 + endXOffset
      const endY = rb.top - c.top + rb.height / 2 + endYOffset
      const controlY = startY - curvature
      setPathD(`M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`)
    }
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    update()
    return () => ro.disconnect()
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset])

  return (
    <svg
      fill="none"
      width={size.width}
      height={size.height}
      aria-hidden="true"
      className={cn("pointer-events-none absolute top-0 left-0 transform-gpu", className)}
      viewBox={`0 0 ${size.width} ${size.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path d={pathD} strokeWidth={pathWidth} stroke={`url(#${id})`} strokeLinecap="round" />
      <defs>
        {reduceMotion ? (
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="30%" x2="70%" y1="0%" y2="0%">
            <stop stopColor={gradientStartColor} stopOpacity="0" />
            <stop offset="50%" stopColor={gradientStartColor} />
            <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
          </linearGradient>
        ) : (
          <motion.linearGradient
            id={id}
            gradientUnits="userSpaceOnUse"
            initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
            animate={{ x1: coords.x1, x2: coords.x2, y1: coords.y1, y2: coords.y2 }}
            transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 0 }}
          >
            <stop stopColor={gradientStartColor} stopOpacity="0" />
            <stop stopColor={gradientStartColor} />
            <stop offset="32.5%" stopColor={gradientStopColor} />
            <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
          </motion.linearGradient>
        )}
      </defs>
    </svg>
  )
}
