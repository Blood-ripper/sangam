"use client"

import Link from "next/link"
import { useEffect, useState, useSyncExternalStore } from "react"
import { format, formatDistanceToNow, isSameDay, startOfDay, subDays } from "date-fns"
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clapperboard,
  FileText,
  GraduationCap,
  Lightbulb,
  Quote,
  Send,
  Target,
  type LucideIcon,
} from "lucide-react"
import { SangamMark } from "@/components/brand/sangam-logo"
import { DonutChart } from "@/components/charts/donut-chart"
import { MeterBar } from "@/components/charts/meter-bar"
import { ProgressRing } from "@/components/charts/progress-ring"
import { Sparkline, type SparkPoint } from "@/components/charts/sparkline"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { BorderBeam } from "@/components/magicui/border-beam"
import { getMyDashboard, type DashboardProfile, type MyApplication } from "@/lib/db/dashboard"
import { cn } from "@/lib/utils"

type Opportunity = {
  id: string
  title: string | null
  company: string | null
  type: string | null
  required_skills: string[] | null
  created_at?: string | null
}
type Idea = { id: string; created_at: string }

type State =
  | { status: "loading" }
  | { status: "signed-out" }
  | {
      status: "ready"
      profile: DashboardProfile | null
      applications: MyApplication[]
      opportunities: Opportunity[]
      ideas: Idea[]
      feedFailed: boolean
    }

const QUOTES = [
  { text: "Where rivers meet, a city rises. Where people meet, ideas do.", by: "Sangam" },
  { text: "Talent is everywhere. Opportunity should be too.", by: "Sangam" },
  { text: "A hire counts when the person hired says so.", by: "The Hire-Proof promise" },
  { text: "Test the idea before you build the company.", by: "Idea Pulse" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", by: "African proverb" },
  { text: "Not ready yet is a starting line, not a verdict.", by: "Skill-Gap Coach" },
]

const TYPE_ORDER = [
  { key: "internship", label: "Internships", color: "var(--chart-1)" },
  { key: "job", label: "Jobs", color: "var(--chart-2)" },
  { key: "hackathon", label: "Hackathons", color: "var(--chart-3)" },
  { key: "other", label: "Other", color: "var(--chart-4)" },
]

const noop = () => () => {}

function dailySeries(dates: (string | null | undefined)[], days = 14): SparkPoint[] {
  const today = startOfDay(new Date())
  const parsed = dates.filter(Boolean).map((d) => new Date(d as string))
  return Array.from({ length: days }, (_, i) => {
    const day = subDays(today, days - 1 - i)
    return { label: format(day, "d MMM"), value: parsed.filter((d) => isSameDay(d, day)).length }
  })
}

function weekDelta(series: SparkPoint[]) {
  const last = series.slice(-7).reduce((s, p) => s + p.value, 0)
  return last
}

function norm(s: string) {
  return s.trim().toLowerCase()
}

function skillOverlap(mine: string[] | null, needed: string[] | null) {
  const want = (needed ?? []).map(norm).filter(Boolean)
  if (!want.length) return { have: 0, total: 0, pct: 0 }
  const have = new Set((mine ?? []).map(norm))
  const n = want.filter((s) => have.has(s)).length
  return { have: n, total: want.length, pct: Math.round((n / want.length) * 100) }
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#4d66e9,#6f8bff)",
  "linear-gradient(135deg,#e89e31,#f2c06b)",
  "linear-gradient(135deg,#24b07f,#5fd3a6)",
  "linear-gradient(135deg,#7b61f0,#a08cff)",
]
function avatarFor(name: string | null) {
  const s = name ?? "?"
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]
}

