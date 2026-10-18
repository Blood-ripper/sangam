"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CornerDownLeft, FileText, LogOut, Mail, Plus, Search, type LucideIcon } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { NAV_GROUPS } from "./nav-config"
import { useSession } from "./session"

type Command = { id: string; label: string; group: string; icon: LucideIcon; run: () => void }

/** ⌘K / Ctrl K palette: jump to any page or run a common action. */
export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const session = useSession()
  const [query, setQuery] = useState("")
  const [index, setIndex] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      onOpenChange(false)
      router.push(href)
    }
    const pages = NAV_GROUPS.flatMap((g) => g.items)
      .filter((i) => !i.roles || (session.role && i.roles.includes(session.role)))
      .map((i) => ({ id: i.href, label: i.label, group: "Go to", icon: i.icon, run: go(i.href) }))
    const actions: Command[] = [
      { id: "new-idea", label: "Post an idea", group: "Actions", icon: Plus, run: go("/idea-lab?new=1") },
      { id: "ats", label: "Build an ATS-ready resume", group: "Actions", icon: FileText, run: go("/feed") },
      {
        id: "support",
        label: "Email the Sangam team",
        group: "Actions",
        icon: Mail,
        run: () => {
          onOpenChange(false)
          window.location.href = "mailto:gcollab749@gmail.com?subject=Sangam%20support%20request"
        },
      },
    ]
    if (session.signedIn) {
      actions.push({
        id: "sign-out",
        label: "Sign out",
        group: "Actions",
        icon: LogOut,
        run: () => {
          onOpenChange(false)
          void session.signOut()
        },
      })
    }
    return [...pages, ...actions]
  }, [router, session, onOpenChange])

  const results = commands.filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase()))
  const safeIndex = Math.min(index, Math.max(0, results.length - 1))

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      results[safeIndex]?.run()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search Sangam</DialogTitle>
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIndex(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages and actions…"
            aria-label="Search pages and actions"
            aria-controls="command-results"
            aria-activedescendant={results[safeIndex] ? `cmd-${results[safeIndex].id}` : undefined}
            className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 text-[11px] text-muted-foreground">Esc</kbd>
        </div>
        <ul id="command-results" ref={listRef} role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing matches “{query}”. Try “feed”, “mentors” or “idea”.
            </li>
          )}
          {results.map((c, i) => {
            const header = i === 0 || results[i - 1].group !== c.group ? c.group : null
            const Icon = c.icon
            return (
              <li key={c.id} role="presentation">
                {header && <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground/80">{header}</p>}
                <button
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === safeIndex}
                  type="button"
                  onMouseMove={() => setIndex(i)}
                  onClick={c.run}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    i === safeIndex ? "bg-white/[0.07] text-white" : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="flex-1">{c.label}</span>
                  {i === safeIndex && <CornerDownLeft className="size-3.5 opacity-70" />}
                </button>
              </li>
            )
          })}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
