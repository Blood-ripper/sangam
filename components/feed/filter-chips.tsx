"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

/** Toggle chips with a sliding pill under the active one. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  counts,
  label,
}: {
  options: readonly T[]
  value: T
  onChange: (next: T) => void
  counts?: Partial<Record<T, number>>
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1">
      {options.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option)}
            className={cn(
              "relative shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-transparent text-foreground"
                : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:border-white/15 hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="feed-filter-pill"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgb(123_97_240/0.55),rgb(95_120_246/0.45))] ring-1 ring-white/20"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">
              {option}
              {counts && counts[option] !== undefined && (
                <span className={cn("ml-1.5 text-xs tabular-nums", active ? "text-white/80" : "text-muted-foreground")}>
                  {counts[option]}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