export default function DashboardPage() {
  const [state, setState] = useState<State>({ status: "loading" })
  const greeting = useSyncExternalStore(
    noop,
    () => {
      const h = new Date().getHours()
      return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
    },
    () => "Welcome back"
  )
  const quoteIndex = useSyncExternalStore(
    noop,
    () => Math.floor(Date.now() / 86_400_000) % QUOTES.length,
    () => 0
  )

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getMyDashboard(),
      fetch("/api/feed")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch("/api/ideas")
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([dash, feed, ideas]) => {
        if (cancelled) return
        if (!dash) {
          setState({ status: "signed-out" })
          return
        }
        setState({
          status: "ready",
          profile: dash.profile,
          applications: dash.applications,
          opportunities: (feed?.opportunities ?? []) as Opportunity[],
          ideas: (ideas?.ideas ?? []) as Idea[],
          feedFailed: !feed,
        })
      })
      .catch(() => {
        if (!cancelled) setState({ status: "signed-out" })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const quote = QUOTES[quoteIndex]

  return (
    <main className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {state.status === "loading" && <DashboardSkeleton />}
      {state.status === "signed-out" && <SignedOut quote={quote} />}
      {state.status === "ready" && <Ready state={state} greeting={greeting} quote={quote} />}
    </main>
  )
}

function Ready({
  state,
  greeting,
  quote,
}: {
  state: Extract<State, { status: "ready" }>
  greeting: string
  quote: (typeof QUOTES)[number]
}) {
  const { profile, applications, opportunities, ideas, feedFailed } = state
  const firstName = profile?.name?.split(" ")[0] ?? "there"

  const oppSeries = dailySeries(opportunities.map((o) => o.created_at))
  const appSeries = dailySeries(applications.map((a) => a.applied_at))
  const ideaSeries = dailySeries(ideas.map((i) => i.created_at))

  const matches = opportunities
    .map((o, rank) => ({ o, rank, fit: skillOverlap(profile?.skills ?? null, o.required_skills) }))
    .sort((a, b) => b.fit.pct - a.fit.pct || a.rank - b.rank)
  const best = matches[0]?.fit.pct ?? 0

  const checks: { done: boolean; todo: string }[] = [
    { done: !!profile?.name, todo: "Add your name" },
    { done: !!(profile?.college || profile?.university), todo: "Add your college" },
    { done: !!profile?.course, todo: "Add your course" },
    { done: !!profile?.year, todo: "Add your year of study" },
    { done: (profile?.skills?.length ?? 0) >= 3, todo: "List at least 3 skills" },
    { done: !!profile?.goal, todo: "Write your career goal" },
    { done: !!profile?.email_verified, todo: "Verify your email" },
  ]
  const strength = Math.round((checks.filter((c) => c.done).length / checks.length) * 100)
  const missing = checks.filter((c) => !c.done)

  const typeCounts = TYPE_ORDER.map((t) => ({
    label: t.label,
    color: t.color,
    value: opportunities.filter((o) => {
      const ty = norm(o.type ?? "")
      return t.key === "other" ? !["internship", "job", "hackathon"].includes(ty) : ty === t.key
    }).length,
  })).filter((t) => t.value > 0 || t.label !== "Other")

  const pipeline = [
    { label: "Applied", value: applications.filter((a) => a.status === "applied").length, icon: Send },
    { label: "In review", value: applications.filter((a) => a.status === "reviewing").length, icon: Target },
    { label: "Hired", value: applications.filter((a) => a.status === "hired").length, icon: CheckCircle2 },
  ]

  return (
    <>
      <section className="glass glass-sheen relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(110_91_235/0.35),transparent_65%)] blur-2xl"
        />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, d MMMM")}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {greeting}, {firstName}.
            </h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {opportunities.length > 0
                ? `${opportunities.length} openings match your profile today. Your best one fits ${best}% of the skills it asks for.`
                : "Finish your profile so Sangam can match you to openings that fit."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/feed"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#7b61f0,#5f78f6)] px-5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_10px_26px_-12px_rgb(110_91_235/0.8)] transition hover:brightness-110"
              >
                <Briefcase className="size-4" /> See my matches
              </Link>
              <Link
                href="/idea-lab?new=1"
                className="glass inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-foreground transition hover:bg-white/[0.06]"
              >
                <Lightbulb className="size-4" /> Post an idea
              </Link>
            </div>
          </div>
          <figure className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <Quote className="size-5 text-violet" aria-hidden="true" />
            <blockquote className="mt-2 text-lg leading-snug font-semibold text-foreground">{quote.text}</blockquote>
            <figcaption className="mt-2 text-sm text-muted-foreground">{quote.by}</figcaption>
          </figure>
        </div>
      </section>

      {feedFailed && (
        <p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Your matches didn&apos;t load this time. Refresh the page, or open the Feed to try again.
        </p>
      )}

      <section aria-label="Your numbers" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={Briefcase}
          label="Openings matched"
          value={opportunities.length}
          note={`${weekDelta(oppSeries)} posted this week`}
          series={oppSeries}
          color="var(--chart-1)"
        />
        <StatTile
          icon={Send}
          label="Applications sent"
          value={applications.length}
          note={`${weekDelta(appSeries)} this week`}
          series={appSeries}
          color="var(--chart-2)"
        />
        <StatTile
          icon={Lightbulb}
          label="Ideas on Sangam"
          value={ideas.length}
          note={`${weekDelta(ideaSeries)} new this week`}
          series={ideaSeries}
          color="var(--chart-3)"
        />
        <div data-slot="card" className="relative flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Best skill match</span>
            <IconChip icon={Target} />
          </div>
          <span className="text-4xl font-extrabold tracking-tight text-foreground">
            <NumberTicker value={best} />%
          </span>
          <MeterBar value={best} label="Best skill match" showValue={false} color="var(--chart-4)" />
          <span className="text-xs text-muted-foreground">
            {matches[0]
              ? `${matches[0].fit.have} of ${matches[0].fit.total} skills for ${matches[0].o.title ?? "your top opening"}`
              : "Add skills to see how you fit"}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div data-slot="card" className="relative flex flex-col gap-4 p-5 xl:col-span-2">
          <BorderBeam size={90} duration={9} />
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Top matches</h2>
              <p className="text-sm text-muted-foreground">Ranked by how many of the asked-for skills you already have.</p>
            </div>
            <Link href="/feed" className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-violet">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </header>
          {matches.length === 0 ? (
            <EmptyLine text="No matches yet. Add skills and a goal to your profile, then check the Feed." href="/onboarding" cta="Update profile" />
          ) : (
            <ul className="flex flex-col divide-y divide-white/[0.06]">
              {matches.slice(0, 5).map(({ o, fit }) => (
                <li key={o.id}>
                  <Link
                    href={`/opportunities/${o.id}`}
                    className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.03] sm:grid-cols-[auto_1fr_12rem]"
                  >
                    <span
                      className="grid size-10 place-items-center rounded-xl text-sm font-bold text-white"
                      style={{ background: avatarFor(o.company) }}
                    >
                      {(o.company ?? "?").charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">{o.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {o.company}
                        {o.type ? ` · ${o.type}` : ""}
                        {fit.total ? ` · ${fit.have} of ${fit.total} skills` : ""}
                      </span>
                    </span>
                    <MeterBar className="col-span-2 sm:col-span-1" value={fit.pct} label={`Skill match for ${o.title}`} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div data-slot="card" className="flex flex-col items-center gap-4 p-5 text-center">
          <header className="w-full text-left">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Profile strength</h2>
            <p className="text-sm text-muted-foreground">A complete profile gets better matches.</p>
          </header>
          <ProgressRing value={strength} label="complete" size={156} />
          {missing.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your profile is complete. Nice work.</p>
          ) : (
            <ul className="flex w-full flex-col gap-1.5 text-left text-sm">
              {missing.slice(0, 3).map((m) => (
                <li key={m.todo}>
                  <Link href="/onboarding" className="flex items-center justify-between rounded-lg px-3 py-2 text-foreground hover:bg-white/[0.04]">
                    {m.todo}
                    <ArrowUpRight className="size-3.5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div data-slot="card" className="flex flex-col gap-4 p-5">
          <header>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Openings by type</h2>
            <p className="text-sm text-muted-foreground">What your feed is made of right now.</p>
          </header>
          {opportunities.length === 0 ? (
            <EmptyLine text="Nothing to chart yet." href="/feed" cta="Open the Feed" />
          ) : (
            <DonutChart segments={typeCounts} centerLabel="openings" ariaLabel="Openings in your feed by type" size={150} />
          )}
        </div>

        <div data-slot="card" className="flex flex-col gap-4 p-5">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Application pipeline</h2>
              <p className="text-sm text-muted-foreground">Hires count once you confirm them.</p>
            </div>
            <Link href="/applications" className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-violet">
              Open <ArrowUpRight className="size-3.5" />
            </Link>
          </header>
          <ol className="grid grid-cols-3 gap-2">
            {pipeline.map((p) => {
              const Icon = p.icon
              return (
                <li key={p.label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 text-2xl font-extrabold text-foreground tabular-nums">{p.value}</p>
                  <p className="text-xs text-muted-foreground">{p.label}</p>
                </li>
              )
            })}
          </ol>
          {applications.length === 0 ? (
            <EmptyLine text="You haven't applied yet. Your first application starts the pipeline." href="/feed" cta="Find an opening" />
          ) : (
            <ul className="flex flex-col gap-1">
              {applications.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{a.opportunity?.title ?? "Opening"}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {a.opportunity?.company} · {formatDistanceToNow(new Date(a.applied_at), { addSuffix: true })}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      a.status === "hired"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : a.status === "rejected"
                          ? "bg-white/5 text-muted-foreground"
                          : "bg-violet/15 text-violet"
                    )}
                  >
                    {a.status === "rejected" ? "Not selected" : a.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div data-slot="card" className="flex flex-col gap-3 p-5 lg:col-span-2 xl:col-span-1">
          <header>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Quick actions</h2>
            <p className="text-sm text-muted-foreground">Make your next move.</p>
          </header>
          <QuickAction href="/feed" icon={Briefcase} label="Browse matched openings" />
          <QuickAction href="/feed#ats" icon={FileText} label="Build an ATS-ready resume" />
          <QuickAction href="/idea-lab?new=1" icon={Lightbulb} label="Post an idea for feedback" />
          <QuickAction href="/mentors" icon={GraduationCap} label="Find a mentor" />
          {(profile?.role === "recruiter" || profile?.role === "admin") && (
            <QuickAction href="/reels" icon={Clapperboard} label="Post a hiring reel" />
          )}
        </div>
      </section>
    </>
  )
}

function StatTile({
  icon,
  label,
  value,
  note,
  series,
  color,
}: {
  icon: LucideIcon
  label: string
  value: number
  note: string
  series: SparkPoint[]
  color: string
}) {
  return (
    <div data-slot="card" className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <IconChip icon={icon} />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-4xl font-extrabold tracking-tight text-foreground">
            <NumberTicker value={value} />
          </span>
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </div>
        <Sparkline data={series} color={color} className="max-w-[9rem]" ariaLabel={`${label}, last 14 days`} />
      </div>
    </div>
  )
}

function IconChip({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid size-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-violet">
      <Icon className="size-[18px]" aria-hidden="true" />
    </span>
  )
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-white/[0.14] hover:bg-white/[0.05]"
    >
      <Icon className="size-4 text-violet" aria-hidden="true" />
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}

function EmptyLine({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
      {text}
      <Link href={href} className="font-semibold text-foreground hover:text-violet">
        {cta}
      </Link>
    </div>
  )
}

function SignedOut({ quote }: { quote: (typeof QUOTES)[number] }) {
  return (
    <section className="glass glass-sheen mx-auto mt-6 flex w-full max-w-2xl flex-col items-center gap-5 rounded-3xl px-6 py-12 text-center">
      <SangamMark size={72} animated />
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Your workspace is waiting.</h1>
      <p className="max-w-md text-muted-foreground">
        Sign in to see openings matched to your skills, track applications and get feedback on your ideas.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/auth"
          className="inline-flex h-11 items-center rounded-xl bg-[linear-gradient(135deg,#7b61f0,#5f78f6)] px-6 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]"
        >
          Sign in
        </Link>
        <Link href="/idea-lab" className="glass inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold text-foreground">
          Explore Idea Lab
        </Link>
      </div>
      <figure className="mt-2 max-w-md">
        <blockquote className="text-base font-semibold text-foreground">“{quote.text}”</blockquote>
        <figcaption className="mt-1 text-sm text-muted-foreground">{quote.by}</figcaption>
      </figure>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading your workspace">
      <div className="h-48 animate-pulse rounded-3xl bg-white/[0.04]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-[1.25rem] bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-80 animate-pulse rounded-[1.25rem] bg-white/[0.04] xl:col-span-2" />
        <div className="h-80 animate-pulse rounded-[1.25rem] bg-white/[0.04]" />
      </div>
    </div>
  )
}
