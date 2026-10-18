"use client"

import dynamic from "next/dynamic"
import { useReducedMotion } from "motion/react"
import { Component, type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { SangamMark } from "@/components/brand/sangam-logo"
import { cn } from "@/lib/utils"

const ConfluenceScene = dynamic(() => import("./confluence-scene").then((m) => m.ConfluenceScene), {
  ssr: false,
  loading: () => null,
})

let webglSupport: boolean | undefined
function detectWebGL() {
  if (webglSupport === undefined) {
    try {
      const c = document.createElement("canvas")
      webglSupport = !!(c.getContext("webgl2") || c.getContext("webgl"))
    } catch {
      webglSupport = false
    }
  }
  return webglSupport
}
const noopSubscribe = () => () => {}

const SMALL_QUERY = "(max-width: 640px)"
function subscribeSmall(onChange: () => void) {
  const mq = window.matchMedia(SMALL_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}
const getSmall = () => window.matchMedia(SMALL_QUERY).matches

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function Fallback() {
  return (
    <div className="flex size-full items-center justify-center">
      <SangamMark size={220} className="drop-shadow-[0_0_60px_rgb(139_124_246/0.45)]" />
    </div>
  )
}

/**
 * Client wrapper for the 3D confluence: detects WebGL, lazy-loads the
 * three.js scene (no SSR), pauses it off-screen, and falls back to the
 * flat Sangam mark if WebGL is missing or the scene throws.
 */
export function ConfluenceCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const supported = useSyncExternalStore(noopSubscribe, detectWebGL, () => null)
  const small = useSyncExternalStore(subscribeSmall, getSmall, () => false)
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: "120px",
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} aria-hidden="true" className={cn("relative", className)}>
      {/* Soft halo so the liquid reads against deep ink */}
      <div className="pointer-events-none absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgb(139_124_246/0.28),rgb(103_232_249/0.08)_45%,transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-x-[22%] bottom-[9%] h-[8%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(160_140_255/0.25),transparent)] blur-md" />
      <div className="absolute inset-0">
        {supported === false ? (
          <Fallback />
        ) : supported ? (
          <SceneBoundary fallback={<Fallback />}>
            <ConfluenceScene active={onScreen} still={!!reduceMotion} resolution={small ? 40 : 52} />
          </SceneBoundary>
        ) : null}
      </div>
    </div>
  )
}
