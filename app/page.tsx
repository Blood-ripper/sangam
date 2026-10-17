import Link from "next/link"
import { Activity, ShieldCheck, Star, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"
import { Spotlight } from "@/components/motion/spotlight"
import { AnimatedGradientText } from "@/components/motion/animated-gradient-text"
import { BentoCard, BentoGrid } from "@/components/motion/bento-grid"
import { StatsMarquee } from "@/components/motion/stats-marquee"
import { FeaturedWheel } from "@/components/featured-wheel"

// Neutral (zero-chroma) gradient stops, matching this theme's grayscale
// palette (see --foreground/--muted-foreground in app/globals.css)
// instead of Aceternity/Magic UI's default brand-colored presets.
const GLOW = {
  gradientFirst:
    "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(0, 0%, 100%, .10) 0, hsla(0, 0%, 100%, .03) 50%, hsla(0, 0%, 100%, 0) 80%)",
  gradientSecond:
    "radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .08) 0, hsla(0, 0%, 100%, .02) 80%, transparent 100%)",
  gradientThird:
    "radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .06) 0, hsla(0, 0%, 100%, .02) 80%, transparent 100%)",
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Hire-Proof Score",
    description:
      "Recruiters are scored on confirmed hires, not just listings posted — so you can tell who actually follows through.",
    href: "/feed",
    cta: "See the feed",
    span: "sm:col-span-2",
  },
  {
    icon: Activity,
    title: "Idea Pulse",
    description:
      "Founders validate ideas against real campus demand before they build, with live polls behind every pulse score.",
    href: "/idea-lab",
    cta: "Explore ideas",
    span: "sm:col-span-1",
  },
  {
    icon: Target,
    title: "Skill-Gap Coach",
    description:
      "See exactly which skills stand between your profile and the role you want, for every opportunity you open.",
    href: "/feed",
    cta: "Find a gap to close",
    span: "sm:col-span-1",
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description:
      "Ratings come from people with a real, verified interaction on the platform — not anonymous noise.",
    href: "/feed",
    cta: "Read verified reviews",
    span: "sm:col-span-2",
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
      <section className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 overflow-hidden text-center">
        <Spotlight {...GLOW} />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <Reveal>
            <AnimatedGradientText
              colorFrom="var(--foreground)"
              colorTo="var(--muted-foreground)"
              className="text-sm font-medium"
            >
              Built for HackShift 2026
            </AnimatedGradientText>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Where talent, ideas and opportunities meet. Proof, not promises.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-muted-foreground sm:text-lg">
              Sangam connects job seekers, founders, startups, mentors, and
              recruiters on one verified network — every recruiter, idea, and
              review carries a track record you can check.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="btn-glow">
                <Link href="/auth">Get started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/feed">Explore opportunities</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <h2 className="text-center text-sm font-medium text-muted-foreground">
          Scroll to explore
        </h2>
        <FeaturedWheel />
      </section>

      <section className="mx-auto w-full max-w-4xl">
        <BentoGrid className="auto-rows-[16rem] grid-cols-1 sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal
              key={feature.title}
              inView
              delay={i * 0.1}
              className={feature.span}
            >
              <BentoCard
                name={feature.title}
                description={feature.description}
                Icon={feature.icon}
                href={feature.href}
                cta={feature.cta}
                className="h-full"
                background={
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent" />
                }
              />
            </Reveal>
          ))}
        </BentoGrid>
      </section>

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <h2 className="text-center text-sm font-medium text-muted-foreground">
          By the numbers
        </h2>
        <Reveal inView>
          <StatsMarquee stats={STATS} />
        </Reveal>
      </section>
    </main>
  )
}
