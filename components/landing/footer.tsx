import Link from "next/link"
import { Mail } from "lucide-react"
import { SangamLogo } from "@/components/brand/sangam-logo"
import { BorderBeam } from "@/components/magicui/border-beam"
import { ShimmerLink } from "@/components/magicui/shimmer-button"

const PRODUCT_LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/idea-lab", label: "Idea Lab" },
  { href: "/mentors", label: "Mentors" },
  { href: "/reels", label: "Reels" },
  { href: "/community", label: "Community" },
]

const SUPPORT_EMAIL = "gcollab749@gmail.com"

export function LandingFooter() {
  return (
    <>
      <section aria-labelledby="cta-heading" className="relative">
        <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="glass-strong glass-sheen relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(139_124_246/0.35),transparent)] blur-2xl"
            />
            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex max-w-2xl flex-col gap-3">
                <h2 id="cta-heading" className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  Bring your skills, your idea or your openings.
                </h2>
                <p className="text-muted-foreground">
                  Sign in with Google in under a minute. Your feed, your Hire-Proof record and Idea Lab are waiting.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ShimmerLink href="/auth" className="h-12 px-7 text-[15px]">
                  Join Sangam
                </ShimmerLink>
                <Link
                  href="/faq"
                  className="inline-flex h-12 items-center rounded-full border border-white/12 px-6 text-[15px] font-semibold text-foreground transition-colors hover:bg-white/[0.06]"
                >
                  Read the FAQ
                </Link>
              </div>
            </div>
            <BorderBeam size={120} duration={9} />
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div className="flex flex-col gap-4">
            <SangamLogo size={34} />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Where talent, ideas and opportunities meet. Proof, not promises.
            </p>
          </div>

          <nav aria-label="Product" className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground transition-colors hover:text-foreground">
                  FAQ and help
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Sangam support request")}`}
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4" aria-hidden="true" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.05]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>Built by Team CAMBIA-REGLAS for Triple IT HackShift 2026</p>
            <p>© 2026 Sangam</p>
          </div>
        </div>
      </footer>
    </>
  )
}
