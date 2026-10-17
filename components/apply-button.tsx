"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ApplyStatus = "idle" | "loading" | "applied" | "error"

export function ApplyButton({
  opportunityId,
  force = false,
  label = "Apply",
  initiallyApplied = false,
}: {
  opportunityId: string
  /** Set on the skill-gap page's "Apply anyway" button to skip the readiness check. */
  force?: boolean
  label?: string
  initiallyApplied?: boolean
}) {
  const router = useRouter()
  const [status, setStatus] = useState<ApplyStatus>(
    initiallyApplied ? "applied" : "idle"
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleClick() {
    setStatus("loading")
    setErrorMessage(null)

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, force }),
      })
      const json = await res.json()

      if (!res.ok) {
        setErrorMessage(json.error ?? "Could not apply.")
        setStatus("error")
        return
      }

      if (json.redirect) {
        router.push(json.redirect)
        return
      }

      setStatus("applied")
    } catch {
      setErrorMessage("Could not apply.")
      setStatus("error")
    }
  }

  if (status === "applied") {
    return <Badge variant="secondary">Applied</Badge>
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={handleClick} disabled={status === "loading"} size="sm">
        {status === "loading" ? "Applying…" : label}
      </Button>
      {errorMessage && (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
