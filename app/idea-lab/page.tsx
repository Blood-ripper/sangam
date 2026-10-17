"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HireProofRing } from "@/components/hire-proof-ring"
import { AnimatedCard } from "@/components/motion/animated-card"
import type { Database } from "@/types/supabase"

type Idea = Database["public"]["Tables"]["ideas"]["Row"] & {
  founder: { name: string | null } | null
}

function pulseVariant(pulse: number): "destructive" | "secondary" | "default" {
  if (pulse < 40) return "destructive"
  if (pulse < 60) return "secondary"
  return "default"
}

export default function IdeaLabPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetch("/api/ideas")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setIdeas(json.ideas ?? [])
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

  return (
    <main className="flex w-full flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Idea Lab</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Post your idea</Button>
          </DialogTrigger>
          <PostIdeaDialog
            onPosted={() => {
              setOpen(false)
              setReloadKey((k) => k + 1)
            }}
          />
        </Dialog>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No ideas posted yet. Be the first.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {ideas.map((idea, i) => (
            <AnimatedCard key={idea.id} index={i} className="h-full">
              <Link href={`/idea-lab/${idea.id}`} className="flex h-full">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="min-w-0 truncate">
                        {idea.title ?? "Untitled idea"}
                      </CardTitle>
                      <div className="flex shrink-0 items-center gap-2">
                        <HireProofRing score={idea.idea_pulse} size={28} />
                        <Badge variant={pulseVariant(idea.idea_pulse)}>
                          Pulse {idea.idea_pulse}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {idea.founder?.name ?? "Anonymous founder"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {idea.problem}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      )}
    </main>
  )
}

function PostIdeaDialog({ onPosted }: { onPosted: () => void }) {
  const [title, setTitle] = useState("")
  const [problem, setProblem] = useState("")
  const [targetUsers, setTargetUsers] = useState("")
  const [model, setModel] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!title.trim() || !problem.trim() || submitting) return
    setSubmitting(true)
    setError(null)

    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        problem: problem.trim(),
        target_users: targetUsers.trim() || null,
        model: model.trim() || null,
      }),
    })

    const json = await res.json().catch(() => ({}))

    if (res.ok) {
      setTitle("")
      setProblem("")
      setTargetUsers("")
      setModel("")
      onPosted()
    } else {
      setError(json.error ?? "Could not post your idea.")
    }

    setSubmitting(false)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Post your idea</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="idea-title">Title</Label>
          <Input
            id="idea-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="idea-problem">Problem</Label>
          <Textarea
            id="idea-problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="idea-target-users">Target users</Label>
          <Input
            id="idea-target-users"
            value={targetUsers}
            onChange={(e) => setTargetUsers(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="idea-model">Model</Label>
          <Input
            id="idea-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          onClick={submit}
          disabled={submitting || !title.trim() || !problem.trim()}
        >
          Post idea
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
