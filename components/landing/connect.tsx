"use client"

import { type Ref, useRef } from "react"
import {
  Briefcase,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  Handshake,
  Lightbulb,
  type LucideIcon,
  Trophy,
} from "lucide-react"
import { SangamMark } from "@/components/brand/sangam-logo"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { cn } from "@/lib/utils"

const INPUTS = [
  { label: "Job seekers", icon: GraduationCap, color: "#6f8bff" },
  { label: "Founders", icon: Lightbulb, color: "#e89e31" },
  { label: "Mentors", icon: Compass, color: "#a08cff" },
]

const OUTPUTS = [
  { label: "Internships", icon: BriefcaseBusiness },
  { label: "Jobs", icon: Briefcase },
  { label: "Hackathons", icon: Trophy },
  { label: "Co-founders", icon: Handshake },
]

const STEPS = [
  {
    title: "Verify",
    body: "College email and domain checks for people; CIN or GSTIN checks for companies.",
  },
  {
    title: "Match",
    body: "Your skills and goal are embedded and ranked against every opening, with the reasons shown.",
  },
  {
    title: "Prove",
    body: "A hire counts when the candidate confirms it. No confirmed hire in 60 days marks a listing Unproven.",
  },
]

function Node({
  ref,
  icon: Icon,
  label,
  color,
}: {
  ref: Ref<HTMLDivElement>
  icon: LucideIcon
  label: string
  color: string
}) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div
        ref={ref}
        className="glass flex size-11 items-center justify-center rounded-full sm:size-14"
        style={{ boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.08), 0 0 24px -6px ${color}` }}
      >
        <Icon className="size-5 sm:size-6" style={{ color }} aria-hidden="true" />
      </div>
      <span className="text-center text-[11px] font-medium text-foreground/90 sm:text-sm">{label}</span>
    </div>
  )
}

export function ConnectSection() {
  const container = useRef<HTMLDivElement>(null)
  const center = useRef<HTMLDivElement>(null)
  const in0 = useRef<HTMLDivElement>(null)
  const in1 = useRef<HTMLDivElement>(null)
  const in2 = useRef<HTMLDivElement>(null)
  const out0 = useRef<HTMLDivElement>(null)
  const out1 = useRef<HTMLDivElement>(null)
  const out2 = useRef<HTMLDivElement>(null)
  const out3 = useRef<HTMLDivElement>(null)
  const inRefs = [in0, in1, in2]
  const outRefs = [out0, out1, out2, out3]

  return (
    <section aria-labelledby="connect-heading" className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col gap-3">
          <h2 id="connect-heading" className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            One network, every side of the table.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Seekers, founders and mentors flow in. Verified internships, jobs, hackathons and co-founders flow out.
          </p>
        </div>

        <div
          ref={container}
          className="relative mx-auto mt-12 grid h-[380px] max-w-5xl grid-cols-3 items-center sm:h-[440px]"
        >
          <div className="flex h-full flex-col items-start justify-between py-2">
            {INPUTS.map((n, i) => (
              <Node key={n.label} ref={inRefs[i]} icon={n.icon} label={n.label} color={n.color} />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <div
              ref={center}
              className="glass-strong glass-sheen flex size-24 items-center justify-center rounded-full sm:size-32"
              style={{ boxShadow: "0 0 80px -10px rgb(139 124 246 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.12)" }}
            >
              <SangamMark size={56} className="sm:hidden" />
              <SangamMark size={72} className="hidden sm:block" />
            </div>
            <span className="text-sm font-semibold text-foreground">Sangam</span>
          </div>

          <div className="flex h-full flex-col items-end justify-between py-2">
            {OUTPUTS.map((n, i) => (
              <Node key={n.label} ref={outRefs[i]} icon={n.icon} label={n.label} color="#24b07f" />
            ))}
          </div>

          {INPUTS.map((n, i) => (
            <AnimatedBeam
              key={n.label}
              containerRef={container}
              fromRef={inRefs[i]}
              toRef={center}
              gradientStartColor={n.color}
              gradientStopColor="#a08cff"
              duration={4.5}
              delay={i * 0.7}
              pathWidth={2}
            />
          ))}
          {OUTPUTS.map((n, i) => (
            <AnimatedBeam
              key={n.label}
              containerRef={container}
              fromRef={center}
              toRef={outRefs[i]}
              gradientStartColor="#a08cff"
              gradientStopColor="#24b07f"
              duration={4.5}
              delay={1.6 + i * 0.45}
              pathWidth={2}
            />
          ))}
        </div>

        <ol className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className={cn("flex flex-col gap-2 border-t border-white/[0.08] pt-5")}>
              <span className="text-xs font-medium text-muted-foreground tabular-nums">Step {i + 1}</span>
              <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
