"use client"

import { useReducedMotion } from "motion/react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * A quiet WebGL backdrop for the hero: domain-warped fbm light in deep
 * ink (violet / periwinkle / cyan), plus three faint brand streams —
 * talent, ideas, opportunity — converging behind the 3D confluence.
 *
 * Raw WebGL, no dependencies. Renders at reduced resolution (it is soft by
 * design), pauses off-screen and in hidden tabs, draws a single static
 * frame for prefers-reduced-motion, and recovers from context loss.
 */

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

// One luminous stream that eases from its lane into the confluence point.
float stream(vec2 p, float lane, float phase, float t, vec2 meet) {
  float k = smoothstep(-0.95, meet.x, p.x);
  float y = mix(lane, meet.y, k * k * (3.0 - 2.0 * k));
  y += 0.04 * sin(p.x * 3.1 + t * 0.6 + phase) * (1.0 - k);
  float d = abs(p.y - y);
  float core = exp(-d * d / 0.00002);
  float halo = exp(-d * d / 0.003) * 0.3;
  float fadeIn = smoothstep(-0.55, 0.2, p.x);
  float fadeOut = 1.0 - smoothstep(meet.x - 0.04, meet.x + 0.14, p.x);
  return (core + halo) * fadeIn * fadeOut;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time;

  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t * 0.03)), fbm(p * 1.3 + vec2(5.2, -t * 0.025)));
  vec2 r = vec2(
    fbm(p * 1.5 + 2.0 * q + vec2(1.7, 9.2) + t * 0.02),
    fbm(p * 1.5 + 2.0 * q + vec2(8.3, 2.8) - t * 0.018)
  );
  float f = fbm(p * 1.1 + 2.4 * r);

  vec3 ink = vec3(0.027, 0.031, 0.059);
  vec3 violet = vec3(0.44, 0.36, 0.93);
  vec3 peri = vec3(0.37, 0.48, 0.97);
  vec3 cyan = vec3(0.40, 0.90, 0.98);

  // Light pools behind the right-hand column, where the 3D confluence sits.
  vec2 meet = vec2(0.42, 0.04);
  float pool = smoothstep(1.3, 0.0, length((p - meet) * vec2(0.9, 1.15)));

  vec3 col = ink;
  col += violet * 0.24 * smoothstep(0.05, 0.85, f + 0.45) * pool;
  col += peri * 0.14 * smoothstep(0.2, 0.9, length(q)) * pool;
  col += cyan * 0.07 * smoothstep(0.45, 1.0, r.x + 0.5) * pool;

  // Three faint brand streams converging at the confluence.
  col += vec3(0.30, 0.40, 0.91) * 0.22 * stream(p, 0.34, 0.0, t, meet);
  col += vec3(0.91, 0.62, 0.19) * 0.17 * stream(p, 0.02, 2.1, t, meet);
  col += vec3(0.14, 0.69, 0.50) * 0.20 * stream(p, -0.30, 4.2, t, meet);

  // Keep the headline side calm.
  col = mix(ink, col, 0.4 + 0.6 * smoothstep(-0.9, 0.15, p.x));

  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + t) * 43758.5453);
  col += (g - 0.5) * 0.012;

  gl_FragColor = vec4(col, 1.0);
}
`

const RENDER_SCALE = 0.6
const STATIC_TIME = 14

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function AuroraShader({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    })
    if (!gl) {
      canvas.style.display = "none"
      return
    }

    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let uRes: WebGLUniformLocation | null = null
    let uTime: WebGLUniformLocation | null = null
    let raf = 0
    let running = false
    let onScreen = true
    let elapsed = STATIC_TIME
    let last = 0

    const setup = () => {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT)
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
      if (!vs || !fs) return false
      program = gl.createProgram()
      if (!program) return false
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false
      gl.useProgram(program)
      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      // One oversized triangle covers the whole viewport.
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(program, "a_pos")
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      uRes = gl.getUniformLocation(program, "u_res")
      uTime = gl.getUniformLocation(program, "u_time")
      return true
    }

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * RENDER_SCALE))
      const h = Math.max(1, Math.floor(canvas.clientHeight * RENDER_SCALE))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
    }

    const draw = () => {
      if (!program) return
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, elapsed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = (now: number) => {
      if (!running) return
      elapsed += Math.min(0.05, (now - last) / 1000)
      last = now
      draw()
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || reduceMotion || !onScreen || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    if (!setup()) {
      canvas.style.display = "none"
      return
    }
    resize()
    draw()
    start()

    const ro = new ResizeObserver(() => {
      resize()
      if (!running) draw()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) start()
      else stop()
    })
    io.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVisibility)

    const onLost = (e: Event) => {
      e.preventDefault()
      stop()
      program = null
    }
    const onRestored = () => {
      if (!setup()) return
      resize()
      draw()
      start()
    }
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
    }
  }, [reduceMotion])

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("pointer-events-none block size-full", className)} />
}
