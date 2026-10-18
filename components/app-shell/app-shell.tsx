"use client"

import { type ReactNode, useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { X } from "lucide-react"
import { CommandMenu } from "./command-menu"
import { MarketingNav } from "./marketing-nav"
import { SessionProvider } from "./session"
import { SidebarContent } from "./sidebar"
import { Topbar } from "./topbar"

// Full-screen flows render without any chrome.
const BARE_PATHS = ["/auth", "/onboarding"]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ShellLayout>{children}</ShellLayout>
    </SessionProvider>
  )
}

function ShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchKey, setSearchKey] = useState(0)

  const openSearch = useCallback(() => {
    setSearchKey((k) => k + 1)
    setSearchOpen(true)
  }, [])

  // ⌘K / Ctrl K opens the command menu anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchKey((k) => k + 1)
        setSearchOpen((o) => !o)
      }
      if (e.key === "Escape") setDrawerOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const bare = BARE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (bare) return <>{children}</>

  if (pathname === "/") {
    return (
      <>
        <MarketingNav />
        {children}
      </>
    )
  }

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] bg-[#090b16]/85 backdrop-blur-xl lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] border-r border-white/[0.08] bg-[#090b16] lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <button
                type="button"
                autoFocus
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-3 z-10 grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                <X className="size-5" />
              </button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <Topbar onMenu={() => setDrawerOpen(true)} onSearch={openSearch} />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>

      <CommandMenu key={searchKey} open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
