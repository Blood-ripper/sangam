import { Children, type CSSProperties, type ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Adapted from Magic UI's Orbiting Circles (MIT). Children orbit the centre of a relative flex parent. */
export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  radius = 160,
  path = true,
  iconSize = 36,
  speed = 1,
}: {
  className?: string
  children?: ReactNode
  reverse?: boolean
  duration?: number
  radius?: number
  path?: boolean
  iconSize?: number
  speed?: number
}) {
  const count = Children.count(children)
  return (
    <>
      {path && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="rgb(255 255 255 / 0.08)"
            strokeDasharray="3 6"
          />
        </svg>
      )}
      {Children.map(children, (child, i) => (
        <div
          style={
            {
              "--duration": duration / speed,
              "--radius": radius,
              "--angle": (360 / count) * i,
              "--icon-size": `${iconSize}px`,
            } as CSSProperties
          }
          className={cn(
            "animate-orbit absolute flex size-(--icon-size) transform-gpu items-center justify-center rounded-full",
            reverse && "[animation-direction:reverse]",
            className
          )}
        >
          {child}
        </div>
      ))}
    </>
  )
}
