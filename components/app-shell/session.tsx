"use client"

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Session = {
  signedIn: boolean
  loading: boolean
  name: string | null
  role: string | null
  college: string | null
  hireProof: number | null
  ideaCount: number | null
  signOut: () => Promise<void>
}

const SessionContext = createContext<Session | null>(null)

/** Who is signed in, shared by the sidebar, top bar and landing nav. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [state, setState] = useState<Omit<Session, "signOut">>({
    signedIn: false,
    loading: true,
    name: null,
    role: null,
    college: null,
    hireProof: null,
    ideaCount: null,
  })

  // Re-check on every route change: right after onboarding sets a name or
  // role, or after a sign-in / sign-out redirect.
  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) {
        setState((s) => ({ ...s, signedIn: false, loading: false, name: null, role: null, college: null, hireProof: null }))
        return
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role, college, hire_proof_score")
        .eq("id", user.id)
        .maybeSingle()
      if (cancelled) return
      setState((s) => ({
        ...s,
        signedIn: true,
        loading: false,
        name: profile?.name ?? user.email?.split("@")[0] ?? null,
        role: profile?.role ?? null,
        college: profile?.college ?? null,
        hireProof: profile?.hire_proof_score ?? null,
      }))
    })
    return () => {
      cancelled = true
    }
  }, [pathname, supabase])

  // Idea count for the sidebar badge — once per visit.
  useEffect(() => {
    let cancelled = false
    supabase
      .from("ideas")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (!cancelled) setState((s) => ({ ...s, ideaCount: count ?? null }))
      })
    return () => {
      cancelled = true
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }, [supabase, router])

  const value = useMemo(() => ({ ...state, signOut }), [state, signOut])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>")
  return ctx
}

export function initials(name: string | null) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}

export function roleLabel(role: string | null) {
  switch (role) {
    case "seeker":
      return "Job seeker"
    case "founder":
      return "Founder"
    case "recruiter":
      return "Recruiter"
    case "mentor":
      return "Mentor"
    case "admin":
      return "Admin"
    default:
      return "Member"
  }
}
