"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

/**
 * Fade-up on mount (staggered by `index`) + a subtle lift on hover, for
 * card grids that load as a list (feed, idea lab). Separate `transition`
 * on the hover state so the stagger delay doesn't also delay the hover
 * response. No animation when prefers-reduced-motion is set.
 */
export function AnimatedCard({
  children,
  index = 0,
  className,
}: {
  children: ReactNode
  index?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, delay: index * 0.05, ease: "easeOut" },
      }}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 28px -12px rgb(0 0 0 / 0.3)",
        transition: { duration: 0.2, ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  )
}
