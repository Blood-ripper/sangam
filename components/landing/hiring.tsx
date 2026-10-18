import { FeaturedWheel } from "@/components/featured-wheel"

export function HiringSection() {
  return (
    <section aria-labelledby="hiring-heading" className="relative">
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="flex flex-col gap-3">
          <h2 id="hiring-heading" className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Openings on the feed right now.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Scroll or drag the wheel to browse, then open one to see its match score and Hire-Proof record.
          </p>
        </div>
      </div>
      <div className="mx-auto mt-6 w-full max-w-7xl overflow-hidden rounded-[1.5rem] px-0 sm:px-6 lg:px-8">
        <FeaturedWheel />
      </div>
    </section>
  )
}
