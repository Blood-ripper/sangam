import Link from "next/link"
import { Activity, ShieldCheck, Star, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Reveal } from "@/components/motion/reveal"
import { CountUp } from "@/components/motion/count-up"

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Hire-Proof Score",
    description:
      "Recruiters are scored on confirmed hires, not just listings posted — so you can tell who actually follows through.",
  },
  {
    icon: Activity,
    title: "Idea Pulse",
    description:
      "Founders validate ideas against real campus demand before they build, with live polls behind every pulse score.",
  },
  {
    icon: Target,
    title: "Skill-Gap Coach",
    description:
      "See exactly which skills stand between your profile and the role you want, for every opportunity you open.",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description:
      "Ratings come from people with a real, verified interaction on the platform — not anonymous noise.",
  },
]

const STATS = [
  {
    target: 93,
    decimals: 0,
    suffix: "%",
    label: "of Indian job seekers saw suspected job scams",
    source: "Indeed, Jul 2026",
  },
  {
    target: 56.35,
    decimals: 2,
    suffix: "%",
    label: "graduate employability",
    source: "India Skills Report 2026",
  },
  {
    target: 2.23,
    decimals: 2,
    suffix: " lakh",
    label: "DPIIT-registered startups",
    source: "DPIIT",
  },
]

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-16 px-4 py-16 sm:py-24">
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <Reveal>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Where talent, ideas and opportunities meet. Proof, not promises.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-muted-foreground sm:text-lg">
            Sangam connects job seekers, founders, startups, mentors, and
            recruiters on one verified network — every recruiter, idea, and
            review carries a track record you can check.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/auth">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/feed">Explore opportunities</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.title} inView delay={i * 0.08}>
            <Card>
              <CardHeader>
                <feature.icon className="size-6 text-primary" aria-hidden="true" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} inView delay={i * 0.08}>
            <Card>
              <CardContent className="flex flex-col gap-1 text-center">
                <CountUp
                  value={stat.target}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                  className="text-3xl font-semibold"
                />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-xs text-muted-foreground">— {stat.source}</span>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </section>
    </main>
  )
}
