"use client"

import Link from "next/link"
import { Lightbulb } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { ShimmerLink } from "@/components/magicui/shimmer-button"
import { AuroraShader } from "@/components/shader/aurora-shader"
import { ConfluenceCanvas } from "@/components/three/confluence-canvas"

const EASE = [0.2, 0.8, 0.2, 1] as const

const PROMISES = [
  { label: "Hires confirmed by candidates", color: "var(--brand-blue)" },
  { label: "Scam-pattern listings blocked", color: "var(--brand-amber)" },
  { label: "A free path when you're not ready", color: "var(--brand-emerald)" },
]

const RIVERS = [
  { label: "Talent", color: "var(--brand-blue)", className: "left-[4%] top-[14%]" },
  { label: "Ideas", color: "var(--brand-amber)", className: "left-[2%] bottom-[18%]" },
  { label: "Opportunity", color: "var(--brand-emerald)", className: "right-[3%] bottom-[24%]" },
]

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: EASE, delay },
        }

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_62%,transparent)]">
        <AuroraShader />
      </div>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-4 pt-28 pb-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:px-8 lg:pt-36 lg:pb-24">
        <div className="flex flex-col items-start">
          <h1 className="font-heading text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-6xl lg:text-[4.4rem] xl:text-[4.9rem]">
            <span className="block overflow-hidden pb-1">
              <motion.span className="block max-w-[15ch]" {...rise(0.05)}>
                Where talent, ideas and opportunities meet.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.span className="text-gradient-accent block" {...rise(0.22)}>
                Proof, not promises.
              </motion.span>
            </span>
          </h1>

          <motion.p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg" {...rise(0.38)}>
            Sangam is the verified network for India&apos;s job seekers, founders, mentors and recruiters. A hire
            counts only when the candidate confirms it, and every idea is tested by the community before anyone
            builds it.
          </motion.p>

          <motion.div className="mt-8 flex flex-wrap items-center gap-3" {...rise(0.5)}>
            <ShimmerLink href="/auth" className="h-12 px-7 text-[15px]">
              Get started free
            </ShimmerLink>
            <Link
              href="/idea-lab"
              className="glass glass-sheen inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold text-foreground transition-colors hover:bg-white/[0.08]"
            >
              <Lightbulb className="size-4 text-brand-amber" aria-hidden="true" />
              Explore Idea Lab
            </Link>
          </motion.div>

          <motion.ul className="mt-9 flex flex-col gap-2.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6" {...rise(0.62)}>
            {PROMISES.map((p) => (
              <li key={p.label} className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden="true" />
                {p.label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          className="relative mx-auto aspect-square w-full max-w-[min(560px,92vw)] lg:mr-0"
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, scale: 0.92 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 1.2, ease: EASE, delay: 0.15 },
              })}
        >
          <ConfluenceCanvas className="size-full" />
          {RIVERS.map((r, i) => (
            <motion.span
              key={r.label}
              className={`glass absolute hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-foreground sm:inline-flex ${r.className}`}
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.6, ease: EASE, delay: 0.9 + i * 0.15 },
                  })}
            >
              <span className="size-2 rounded-full" style={{ background: r.color }} aria-hidden="true" />
              {r.label}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
