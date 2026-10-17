import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
    </main>
  )
}
