"use client"

import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react"
import { type ComponentPropsWithoutRef, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/** Adapted from Magic UI's Number Ticker (MIT). Counts up when scrolled into view (Indian digit grouping). */
export function NumberTicker({
  value,
  startValue = 0,
  delay = 0,
  decimalPlaces = 0,
  className,
  ...props
}: ComponentPropsWithoutRef<"span"> & {
  value: number
  startValue?: number
  delay?: number
  decimalPlaces?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduceMotion = useReducedMotion()
  const motionValue = useMotionValue(startValue)
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const inView = useInView(ref, { once: true, margin: "0px" })

  const format = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(n.toFixed(decimalPlaces)))

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = format(value)
      return
    }
    const t = setTimeout(() => motionValue.set(value), delay * 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, delay, reduceMotion, motionValue])

  useEffect(
    () =>
      spring.on("change", (latest) => {
        if (ref.current) ref.current.textContent = format(latest)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spring, decimalPlaces]
  )

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)} {...props}>
      {format(startValue)}
    </span>
  )
}
