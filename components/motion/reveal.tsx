"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

/**
 * Fade-up wrapper. `inView` triggers on scroll (whileInView, once) instead
 * of on mount — use that for below-the-fold content, leave it off for
 * content visible on load (e.g. a hero). `delay` staggers a group of
 * siblings. Renders a plain div with no animation when the viewer has
 * prefers-reduced-motion set.
 */
export function Reveal({
  children,
  delay = 0,
  inView = false,
  className,
}: {
  children: ReactNode
  delay?: number
  inView?: boolean
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const trigger = inView
    ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
    : { animate: { opacity: 1, y: 0 } }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      {...trigger}
    >
      {children}
    </motion.div>
  )
}
