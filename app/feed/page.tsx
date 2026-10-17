"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HireProofRing } from "@/components/hire-proof-ring"
import { AnimatedCard } from "@/components/motion/animated-card"
import { AtsPanel } from "@/components/ats-panel"
import type { Database } from "@/types/supabase"

type MatchedOpportunity =
  Database["public"]["Functions"]["match_opportunities"]["Returns"][number]

type FeedResponse = {
  opportunities: MatchedOpportunity[]
  matchReasons: Record<string, string>
  error?: string
}

const FILTERS = ["All", "Internship", "Job", "Remote", "Hackathon"] as const
type Filter = (typeof FILTERS)[number]

export default function FeedPage() {
  const [data, setData] = useState<FeedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("All")

  useEffect(() => {
    let cancelled = false

    fetch("/api/feed")
      .then(async (res) => {
        const json: FeedResponse = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(json.error ?? "Could not load the feed.")
          return
        }
        setData(json)
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
  }, [])

  const filtered = useMemo(() => {
    const opportunities = data?.opportunities ?? []
    if (filter === "All") return opportunities
    return opportunities.filter(
      (o) => o.type?.toLowerCase() === filter.toLowerCase()
    )
  }, [data, filter])

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Feed</h1>

      <AtsPanel />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Badge key={f} asChild variant={filter === f ? "default" : "outline"}>
            <button
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
            >
              {f}
            </button>
          </Badge>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No opportunities match this filter yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((o, i) => (
            <OpportunityCard
              key={o.id}
              index={i}
              opportunity={o}
              matchReason={data?.matchReasons?.[o.id]}
            />
          ))}
        </div>
      )}
    </main>
  )
}

function OpportunityCard({
  opportunity,
  matchReason,
  index,
}: {
  opportunity: MatchedOpportunity
  matchReason?: string
  index: number
}) {
  const matchPercent = Math.round(
    Math.max(0, Math.min(1, opportunity.match_score)) * 100
  )

  return (
    <AnimatedCard index={index}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>
                <Link
                  href={`/opportunities/${opportunity.id}`}
                  className="hover:underline"
                >
                  {opportunity.title ?? "Untitled opportunity"}
                </Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {opportunity.company}
              </p>
            </div>
            <HireProofRing score={opportunity.hire_proof_score} />
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {opportunity.type && (
              <Badge variant="secondary">{opportunity.type}</Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {matchPercent}% match
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          {opportunity.stipend_text && (
            <p className="text-sm font-medium">{opportunity.stipend_text}</p>
          )}
          {matchReason && (
            <p className="text-sm text-muted-foreground">{matchReason}</p>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/opportunities/${opportunity.id}`}>Apply</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/opportunities/${opportunity.id}#qa`}>Ask</Link>
          </Button>
        </CardFooter>
      </Card>
    </AnimatedCard>
  )
}
