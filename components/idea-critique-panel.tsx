"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Critique = {
  ideaPulse: number
  strengths: string[]
  risks: string[]
  pivotHints: string[]
}

export function IdeaCritiquePanel({ ideaId }: { ideaId: string }) {
  const [critique, setCritique] = useState<Critique | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch("/api/ai/idea-critique", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error()
        const json = (await res.json()) as Critique
        if (!cancelled) setCritique(json)
      })
      .catch(() => {
        if (!cancelled) setError("AI critique isn't available right now.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [ideaId])

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-medium">AI critique</h2>

      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : error || !critique ? (
        <p className="text-sm text-muted-foreground">
          {error ?? "AI critique isn't available right now."}
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Idea Pulse: {critique.ideaPulse}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {critique.strengths?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Strengths</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {critique.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {critique.risks?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Risks</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {critique.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {critique.pivotHints?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Pivot hints</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {critique.pivotHints.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  )
}
