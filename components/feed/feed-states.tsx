import Link from "next/link"
import type { ReactNode } from "react"
import { Inbox, Lock, RefreshCw, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

function StateCard({
  icon,
  title,
  body,
  action,
  role,
}: {
  icon: ReactNode
  title: string
  body: string
  action?: ReactNode
  role?: "alert"
}) {
  return (
    <div data-slot="card" role={role} className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
        {icon}
      </span>
      <div className="max-w-md">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
      {action}
    </div>
  )
}

export function SignInPrompt() {
  return (
    <StateCard
      icon={<Lock className="size-6 text-violet" aria-hidden="true" />}
      title="Sign in to see your matches"
      body="Sangam ranks every opening against your skills and goal, so it needs to know who you are first."
      action={
        <Button asChild size="lg">
          <Link href="/auth">Sign in</Link>
        </Button>
      }
    />
  )
}

export function FeedError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <StateCard
      role="alert"
      icon={<RefreshCw className="size-6 text-violet" aria-hidden="true" />}
      title="We couldn’t load your feed"
      body={`${message} Check your connection and try again.`}
      action={
        <Button variant="outline" size="lg" onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      }
    />
  )
}

export function NoOpenings() {
  return (
    <StateCard
      icon={<Inbox className="size-6 text-violet" aria-hidden="true" />}
      title="No openings yet"
      body="Add your skills and goal so Sangam can match you as soon as recruiters post new openings."
      action={
        <Button asChild size="lg">
          <Link href="/onboarding">Update my profile</Link>
        </Button>
      }
    />
  )
}

export function NoFilterMatches({ filter, onReset }: { filter: string; onReset: () => void }) {
  return (
    <StateCard
      icon={<SearchX className="size-6 text-violet" aria-hidden="true" />}
      title={`No ${filter.toLowerCase()} openings right now`}
      body="New openings arrive often. Check back soon, or look at everything that matches you."
      action={
        <Button variant="outline" size="lg" onClick={onReset}>
          Show all openings
        </Button>
      }
    />
  )
}
