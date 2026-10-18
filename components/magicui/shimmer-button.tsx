import Link from "next/link"
import type { ComponentProps, CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Adapted from Magic UI's Shimmer Button (MIT): a light that circles the
 * edge of the primary call to action. Rendered as a Next.js Link.
 */
function ShimmerLayers({ children }: { children: ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]">
        <span className="animate-shimmer-slide absolute inset-0 aspect-square h-[100cqh] [border-radius:0] [mask:none]">
          <span className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </span>
      </span>
      {children}
      <span
        aria-hidden="true"
        className="absolute inset-0 size-full rounded-[inherit] shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]"
      />
      <span aria-hidden="true" className="absolute -z-20 [inset:var(--cut)] rounded-[inherit] [background:var(--bg)]" />
    </>
  )
}

export function ShimmerLink({
  className,
  children,
  shimmerColor = "#e9e4ff",
  shimmerDuration = "3s",
  background = "linear-gradient(135deg, #7b61f0 0%, #5f78f6 100%)",
  ...props
}: ComponentProps<typeof Link> & {
  shimmerColor?: string
  shimmerDuration?: string
  background?: string
}) {
  return (
    <Link
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--speed": shimmerDuration,
          "--cut": "0.08em",
          "--bg": background,
        } as CSSProperties
      }
      className={cn(
        "group relative z-0 inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-white/15 px-6 py-3 text-sm font-semibold whitespace-nowrap text-white [background:var(--bg)]",
        "transform-gpu transition-transform duration-300 ease-out active:translate-y-px",
        className
      )}
      {...props}
    >
      <ShimmerLayers>{children}</ShimmerLayers>
    </Link>
  )
}
