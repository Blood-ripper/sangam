"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/** The post-idea form. Same POST /api/ideas contract as before. */
export function PostIdeaDialog({ onPosted }: { onPosted: () => void }) {
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
    } else if (res.status === 401) {
      setError("Sign in to post an idea.")
    } else {
      setError(json.error ?? "Could not post your idea. Try again.")
    }

    setSubmitting(false)
  }

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold">Post your idea</DialogTitle>
        <DialogDescription>
          Start with the problem. The community votes on whether they would use it and pay for it,
          and that builds your Idea Pulse.
        </DialogDescription>
      </DialogHeader>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="idea-title">Title</Label>
          <Input
            id="idea-title"
            value={title}
            placeholder="Campus tiffin service"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="idea-problem">Problem</Label>
          <Textarea
            id="idea-problem"
            value={problem}
            placeholder="What is broken today, and for whom?"
            onChange={(e) => setProblem(e.target.value)}
            rows={3}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="idea-target-users">Target users</Label>
            <Input
              id="idea-target-users"
              value={targetUsers}
              placeholder="Hostel students"
              onChange={(e) => setTargetUsers(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="idea-model">Business model</Label>
            <Input
              id="idea-model"
              value={model}
              placeholder="Monthly subscription"
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="submit" size="lg" disabled={submitting || !title.trim() || !problem.trim()}>
            {submitting && <Loader2 className="animate-spin" aria-hidden="true" />}
            {submitting ? "Posting…" : "Post idea"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
