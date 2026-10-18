import { cn } from "@/lib/utils"
import { STAGES, type StageKey } from "./lib"

/** Stage label with a colour dot; the text stays in text colour so identity is never colour alone. */
export function StageChip({ stage, className }: { stage: StageKey; className?: string }) {
  const s = STAGES[stage]
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-medium text-foreground",
        className
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}
