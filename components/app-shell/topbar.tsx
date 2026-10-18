"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSyncExternalStore } from "react"
import { Menu, Plus, Search } from "lucide-react"
import { SangamMark } from "@/components/brand/sangam-logo"
import { sectionFor } from "./nav-config"

const noop = () => () => {}

export function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const pathname = usePathname()
  const isMac = useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false
  )

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-[#07080f]/70 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <Link href="/" aria-label="Sangam home" className="lg:hidden">
        <SangamMark size={26} />
      </Link>

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
        <span className="hidden text-muted-foreground sm:inline">Sangam</span>
        <span aria-hidden="true" className="hidden text-muted-foreground/40 sm:inline">
          /
        </span>
        <span className="truncate font-semibold text-foreground">{sectionFor(pathname)}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onSearch}
          className="glass hidden h-10 w-60 items-center gap-2.5 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex lg:w-72"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search Sangam…</span>
          <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px]">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search Sangam"
          className="grid size-10 place-items-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground md:hidden"
        >
          <Search className="size-5" />
        </button>
        <Link
          href="/idea-lab?new=1"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,#7b61f0,#5f78f6)] px-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_10px_26px_-12px_rgb(110_91_235/0.8)] transition hover:brightness-110 sm:px-4"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">New idea</span>
          <span className="sr-only sm:hidden">New idea</span>
        </Link>
      </div>
    </header>
  )
}
