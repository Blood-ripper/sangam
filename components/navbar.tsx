"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

// Paths where the navbar doesn't render — app/layout.tsx renders <Navbar />
// unconditionally, so the hide logic lives here (it needs usePathname(),
// which only works in a Client Component, which this already is).
const HIDDEN_PATHS = ["/auth", "/onboarding"]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [signedIn, setSignedIn] = useState(false)
  const [name, setName] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    // Deferred via .then() rather than an inline async body: see the same
    // note in app/recruiter/page.tsx (react-hooks/set-state-in-effect).
    Promise.resolve().then(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setSignedIn(false)
        setName(null)
        setRole(null)
        return
      }

      setSignedIn(true)

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .maybeSingle()

      setName(profile?.name ?? null)
      setRole(profile?.role ?? null)
    })
    // Re-check on every route change — e.g. right after onboarding sets a
    // name/role, or after a sign-in/out redirect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const hidden = HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
  if (hidden) return null

  async function handleSignOut() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push("/auth")
  }

  const navLinks = [
    { href: "/feed", label: "Feed" },
    { href: "/idea-lab", label: "Idea Lab" },
    { href: "/mentors", label: "Mentors" },
    ...(role === "recruiter" ? [{ href: "/recruiter", label: "Recruiter" }] : []),
    { href: "/applications", label: "My Applications" },
  ]

  return (
    <motion.header
      className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur"
      initial={reduceMotion ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
        <Link href="/" className="font-heading text-lg font-semibold">
          Sangam
        </Link>

        <div className="hidden items-center gap-4 text-sm font-medium sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          {signedIn ? (
            <>
              <span className="text-sm text-muted-foreground">
                {name ?? "Account"}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth">Sign in</Link>
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-t p-4 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center justify-between border-t pt-3">
            {signedIn ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {name ?? "Account"}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="w-full">
                <Link href="/auth" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.header>
  )
}
