import { endOfDay, format, isSameDay, startOfDay, subDays } from "date-fns"
import type { SparkPoint } from "@/components/charts/sparkline"
import type { Database } from "@/types/supabase"

export type Idea = Database["public"]["Tables"]["ideas"]["Row"] & {
  founder: { name: string | null } | null
}

export type StageKey = "capture" | "discover" | "build"

/** An Idea Pulse of 60+ unlocks the venture track (co-founder + mentor match). */
export const VENTURE_THRESHOLD = 60

/*
  Stage colours come from the validated chart palette (slots 2–4: amber,
  violet, emerald — same values as --chart-2/3/4, written as hex because they
  feed SVG presentation attributes). Blue (slot 1) is left out on purpose:
  next to violet in a donut ring the two are indistinguishable for protan
  viewers (ΔE 2.0). Amber/violet/emerald passes all-pairs validation.
*/
export const CHART = {
  blue: "#5b7cfa",
  amber: "#c98420",
  violet: "#8c72ee",
  emerald: "#1c9a6c",
  cyan: "#67e8f9",
} as const
export const STAGES: Record<
  StageKey,
  { key: StageKey; label: string; name: string; description: string; range: string; color: string }
> = {
  capture: {
    key: "capture",
    label: "Capture",
    name: "New ideas",
    description: "Fresh sparks waiting for their first votes.",
    range: "Idea Pulse under 40",
    color: CHART.amber,
  },
  discover: {
    key: "discover",
    label: "Discover",
    name: "Exploring",
    description: "Collecting votes and feedback from the community.",
    range: "Idea Pulse 40–59",
    color: CHART.violet,
  },
  build: {
    key: "build",
    label: "Build",
    name: "Venture track",
    description: "Co-founder and mentor matching unlocked.",
    range: "Idea Pulse 60 and up",
    color: CHART.emerald,
  },
}

export const STAGE_ORDER: StageKey[] = ["capture", "discover", "build"]

export function stageOf(pulse: number): StageKey {
  if (pulse >= VENTURE_THRESHOLD) return "build"
  if (pulse >= 40) return "discover"
  return "capture"
}

export function initials(name: string | null | undefined) {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase()
}

/**
 * One point per calendar day for the last `days` days (local time), ending
 * today. `pick` receives the ideas created on that day and every idea created
 * up to the end of that day.
 */
export function dailySeries(
  ideas: Idea[],
  now: number,
  pick: (createdThatDay: Idea[], createdSoFar: Idea[]) => number,
  days = 14
): SparkPoint[] {
  const dated = ideas.map((idea) => ({ idea, at: new Date(idea.created_at) }))
  const points: SparkPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(subDays(now, i))
    const end = endOfDay(day)
    const that = dated.filter((d) => isSameDay(d.at, day)).map((d) => d.idea)
    const soFar = dated.filter((d) => d.at <= end).map((d) => d.idea)
    points.push({ label: format(day, "d MMM"), value: pick(that, soFar) })
  }
  return points
}

export function averagePulse(ideas: Idea[]) {
  if (!ideas.length) return 0
  return Math.round(ideas.reduce((sum, i) => sum + (i.idea_pulse ?? 0), 0) / ideas.length)
}
