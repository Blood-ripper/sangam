"use client"

import { motion, useReducedMotion } from "motion/react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SangamMark } from "@/components/brand/sangam-logo"
import { OrbitingCircles } from "@/components/magicui/orbiting-circles"
import { initials } from "./lib"

const AVATAR_TINTS = ["#4d66e9", "#e89e31", "#24b07f", "#8c72ee"]

export function IdeaLabHero({
  founders,
  ideaCount,
  onPost,
}: {
  /** Distinct names of recent founders, newest first; null while loading. */
  founders: string[] | null
  ideaCount: number
  onPost: () => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="glass glass-sheen relative overflow-hidden rounded-[1.75rem] px-6 py-8 sm:px-10 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-24 size-[26rem] rounded-full bg-[radial-gradient(circle,rgb(139_124_246/0.26),transparent_65%)]"
      />
      <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex max-w-2xl flex-col gap-5"
        >
          <h1 className="text-[2rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance sm:text-5xl">
            Bring an idea. Meet the people who’ll build it with you.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Share what you’re working on, get honest votes from verified founders and mentors, and
            find the teammates you’re missing.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button size="lg" onClick={onPost} className="h-11 px-5 text-[0.95rem]">
              <Plus aria-hidden="true" />
              Post an idea
            </Button>
            {founders === null ? null : founders.length > 0 ? (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {founders.slice(0, 4).map((name, i) => (
                    <span
                      key={`${name}-${i}`}
                      title={name}
                      className="grid size-8 place-items-center rounded-full text-[11px] font-bold text-white ring-2 ring-[#0e1020]"
                      style={{ background: `color-mix(in oklab, ${AVATAR_TINTS[i % AVATAR_TINTS.length]} 72%, #0e1020)` }}
                    >
                      {initials(name)}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {ideaCount} {ideaCount === 1 ? "idea" : "ideas"} shared so far
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {ideaCount > 0
                  ? `${ideaCount} ${ideaCount === 1 ? "idea" : "ideas"} shared so far. Add yours.`
                  : "Be the first founder to share an idea."}
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mx-auto hidden size-56 items-center justify-center sm:flex"
        >
          <OrbitingCircles radius={100} iconSize={12} duration={24}>
            <span className="size-3 rounded-full bg-[#4d66e9] shadow-[0_0_14px_#4d66e9]" />
            <span className="size-3 rounded-full bg-[#e89e31] shadow-[0_0_14px_#e89e31]" />
            <span className="size-3 rounded-full bg-[#24b07f] shadow-[0_0_14px_#24b07f]" />
          </OrbitingCircles>
          <div className="relative grid size-32 place-items-center rounded-[2.25rem] border border-white/20 bg-[linear-gradient(145deg,rgb(160_140_255/0.42),rgb(111_139_255/0.18)_55%,rgb(103_232_249/0.14))] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-12px_24px_rgb(10_12_30/0.35),0_30px_60px_-20px_rgb(110_91_235/0.7)] backdrop-blur-xl">
            <SangamMark size={68} title="Sangam" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
