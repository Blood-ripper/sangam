"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/supabase"

type Poll = Database["public"]["Tables"]["polls"]["Row"]

export function PollCard({ poll }: { poll: Poll }) {
  const reduceMotion = useReducedMotion()
  const [counts, setCounts] = useState({
    yes: poll.yes_count,
    no: poll.no_count,
  })
  const [voted, setVoted] = useState<boolean | null>(null)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`poll-${poll.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "polls",
          filter: `id=eq.${poll.id}`,
        },
        (payload) => {
          const row = payload.new as { yes_count: number; no_count: number }
          setCounts({ yes: row.yes_count, no: row.no_count })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [poll.id])

  async function vote(value: boolean) {
    if (voting || voted !== null) return
    setVoting(true)
    setError(null)

    const res = await fetch("/api/polls/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pollId: poll.id, vote: value }),
    })

    if (res.ok || res.status === 409) {
      setVoted(value)
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? "Could not record your vote.")
    }

    setVoting(false)
  }

  const total = counts.yes + counts.no
  const yesPercent = total === 0 ? 0 : Math.round((counts.yes / total) * 100)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <p className="text-sm font-medium">{poll.question}</p>

      <div className="relative flex h-1 w-full items-center overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${yesPercent}%` }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }
          }
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{yesPercent}% yes</span>
        <span>
          {total} vote{total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={voted === true ? "default" : "outline"}
          disabled={voting || voted !== null}
          onClick={() => vote(true)}
          className="flex-1"
        >
          Yes
        </Button>
        <Button
          size="sm"
          variant={voted === false ? "default" : "outline"}
          disabled={voting || voted !== null}
          onClick={() => vote(false)}
          className="flex-1"
        >
          No
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
