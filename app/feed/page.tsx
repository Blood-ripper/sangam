"use client"

import { useEffect, useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AtsPanel } from "@/components/ats-panel"
import { FilterChips } from "@/components/feed/filter-chips"
import { OpportunityCard, type MatchedOpportunity } from "@/components/feed/opportunity-card"
import { FeedError, NoFilterMatches, NoOpenings, SignInPrompt } from "@/components/feed/feed-states"

type FeedResponse = {
  opportunities: MatchedOpportunity[]
  matchReasons: Record<string, string>
  error?: string
}

const FILTERS = ["All", "Internship", "Job", "Remote", "Hackathon"] as const
type Filter = (typeof FILTERS)[number]

const NOT_SIGNED_IN = "Not signed in"

export default function FeedPage() {
  const [data, setData] = useState<FeedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("All")
  const [reloadKey, setReloadKey] = useState(0)
  // Captured when data arrives so deadline labels share one "now".
  const [now, setNow] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetch("/api/feed")
      .then(async (res) => {
        const json: FeedResponse = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(res.status === 401 ? NOT_SIGNED_IN : (json.error ?? "Could not load the feed."))
          return
        }
        setData(json)
        setNow(Date.now())
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError("Could not load the feed.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const opportunities = useMemo(() => data?.opportunities ?? [], [data])

  const counts = useMemo(() => {
    const c: Partial<Record<Filter, number>> = { All: opportunities.length }
    for (const f of FILTERS) {
      if (f === "All") continue
      c[f] = opportunities.filter((o) => o.type?.toLowerCase() === f.toLowerCase()).length
    }
    return c
  }, [opportunities])

  const filtered = useMemo(() => {
    if (filter === "All") return opportunities
    return opportunities.filter((o) => o.type?.toLowerCase() === filter.toLowerCase())
  }, [opportunities, filter])

  // The single best match across the whole feed gets the travelling border.
  const topMatchId = useMemo(() => {
    let best: MatchedOpportunity | null = null
    for (const o of opportunities) if (!best || (o.match_score ?? 0) > (best.match_score ?? 0)) best = o
    return best?.id ?? null
  }, [opportunities])

  function retry() {
    setLoading(true)
    setError(null)
    setReloadKey((k) => k + 1)
  }

  return (
    <main className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Matched for you</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Openings ranked by how well they fit your skills and goal. Every recruiter carries a
            Hire-Proof score built from hires that candidates confirmed.
          </p>
        </div>
        {!loading && !error && opportunities.length > 0 && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span> of{" "}
            <span className="tabular-nums">{opportunities.length}</span> openings
          </p>
        )}
      </header>

      <AtsPanel />

      {!error && (
        <FilterChips
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          counts={loading ? undefined : counts}
          label="Filter openings by type"
        />
      )}

      {loading ? (
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          aria-busy="true"
          aria-label="Loading openings"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-[1.25rem] bg-white/[0.04]" />
          ))}
        </div>
      ) : error === NOT_SIGNED_IN ? (
        <SignInPrompt />
      ) : error ? (
        <FeedError message={error} onRetry={retry} />
      ) : opportunities.length === 0 ? (
        <NoOpenings />
      ) : filtered.length === 0 ? (
        <NoFilterMatches filter={filter} onReset={() => setFilter("All")} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((o) => (
            <OpportunityCard
              key={o.id}
              opportunity={o}
              matchReason={data?.matchReasons?.[o.id]}
              isTopMatch={o.id === topMatchId}
              now={now}
            />
          ))}
        </div>
      )}
    </main>
  )
}
