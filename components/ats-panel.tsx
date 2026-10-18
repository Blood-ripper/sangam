"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const ATS_URL = "https://ai-ats-resume-builder-delta.vercel.app/"

export function AtsPanel() {
  const [open, setOpen] = useState(false)

  return (
    <Card id="ats" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>ATS Resume Builder</CardTitle>
        <CardDescription>
          Build and score your resume before you apply
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={ATS_URL} target="_blank" rel="noopener noreferrer">
              Open in new tab
              <ExternalLink className="size-4" />
            </a>
          </Button>
          <Button size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Close ATS builder" : "Open ATS builder"}
          </Button>
        </CardAction>
      </CardHeader>

      {open && (
        <CardContent>
          <iframe
            src={ATS_URL}
            title="ATS Resume Builder"
            className="h-[80vh] w-full rounded-lg border"
            loading="lazy"
          />
        </CardContent>
      )}
    </Card>
  )
}
