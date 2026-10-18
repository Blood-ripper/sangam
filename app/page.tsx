import { ConfluenceSection } from "@/components/landing/confluence"
import { ConnectSection } from "@/components/landing/connect"
import { FeaturesSection } from "@/components/landing/features"
import { LandingFooter } from "@/components/landing/footer"
import { HeroSection } from "@/components/landing/hero"
import { HiringSection } from "@/components/landing/hiring"
import { StatsSection } from "@/components/landing/stats"

export default function HomePage() {
  return (
    <main className="relative flex w-full flex-col overflow-x-clip">
      <HeroSection />
      <StatsSection />
      <ConnectSection />
      <FeaturesSection />
      <HiringSection />
      <ConfluenceSection />
      <LandingFooter />
    </main>
  )
}
