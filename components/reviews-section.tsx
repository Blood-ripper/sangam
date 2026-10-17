"use client"

import { useEffect, useState, type FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

type Review = {
  id: string
  rating: number | null
  body: string | null
  verified: boolean
  created_at: string
  reviewer: { name: string | null } | null
}

export function ReviewsSection({ recruiterId }: { recruiterId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function load() {
    const supabase = createClient()

    const [listRes, eligible] = await Promise.all([
      fetch(
        `/api/reviews?target_id=${recruiterId}&target_type=recruiter`
      ).then((res) => res.json()),
      checkEligibility(supabase, recruiterId),
    ])

    setReviews(listRes.reviews ?? [])
    setCanReview(eligible)
    setLoading(false)
  }

  useEffect(() => {
    // Deferred via .then() rather than calling load() directly, same shape
    // app/recruiter/page.tsx uses to avoid react-hooks/set-state-in-effect.
    Promise.resolve().then(() => load())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_id: recruiterId,
        target_type: "recruiter",
        rating,
        body,
      }),
    })

    const json = await res.json().catch(() => null)
    setSubmitting(false)

    if (!res.ok) {
      setFormError(json?.error ?? "Could not submit your review.")
      return
    }

    setBody("")
    setRating(5)
    await load()
  }

  return (
    <div className="flex flex-col gap-3">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {reviews.map((review) => (
            <Card key={review.id} size="sm">
              <CardContent className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <span aria-label={`${review.rating ?? 0} out of 5 stars`}>
                    {"★".repeat(review.rating ?? 0)}
                    {"☆".repeat(5 - (review.rating ?? 0))}
                  </span>
                  {review.verified && (
                    <Badge variant="secondary">Verified candidate</Badge>
                  )}
                </div>
                {review.body && (
                  <p className="text-muted-foreground">{review.body}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {canReview && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
                className="text-xl leading-none"
              >
                {value <= rating ? "★" : "☆"}
              </button>
            ))}
          </div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience with this recruiter"
            required
          />
          <Button type="submit" size="sm" disabled={submitting} className="self-start">
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      )}
    </div>
  )
}

async function checkEligibility(
  supabase: ReturnType<typeof createClient>,
  recruiterId: string
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: recruiterOpportunities } = await supabase
    .from("opportunities")
    .select("id")
    .eq("recruiter_id", recruiterId)

  const opportunityIds = (recruiterOpportunities ?? []).map((o) => o.id)
  if (opportunityIds.length === 0) return false

  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("seeker_id", user.id)
    .in("opportunity_id", opportunityIds)
    .maybeSingle()

  return !!application
}
