"use client"

import { useEffect, useMemo, useState } from "react"
import { Gauge, Lightbulb, RefreshCw, Rocket, Sprout, FlaskConical } from "lucide-react"
import { subDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog } from "@/components/ui/dialog"
import { IdeaLabHero } from "@/components/idea-lab/hero"
import { StatTile } from "@/components/idea-lab/stat-tile"
import { Pipeline } from "@/components/idea-lab/pipeline"
import { RecentIdeas } from "@/components/idea-lab/recent-ideas"
import { ActivityTimeline, QuickActions, StageBreakdown, VentureReady } from "@/components/idea-lab/insights"
import { PostIdeaDialog } from "@/components/idea-lab/post-idea-dialog"
import {
  CHART,
  VENTURE_THRESHOLD,
  averagePulse,
  dailySeries,
  stageOf,
  type Idea,
  type StageKey,
} from "@/components/idea-lab/lib"

export default function IdeaLabPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  // Captured when data arrives so relative dates and 14-day series are
  // computed from one consistent "now" (and not during render).
  const [now, setNow] = useState<number | null>(null)

  // The top bar's "New idea" button links here with ?new=1.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") !== "1") return
    window.history.replaceState(null, "", window.location.pathname)
    const t = window.setTimeout(() => setOpen(true), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    let cancelled = false

    fetch("/api/ideas")
      .then(async (res) => {
        const json = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setError(json.error ?? "Could not load ideas.")
          return
        }
        setIdeas(json.ideas ?? [])
        setNow(Date.now())
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load ideas.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const stats = useMemo(() => {
    if (now === null) return null
    const total = ideas.length
    const counts: Record<StageKey, number> = { capture: 0, discover: 0, build: 0 }
    for (const idea of ideas) counts[stageOf(idea.idea_pulse)]++
    const validating = ideas.filter((i) => i.status === "validating").length
    const venture = counts.build
    const avg = averagePulse(ideas)
    const weekAgo = subDays(now, 7).getTime()
    const thisWeek = ideas.filter((i) => Date.parse(i.created_at) >= weekAgo).length

    const founders: string[] = []
    for (const idea of [...ideas].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))) {
      const name = idea.founder?.name?.trim()
      if (name && !founders.includes(name)) founders.push(name)
    }

    return {
      total,
      counts,
      validating,
      venture,
      avg,
      thisWeek,
      founders,
      series: {
        total: dailySeries(ideas, now, (day) => day.length),
        validating: dailySeries(ideas, now, (day) => day.filter((i) => i.status === "validating").length),
        venture: dailySeries(ideas, now, (day) => day.filter((i) => i.idea_pulse >= VENTURE_THRESHOLD).length),
        avg: dailySeries(ideas, now, (_day, soFar) => averagePulse(soFar)),
      },
    }
  }, [ideas, now])

  function retry() {
    setLoading(true)
    setError(null)
    setReloadKey((k) => k + 1)
  }

  const openPost = () => setOpen(true)

  return (
    <main className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Dialog open={open} onOpenChange={setOpen}>
        <PostIdeaDialog
          onPosted={() => {
            setOpen(false)
            setReloadKey((k) => k + 1)
          }}
        />
      </Dialog>

      <IdeaLabHero
        founders={stats?.founders ?? null}
        ideaCount={stats?.total ?? 0}
        onPost={openPost}
      />

      {loading ? (
        <IdeaLabSkeleton />
      ) : error ? (
        <div data-slot="card" role="alert" className="flex flex-col items-start gap-4 p-6">
          <div>
            <h2 className="text-lg font-bold">We couldn’t load the Idea Lab</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error} Check your connection and try again.
            </p>
          </div>
          <Button variant="outline" onClick={retry}>
            <RefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : !stats || stats.total === 0 ? (
        <div data-slot="card" className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Lightbulb className="size-6 text-violet" aria-hidden="true" />
          </span>
          <div className="max-w-md">
            <h2 className="text-xl font-bold tracking-tight">No ideas yet</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Post the first one. The community votes on whether they’d use it and pay for it, and
              your Idea Pulse starts climbing.
            </p>
          </div>
          <Button size="lg" onClick={openPost}>
            Post the first idea
          </Button>
        </div>
      ) : (
        <>
          <section aria-labelledby="glance-heading" className="flex flex-col gap-4">
            <header className="flex flex-col gap-1">
              <h2 id="glance-heading" className="text-xl font-bold tracking-tight">
                Idea Lab at a glance
              </h2>
              <p className="text-sm text-muted-foreground">Live numbers from every idea posted on Sangam.</p>
            </header>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile
                label="Total ideas"
                value={stats.total}
                icon={Sprout}
                color={CHART.blue}
                series={stats.series.total}
                seriesLabel="Ideas posted per day, last 14 days"
                note={stats.thisWeek > 0 ? `${stats.thisWeek} new this week` : "None new this week"}
              />
              <StatTile
                label="Validating"
                value={stats.validating}
                icon={FlaskConical}
                color={CHART.violet}
                series={stats.series.validating}
                seriesLabel="Ideas now validating, by day posted, last 14 days"
                note={`${Math.round((stats.validating / stats.total) * 100)}% of ideas are collecting votes`}
              />
              <StatTile
                label="Venture-ready"
                value={stats.venture}
                icon={Rocket}
                color={CHART.emerald}
                series={stats.series.venture}
                seriesLabel="Ideas with Idea Pulse 60 or more, by day posted, last 14 days"
                note="Idea Pulse 60+ unlocks the venture track"
              />
              <StatTile
                label="Average Idea Pulse"
                value={stats.avg}
                suffix="/ 100"
                icon={Gauge}
                color={CHART.cyan}
                series={stats.series.avg}
                seriesLabel="Running average Idea Pulse, last 14 days"
                note="Running average across all ideas"
              />
            </div>
          </section>

          <Pipeline counts={stats.counts} total={stats.total} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <RecentIdeas ideas={ideas} now={now ?? 0} />
            </div>
            <StageBreakdown counts={stats.counts} total={stats.total} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <ActivityTimeline ideas={ideas} now={now ?? 0} />
            <VentureReady venture={stats.venture} validating={stats.validating} total={stats.total} />
            <div className="md:col-span-2 xl:col-span-1">
              <QuickActions onPost={openPost} />
            </div>
          </div>
        </>
      )}
    </main>
  )
}

function IdeaLabSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading ideas">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-[1.25rem] bg-white/[0.04]" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-[1.25rem] bg-white/[0.04]" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Skeleton className="h-96 w-full rounded-[1.25rem] bg-white/[0.04] xl:col-span-2" />
        <Skeleton className="h-96 w-full rounded-[1.25rem] bg-white/[0.04]" />
      </div>
    </div>
  )
}
