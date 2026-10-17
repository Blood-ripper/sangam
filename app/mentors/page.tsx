import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function MentorsPage() {
  const supabase = await createClient()

  const { data: mentors } = await supabase
    .from("profiles")
    .select("id, name, college, skills, goal")
    .eq("role", "mentor")
    .order("name")

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Mentors</h1>

      {!mentors || mentors.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No mentors have joined yet — check back soon, or be the first to
          sign up as one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {mentors.map((mentor) => (
            <Card key={mentor.id}>
              <CardHeader>
                <CardTitle>{mentor.name ?? "Unnamed mentor"}</CardTitle>
                {mentor.college && <CardDescription>{mentor.college}</CardDescription>}
              </CardHeader>

              <CardContent className="flex flex-col gap-2">
                {mentor.skills && mentor.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
                {mentor.goal && (
                  <p className="text-sm text-muted-foreground">{mentor.goal}</p>
                )}
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <a
                    href={`https://meet.jit.si/sangam-${mentor.id.slice(0, 8)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book a call
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/feed">Ask in Q&amp;A</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
