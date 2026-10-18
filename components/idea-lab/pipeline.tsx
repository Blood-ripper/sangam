import { MeterBar } from "@/components/charts/meter-bar"
import { STAGES, STAGE_ORDER, type StageKey } from "./lib"

/** Capture → Discover → Build, with each stage's share of all ideas. */
export function Pipeline({ counts, total }: { counts: Record<StageKey, number>; total: number }) {
  return (
    <section data-slot="card" aria-labelledby="pipeline-heading" className="flex flex-col gap-5 p-5 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="pipeline-heading" className="text-lg font-bold tracking-tight">
            Idea pipeline
          </h2>
          <p className="text-sm text-muted-foreground">From first spark to venture track.</p>
        </div>
        <a
          href="#recent-ideas"
          className="rounded-md text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          See every idea
        </a>
      </header>

      <ol className="grid gap-4 md:grid-cols-3">
        {STAGE_ORDER.map((key) => {
          const s = STAGES[key]
          const count = counts[key]
          const share = total ? Math.round((count / total) * 100) : 0
          return (
            <li
              key={key}
              className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span aria-hidden="true" className="size-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-foreground tabular-nums">
                  {count}
                </span>
              </div>
              <div>
                <p className="text-3xl font-light tracking-[-0.03em] text-foreground">{s.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
              </div>
              <div className="mt-auto flex flex-col gap-1.5">
                <MeterBar value={share} color={s.color} label={`Share of ideas in ${s.label}`} />
                <p className="text-xs text-muted-foreground">{s.range}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
