"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Lightformer, MarchingCube, MarchingCubes } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

/**
 * The Sangam confluence: three liquid metaballs — Talent (blue), Ideas
 * (amber), Opportunity (emerald) — orbit, flow together into one blob,
 * then part again. Built on drei's MarchingCubes.
 *
 * Coordinate note: drei's MarchingCube maps a ball's WORLD position from
 * [-1, 1] into the field's [0, 1] space, so the MarchingCubes mesh and its
 * parents must stay at the origin with no rotation or scale. Framing is
 * done with the camera instead, and parallax moves the camera.
 */

const BRAND = ["#4d66e9", "#e89e31", "#24b07f"]
const CYCLE = 9 // seconds for one apart → together → apart breath
const STILL_TIME = 2.6 // a trefoil pose (three lobes, one body) for reduced motion

// Field tuning: a high `subtract` keeps each ball's colour local, so the
// merged body shows three coloured lobes instead of washing out to white.
// Colours are boosted to make up for the softer falloff at the surface.
const STRENGTH = 1.53
const SUBTRACT = 40
const COLOR_BOOST = 2

function Blobs({ still, resolution }: { still: boolean; resolution: number }) {
  const balls = useRef<(THREE.Group | null)[]>([])
  const colors = useMemo(() => BRAND.map((c) => new THREE.Color(c).multiplyScalar(COLOR_BOOST)), [])
  const time = useRef(STILL_TIME)

  useFrame((_, delta) => {
    if (!still) time.current += Math.min(delta, 1 / 30)
    const t = time.current
    const s = 0.5 + 0.5 * Math.cos((2 * Math.PI * t) / CYCLE)
    const ease = s * s * (3 - 2 * s)
    const radius = 0.12 + 0.33 * ease
    const spin = t * 0.5
    for (let i = 0; i < 3; i++) {
      const ball = balls.current[i]
      if (!ball) continue
      const a = spin + (i * Math.PI * 2) / 3
      ball.position.set(
        Math.cos(a) * radius,
        Math.sin(a) * radius * 0.82 + Math.sin(t * 1.25 + i * 2.1) * 0.025,
        Math.sin(a) * radius * 0.3
      )
    }
  })

  return (
    <MarchingCubes resolution={resolution} maxPolyCount={20000} enableUvs={false} enableColors>
      <meshPhysicalMaterial
        vertexColors
        roughness={0.16}
        metalness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.1}
        iridescence={0.35}
        iridescenceIOR={1.25}
        envMapIntensity={1.15}
      />
      {colors.map((color, i) => (
        <MarchingCube
          key={BRAND[i]}
          ref={(el) => {
            balls.current[i] = el
          }}
          strength={STRENGTH}
          subtract={SUBTRACT}
          color={color}
        />
      ))}
    </MarchingCubes>
  )
}

/** Camera parallax toward the pointer (window-wide), eased. */
function Rig({ still }: { still: boolean }) {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (still) return
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [still])

  useFrame(({ camera }) => {
    const tx = still ? 0 : pointer.current.x * 0.35
    const ty = still ? 0 : -pointer.current.y * 0.25
    camera.position.x += (tx - camera.position.x) * 0.04
    camera.position.y += (ty - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

/** With frameloop="demand", render a few frames so the field fills in. */
function Prime({ frames = 4 }: { frames?: number }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let n = 0
    let raf = 0
    const tick = () => {
      invalidate()
      n += 1
      if (n < frames) raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [invalidate, frames])
  return null
}

export function ConfluenceScene({
  active,
  still,
  resolution = 52,
}: {
  /** False while off-screen: rendering pauses. */
  active: boolean
  /** prefers-reduced-motion: one static, half-merged frame. */
  still: boolean
  resolution?: number
}) {
  const animate = active && !still

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 2.7], fov: 35, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={animate ? "always" : "demand"}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
        gl.setClearColor(0x000000, 0)
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 4]} intensity={1.3} />
      <pointLight position={[-2.5, -1.5, 2]} intensity={6} color="#a08cff" />
      <pointLight position={[2.5, 1.5, -1]} intensity={4} color="#67e8f9" />
      <pointLight position={[0, -3, 2]} intensity={3} color="#dcd6ff" />

      <Blobs still={still} resolution={resolution} />
      <Rig still={still} />
      {!animate && <Prime />}

      {/* Procedural studio lighting for reflections — no HDR download. */}
      <Environment resolution={256} frames={1}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
          <Lightformer form="ring" color="#a08cff" intensity={5} position={[10, 10, 0]} scale={10} target={[0, 0, 0]} />
        </group>
      </Environment>
    </Canvas>
  )
}
