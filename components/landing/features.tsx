"use client"

import Link from "next/link"
import { ArrowUpRight, Heart, MessageCircle, Share2 } from "lucide-react"
import { DonutChart } from "@/components/charts/donut-chart"
import { MeterBar } from "@/components/charts/meter-bar"
import { MagicCard } from "@/components/magicui/magic-card"
import { cn } from "@/lib/utils"

const HIRE_PROOF = [
  { label: "Hires confirmed by candidates", value: 35, color: "var(--chart-1)" },
  { label: "Applicants who got a reply", value: 20, color: "var(--chart-2)" },
  { label: "Stipend paid as promised", value: 15, color: "var(--chart-3)" },
  { label: "Verified reviews", value: 15, color: "var(--chart-4)" },
  { label: "Identity checks and activity", value: 15, color: "var(--chart-5)" },
]

const MATCHES = [
  { role: "Frontend intern", company: "Razorpay", match: 92, skills: ["React", "TypeScript"] },
  { role: "ML intern", company: "CRED", match: 84, skills: ["Python", "PyTorch"] },
  { role: "Product analyst", company: "Meesho", match: 71, skills: ["SQL", "Excel"] },
]

const POLL = [
  { q: "Would you use it?", yes: 78 },
  { q: "Would you pay ₹49 a month?", yes: 41 },
]

const PATH = [
  { when: "Week 1", what: "NPTEL module on the missing skill" },
  { when: "Week 1", what: "SWAYAM practice course" },
  { when: "Week 2", what: "Curated YouTube build-along" },
  { when: "Week 2", what: "Proof task set by a startup" },
]

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-violet transition-colors hover:text-white"
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </Link>
  )
}

function CardText({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-heading text-xl font-semibold tracking-tight">{title}</h3>
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section aria-labelledby="features-heading" className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col gap-3">
          <h2 id="features-heading" className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Every score on Sangam can be checked.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Recruiters, ideas and reviews all carry a track record. Here is what each one is made of.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-6">
          {/* Hire-Proof Score */}
          <MagicCard className="lg:col-span-3 lg:row-span-2" contentClassName="flex flex-col gap-6 p-6 sm:p-8">
            <CardText
              title="Hire-Proof Score"
              body="Recruiters earn a 0–100 score from hires that candidates confirm, not from how many listings they post. Fee-asking and scam-pattern listings are blocked outright."
            />
            <DonutChart
              segments={HIRE_PROOF}
              ariaLabel="How the Hire-Proof Score is weighted"
              centerValue="100"
              centerLabel="points"
              formatValue={(n) => `${n}`}
              size={176}
              thickness={20}
            />
            <p className="text-xs text-muted-foreground">
              Weights out of 100. Verified reviews use a Bayesian average, so a single review can&apos;t swing a score.
            </p>
            <div className="mt-auto">
              <CardLink href="/feed">See scores on the feed</CardLink>
            </div>
          </MagicCard>

          {/* AI match feed */}
          <MagicCard className="lg:col-span-3" contentClassName="flex flex-col gap-5 p-6 sm:p-8">
            <CardText
              title="Matches that explain themselves"
              body="Your skills and goal are compared with every opening, and the feed tells you why a role made the list."
            />
            <ul className="flex flex-col gap-3" aria-label="Example matches">
              {MATCHES.map((m) => (
                <li
                  key={m.role}
                  className="flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{m.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.company}
                      {m.skills.map((s) => (
                        <span key={s} className="ml-2 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-foreground/80">
                          {s}
                        </span>
                      ))}
                    </p>
                  </div>
                  <MeterBar value={m.match} label={`${m.role} match`} className="sm:w-40" />
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Example matches</span>
              <CardLink href="/feed">Open your feed</CardLink>
            </div>
          </MagicCard>

          {/* Idea Pulse */}
          <MagicCard className="lg:col-span-3" contentClassName="flex flex-col gap-5 p-6 sm:p-8">
            <CardText
              title="Idea Pulse"
              body="Founders test an idea with quick polls before building. A Pulse of 60 or more unlocks the venture track: co-founder and mentor matching."
            />
            <div className="flex flex-col gap-4" aria-label="Example poll">
              {POLL.map((p) => (
                <div key={p.q} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{p.q}</span>
                    <span className="text-muted-foreground tabular-nums">{p.yes}% yes</span>
                  </div>
                  <MeterBar
                    value={p.yes}
                    label={`${p.q} ${p.yes}% yes`}
                    showValue={false}
                    color="linear-gradient(90deg, #c98420, #e89e31)"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Example poll</span>
              <CardLink href="/idea-lab">Open Idea Lab</CardLink>
            </div>
          </MagicCard>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Recruiter Reels */}
          <MagicCard contentClassName="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex flex-1 flex-col gap-4">
              <CardText
                title="Recruiter reels"
                body="Recruiters show the team and the work in short videos. Like, comment, or share a link with a friend who fits."
              />
              <CardLink href="/reels">Watch reels</CardLink>
            </div>
            <div
              aria-hidden="true"
              className="relative mx-auto h-60 w-[8.5rem] shrink-0 overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#0b0d1a] p-1.5 shadow-[0_30px_60px_-30px_rgb(110_91_235/0.7)]"
            >
              <div className="relative size-full overflow-hidden rounded-[1.25rem] bg-[radial-gradient(120%_80%_at_30%_10%,#4d66e9_0%,#2a1f63_45%,#0b0d1a_100%)]">
                <div className="absolute inset-x-0 top-2 mx-auto h-1 w-10 rounded-full bg-white/30" />
                <div className="absolute right-2 bottom-12 flex flex-col items-center gap-3 text-white/90">
                  <Heart className="size-4 fill-rose-500 text-rose-500" />
                  <MessageCircle className="size-4" />
                  <Share2 className="size-4" />
                </div>
                <div className="absolute inset-x-2 bottom-2.5 text-[9px] leading-tight text-white">
                  <p className="font-semibold">Hiring 3 frontend interns</p>
                  <p className="text-white/70">Bengaluru, ₹25k a month</p>
                </div>
              </div>
            </div>
          </MagicCard>

          {/* Skill-Gap Coach */}
          <MagicCard contentClassName="flex flex-col gap-5 p-6 sm:p-8">
            <CardText
              title="Skill-Gap Coach"
              body="Not ready for a role yet? You get a free two-week path to the missing skill and a proof task set by a startup."
            />
            <ol className="flex flex-col gap-0">
              {PATH.map((p, i) => (
                <li key={p.what} className="relative flex gap-3 pb-3 last:pb-0">
                  <span
                    className={cn(
                      "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
                      i === PATH.length - 1
                        ? "border-brand-emerald/60 bg-brand-emerald/15 text-brand-emerald"
                        : "border-white/15 bg-white/[0.04] text-foreground/80"
                    )}
                  >
                    {i + 1}
                  </span>
                  {i < PATH.length - 1 && (
                    <span aria-hidden="true" className="absolute top-6 left-3 h-[calc(100%-1.5rem)] w-px bg-white/10" />
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm text-foreground">{p.what}</span>
                    <span className="text-xs text-muted-foreground">{p.when}</span>
                  </div>
                </li>
              ))}
            </ol>
            <CardLink href="/feed">Find your gaps</CardLink>
          </MagicCard>
        </div>
      </div>
    </section>
  )
}
