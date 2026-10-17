"use client"

import { useEffect } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"

/** Animates a number from 0 up to `value` on mount. */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const count = useMotionValue(reduceMotion ? value : 0)
  const display = useTransform(
    count,
    (v) => `${prefix}${v.toFixed(decimals)}${suffix}`
  )

  useEffect(() => {
    if (reduceMotion) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { duration: 1, ease: "easeOut" })
    return () => controls.stop()
  }, [count, value, reduceMotion])

  return <motion.span className={className}>{display}</motion.span>
}
