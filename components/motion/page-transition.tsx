"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react"

/**
 * A light fade between routes, wrapped around {children} in
 * app/layout.tsx. Also sets `reducedMotion="user"` here, at the root of
 * every page's motion tree — this is a safety net for any motion.*
 * component (e.g. Spotlight, pulled in from Aceternity UI) that has no
 * useReducedMotion() check of its own.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  return (
    <MotionConfig reducedMotion="user">
      {reduceMotion ? (
        <>{children}</>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </MotionConfig>
  )
}
