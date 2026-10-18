"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { ArrowUpRight, LifeBuoy, LogOut, UserRound } from "lucide-react"
import { SangamMark } from "@/components/brand/sangam-logo"
import { cn } from "@/lib/utils"
import { NAV_GROUPS, isActive } from "./nav-config"
import { initials, roleLabel, useSession } from "./session"

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const session = useSession()

  return (
    <div className="flex h-full flex-col gap-6 px-4 pt-5 pb-4">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-1.5 py-1"
        aria-label="Sangam home"
      >
        <SangamMark size={34} />
        <span className="flex flex-col">
          <span className="text-[1.15rem] leading-none font-semibold tracking-[-0.02em] text-white">Sangam</span>
          <span className="mt-1 text-[11px] leading-none text-muted-foreground">Proof, not promises.</span>
        </span>
      </Link>

      <div className="glass glass-sheen flex items-center gap-3 rounded-2xl px-3 py-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#7b61f0,#5f78f6)] text-sm font-semibold text-white">
          {session.signedIn ? initials(session.name) : <UserRound className="size-[18px]" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {session.signedIn ? `${roleLabel(session.role)} workspace` : "Guest workspace"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {session.signedIn ? (session.college ?? "Personal space") : "Browse, ask and vote"}
          </span>
        </span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((i) => !i.roles || (session.role && i.roles.includes(session.role)))
          return (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground/80">{group.label}</p>
              {items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors",
                      active ? "text-white" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-white/[0.06] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_0_1px_rgb(255_255_255/0.07)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    {active && (
                      <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-[linear-gradient(180deg,#a08cff,#67e8f9)]" />
                    )}
                    <Icon className={cn("relative size-[18px]", active ? "text-violet" : "")} />
                    <span className="relative flex-1 font-medium">{item.label}</span>
                    {item.badge === "ideas" && session.ideaCount !== null && session.ideaCount > 0 && (
                      <span className="relative rounded-md bg-violet/15 px-1.5 py-0.5 text-[11px] font-semibold text-violet tabular-nums">
                        {session.ideaCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="glass glass-sheen flex flex-col gap-2 rounded-2xl p-4">
        <span className="grid size-9 place-items-center rounded-xl bg-[linear-gradient(135deg,#7b61f0,#5f78f6)] text-white">
          <LifeBuoy className="size-[18px]" />
        </span>
        <p className="text-sm font-semibold text-foreground">Need a hand?</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Answers, tips and a direct line to the Sangam team.
        </p>
        <Link
          href="/faq"
          onClick={onNavigate}
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-violet"
        >
          Visit Help & FAQ <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-3 border-t border-white/[0.06] px-1 pt-4">
        {session.signedIn ? (
          <>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#4d66e9,#24b07f)] text-xs font-semibold text-white">
              {initials(session.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{session.name ?? "Your account"}</span>
              <span className="block truncate text-xs text-muted-foreground">{roleLabel(session.role)}</span>
            </span>
            <button
              type="button"
              onClick={session.signOut}
              aria-label="Sign out"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            onClick={onNavigate}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7b61f0,#5f78f6)] text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  )
}
