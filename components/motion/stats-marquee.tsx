"use client"

import { useReducedMotion } from "motion/react"
import { Marquee } from "@/components/motion/marquee"
import { CountUp } from "@/components/motion/count-up"

type Stat = {
  target: number
  decimals: number
  suffix: string
  label: string
  source: string
}

/**
 * Marquee's `repeat` prop renders the content 4 times over for a seamless
 * loop — under prefers-reduced-motion we don't just stop the animation
 * (that would leave 4 visible duplicate copies sitting still), we skip
 * Marquee entirely and show the stats once, in a plain wrapped row.
 */
export function StatsMarquee({ stats }: { stats: Stat[] }) {
  const reduceMotion = useReducedMotion()

  const pills = stats.map((stat) => (
    <div
      key={stat.label}
      className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-8 py-4 text-center"
    >
      <CountUp
        value={stat.target}
        decimals={stat.decimals}
        suffix={stat.suffix}
        className="text-2xl font-semibold"
      />
      <span className="text-xs text-muted-foreground">{stat.label}</span>
      <span className="text-[10px] text-muted-foreground">— {stat.source}</span>
    </div>
  ))

  if (reduceMotion) {
    return <div className="flex flex-wrap justify-center gap-4">{pills}</div>
  }

  return (
    <Marquee pauseOnHover className="[--duration:25s]">
      {pills}
    </Marquee>
  )
}
