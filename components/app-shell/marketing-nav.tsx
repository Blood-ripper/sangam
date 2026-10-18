"use client"

import Link from "next/link"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"
import { SangamLogo } from "@/components/brand/sangam-logo"
import { useSession } from "./session"

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/idea-lab", label: "Idea Lab" },
  { href: "/mentors", label: "Mentors" },
  { href: "/reels", label: "Reels" },
  { href: "/community", label: "Community" },
  { href: "/faq", label: "FAQ" },
]

/** Floating liquid-glass navigation for the landing page. */
export function MarketingNav() {
  const session = useSession()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <div className="glass-strong glass-sheen mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full pr-2 pl-4">
        <Link href="/" aria-label="Sangam home" className="rounded-full">
          <SangamLogo size={28} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session.signedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-full bg-[linear-gradient(135deg,#7b61f0,#5f78f6)] px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth"
                className="hidden h-10 items-center rounded-full px-4 text-sm font-medium text-foreground hover:bg-white/[0.06] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="inline-flex h-10 items-center rounded-full bg-[linear-gradient(135deg,#7b61f0,#5f78f6)] px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]"
              >
                Get started
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-white/[0.06] hover:text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="glass-strong mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl p-2 md:hidden"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-white/[0.06]"
              >
                {l.label}
              </Link>
            ))}
            {!session.signedIn && (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-white/[0.06]"
              >
                Sign in
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
