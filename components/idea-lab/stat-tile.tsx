"use client"

import type { LucideIcon } from "lucide-react"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { Sparkline, type SparkPoint } from "@/components/charts/sparkline"

/** One "at a glance" number with its 14-day trend. */
export function StatTile({
  label,
  value,
  suffix,
  icon: Icon,
  color,
  series,
  seriesLabel,
  note,
}: {
  label: string
  value: number
  suffix?: string
  icon: LucideIcon
  /** Hex colour from the chart palette; follows the entity across the page. */
  color: string
  series: SparkPoint[]
  seriesLabel: string
  note: string
}) {
  return (
    <div data-slot="card" className="flex min-w-0 flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-xl"
          style={{
            background: `color-mix(in oklab, ${color} 18%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 34%, transparent)`,
          }}
        >
          <Icon className="size-4" style={{ color }} />
        </span>
      </div>
      <p className="flex items-baseline gap-1.5 text-4xl font-extrabold tracking-[-0.03em] text-foreground">
        <NumberTicker value={value} />
        {suffix && <span className="text-sm font-semibold tracking-normal text-muted-foreground">{suffix}</span>}
      </p>
      <div className="flex items-end justify-between gap-3">
        <p className="max-w-[46%] text-xs leading-snug text-muted-foreground">{note}</p>
        <Sparkline data={series} color={color} height={40} ariaLabel={seriesLabel} className="w-[54%] max-w-40" />
      </div>
    </div>
  )
}
