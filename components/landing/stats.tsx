"use client"

import { NumberTicker } from "@/components/magicui/number-ticker"

const STATS = [
  {
    value: 93,
    decimals: 0,
    suffix: "%",
    label: "of Indian job seekers came across suspected recruitment scams",
    source: "Indeed survey, Jul 2026",
  },
  {
    value: 51,
    decimals: 0,
    suffix: "%",
    label: "aren't confident telling genuine recruiters from fraudsters",
    source: "Indeed survey, Jul 2026",
  },
  {
    value: 56.35,
    decimals: 2,
    suffix: "%",
    label: "of graduates are employable",
    source: "India Skills Report 2026",
  },
  {
    value: 2.23,
    decimals: 2,
    suffix: " lakh",
    label: "DPIIT-recognised startups, with 23.36 lakh direct jobs",
    source: "DPIIT, 31 Mar 2026",
  },
]

export function StatsSection() {
  return (
    <section aria-labelledby="stats-heading" className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-3">
          <h2 id="stats-heading" className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Hiring runs on trust. Right now, trust is broken.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            The research behind Sangam. These are the gaps every feature is built to close.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-3 bg-[#0a0c18] p-6 sm:p-7">
              <dt className="order-2 text-sm leading-snug text-foreground/85">{s.label}</dt>
              <dd className="order-1 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                <NumberTicker value={s.value} decimalPlaces={s.decimals} />
                <span>{s.suffix}</span>
              </dd>
              <dd className="order-3 mt-auto text-xs text-muted-foreground">{s.source}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
