"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { triggerHireConfetti } from "@/components/motion/confetti"

type ConfirmStatus = "idle" | "loading" | "confirmed" | "error"

export function ConfirmHireButton({
  applicationId,
  onConfirmed,
}: {
  applicationId: string
  onConfirmed?: (score: number) => void
}) {
  const [status, setStatus] = useState<ConfirmStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)

  async function handleClick() {
    setStatus("loading")
    setErrorMessage(null)

    try {
      const res = await fetch("/api/hire/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      })
      const json = await res.json()

      if (!res.ok) {
        setErrorMessage(json.error ?? "Could not confirm the hire.")
        setStatus("error")
        return
      }

      setScore(json.score)
      setStatus("confirmed")
      triggerHireConfetti()
      onConfirmed?.(json.score)
    } catch {
      setErrorMessage("Could not confirm the hire.")
      setStatus("error")
    }
  }

  if (status === "confirmed") {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary">Verified hire</Badge>
        {score != null && (
          <span className="text-xs text-muted-foreground">
            Recruiter score now {score}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={handleClick} disabled={status === "loading"} size="sm">
        {status === "loading" ? "Confirming…" : "Confirm hire"}
      </Button>
      {errorMessage && (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
