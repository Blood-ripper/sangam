"use client"

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const QUOTES = [
  {
    text: "Talent is spread evenly across India. Opportunity isn't, yet. Sangam is where the two meet.",
    by: "The idea behind Sangam",
  },
  {
    text: "Three streams, one current: talent, ideas and opportunity.",
    by: "Sangam",
  },
  {
    text: "A hire counts when the candidate says it happened.",
    by: "The Hire-Proof rule",
  },
  {
    text: "If you want to go fast, go alone. If you want to go far, go together.",
    by: "African proverb",
  },
]

const STRANDS = [
  { d: "M 70 40 C 92 140, 168 214, 200 300", color: "var(--brand-blue)", label: "Talent", x: 70 },
  { d: "M 200 30 C 196 130, 204 220, 200 300", color: "var(--brand-amber)", label: "Ideas", x: 200 },
  { d: "M 330 40 C 308 140, 232 214, 200 300", color: "var(--brand-emerald)", label: "Opportunity", x: 330 },
]
const TRUNK = "M 200 300 C 197 360, 205 410, 200 468"

function Strands() {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "center 50%"] })
  const branch = useTransform(scrollYProgress, [0, 0.7], [0, 1])
  const trunk = useTransform(scrollYProgress, [0.62, 1], [0, 1])

  return (
    <div ref={ref} className="mx-auto w-full max-w-[380px]">
      <svg
        viewBox="0 0 400 500"
        className="h-auto w-full drop-shadow-[0_0_22px_rgb(139_124_246/0.22)]"
        role="img"
        aria-label="Three strands, talent, ideas and opportunity, merging into one"
      >
        {STRANDS.map((s) => (
          <g key={s.label}>
            <path d={s.d} fill="none" stroke="rgb(255 255 255 / 0.05)" strokeWidth={12} strokeLinecap="round" />
            <motion.path
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth={12}
              strokeLinecap="round"
              style={{ pathLength: reduceMotion ? 1 : branch }}
            />
            <text
              x={s.x}
              y={16}
              textAnchor="middle"
              className="fill-[#9ba1bc] text-[15px] font-medium"
            >
              {s.label}
            </text>
          </g>
        ))}
        <path d={TRUNK} fill="none" stroke="rgb(255 255 255 / 0.05)" strokeWidth={12} strokeLinecap="round" />
        <motion.path
          d={TRUNK}
          fill="none"
          stroke="#f4f5fb"
          strokeWidth={12}
          strokeLinecap="round"
          style={{ pathLength: reduceMotion ? 1 : trunk }}
        />
        <text x={200} y={496} textAnchor="middle" className="fill-[#eceef8] text-[15px] font-semibold">
          Sangam
        </text>
      </svg>
    </div>
  )
}

function QuoteRotator() {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || reduceMotion) return
    const id = setInterval(() => setIndex((v) => (v + 1) % QUOTES.length), 6500)
    return () => clearInterval(id)
  }, [paused, reduceMotion])

  const q = QUOTES[index]

  return (
    <figure
      className="glass glass-sheen relative mt-10 rounded-[1.5rem] p-6 sm:p-8"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="min-h-[7.5rem] sm:min-h-[6.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <blockquote className="font-heading text-xl leading-snug font-semibold tracking-tight text-foreground sm:text-2xl">
              &ldquo;{q.text}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">{q.by}</figcaption>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex items-center gap-2" role="group" aria-label="Choose a quote">
        {QUOTES.map((item, i) => (
          <button
            key={item.text}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show quote ${i + 1} of ${QUOTES.length}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-7 bg-violet" : "w-1.5 bg-white/25 hover:bg-white/45"
            )}
          />
        ))}
      </div>
    </figure>
  )
}

export function ConfluenceSection() {
  return (
    <section aria-labelledby="confluence-heading" className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="min-w-0">
          <h2 id="confluence-heading" className="sr-only">
            Why the name Sangam
          </h2>
          <p
            lang="hi"
            className="font-devanagari bg-[linear-gradient(180deg,#ffffff_20%,rgb(255_255_255/0.35))] bg-clip-text pb-4 text-[6rem] leading-[1.1] text-transparent sm:text-[9rem] lg:text-[10.5rem]"
          >
            संगम
          </p>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Sangam</span>, noun: the place where rivers meet. At
            Prayagraj the Ganga, the Yamuna and the unseen Saraswati flow on as one. We built a network on the same
            idea.
          </p>
          <QuoteRotator />
        </div>
        <Strands />
      </div>
    </section>
  )
}
