import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-40 w-full" />
    </main>
  )
}
