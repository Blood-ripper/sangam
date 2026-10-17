import confetti from "canvas-confetti"

/**
 * A short confetti burst for a success moment (e.g. confirming a hire).
 * Client-side only, and a no-op under prefers-reduced-motion.
 */
export function triggerHireConfetti() {
  if (typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  confetti({
    particleCount: 70,
    spread: 65,
    origin: { y: 0.65 },
  })
}
