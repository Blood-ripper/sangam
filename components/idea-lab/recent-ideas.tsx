"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { motion } from "motion/react"
import { formatDistance } from "date-fns"
import { MeterBar } from "@/components/charts/meter-bar"
import { cn } from "@/lib/utils"
import { STAGES, STAGE_ORDER, stageOf, type Idea, type StageKey } from "./lib"
import { StageChip } from "./stage-chip"

type Tab = "all" | StageKey
const PAGE_SIZE = 6

export function RecentIdeas({ ideas, now }: { ideas: Idea[]; now: number }) {
  const [tab, setTab] = useState<Tab>("all")
  const [expanded, setExpanded] = useState(false)

  const sorted = useMemo(
    () => [...ideas].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [ideas]
  )

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: sorted.length, capture: 0, discover: 0, build: 0 }
    for (const idea of sorted) c[stageOf(idea.idea_pulse)]++
    return c
  }, [sorted])

  const rows = tab === "all" ? sorted : sorted.filter((i) => stageOf(i.idea_pulse) === tab)
  const visible = expanded ? rows : rows.slice(0, PAGE_SIZE)
  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All ideas" },
    ...STAGE_ORDER.map((k) => ({ key: k as Tab, label: STAGES[k].label })),
  ]

  return (
    <section
      id="recent-ideas"
      data-slot="card"
      aria-labelledby="recent-ideas-heading"
      className="flex min-w-0 scroll-mt-24 flex-col gap-5 p-5 sm:p-6"
    >
      <header className="flex flex-col gap-1">
        <h2 id="recent-ideas-heading" className="text-lg font-bold tracking-tight">
          Recent ideas
        </h2>
        <p className="text-sm text-muted-foreground">
          Newest first. Open one to vote, comment or ask for an AI critique.
        </p>
      </header>

      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter ideas by stage">
        {tabs.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setTab(t.key)
                setExpanded(false)
              }}
              className={cn(
                "relative shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="idea-tab-pill"
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white/[0.08] ring-1 ring-white/15"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">
                {t.label}
                <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{counts[t.key]}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[minmax(0,1fr)_8.5rem_minmax(9rem,12rem)] gap-6 border-b border-white/[0.06] px-3 pb-2.5 text-xs font-medium text-muted-foreground sm:grid"
        >
          <span>Idea</span>
          <span>Stage</span>
          <span>Validation</span>
        </div>

        {visible.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            No ideas in {tab === "all" ? "the lab" : STAGES[tab as StageKey].label} yet.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/[0.05]">
            {visible.map((idea) => {
              const title = idea.title ?? "Untitled idea"
              const meta = [
                formatDistance(new Date(idea.created_at), now, { addSuffix: true }),
                idea.target_users,
              ]
                .filter(Boolean)
                .join(" · ")
              return (
                <li key={idea.id}>
                  <Link
                    href={`/idea-lab/${idea.id}`}
                    className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 rounded-xl px-3 py-3.5 transition-colors hover:bg-white/[0.04] sm:grid-cols-[minmax(0,1fr)_8.5rem_minmax(9rem,12rem)] sm:gap-x-6"
                  >
                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <p className="truncate font-semibold text-foreground">{title}</p>
                      <p className="truncate text-xs text-muted-foreground">{meta}</p>
                    </div>
                    <StageChip stage={stageOf(idea.idea_pulse)} />
                    <MeterBar value={idea.idea_pulse} label={`Idea Pulse for ${title}`} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {rows.length > PAGE_SIZE && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 self-start rounded-lg px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-white/[0.05] hover:text-foreground"
          >
            {expanded ? "Show fewer" : `Show all ${rows.length}`}
          </button>
        )}
      </div>
    </section>
  )
}
