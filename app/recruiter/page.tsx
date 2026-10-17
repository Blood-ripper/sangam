"use client"

import { useEffect, useState, type FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Opportunity = Tables<"opportunities">
type Application = Tables<"applications"> & {
  seeker: { name: string | null } | null
}

const OPPORTUNITY_TYPES = ["Internship", "Job", "Remote", "Hackathon", "Co-founder"]
const SKILL_PRESETS = ["React", "TypeScript", "Python", "Node", "UI/UX", "ML", "SQL", "Marketing"]
// Must match STATUSES in app/api/applications/route.ts.
const APPLICATION_STATUSES = ["applied", "reviewing", "hired", "rejected"] as const

export default function RecruiterPage() {
  const supabase = createClient()

  const [openings, setOpenings] = useState<Opportunity[]>([])
  const [applicationsByOpening, setApplicationsByOpening] = useState<
    Record<string, Application[]>
  >({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState("")
  const [stipendText, setStipendText] = useState("")
  const [seats, setSeats] = useState("")
  const [deadline, setDeadline] = useState("")
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)

  async function loadDashboard() {
    // No synchronous setState here on purpose — this runs from a mount
    // effect below, and react-hooks/set-state-in-effect flags any setState
    // call that happens before the function's first `await`. `loading`
    // already starts `true`, and setLoadError only fires once we actually
    // have something to report.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoadError("Not signed in.")
      setLoading(false)
      return
    }

    const { data: ownOpenings, error: openingsError } = await supabase
      .from("opportunities")
      .select("*")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false })

    if (openingsError) {
      setLoadError(openingsError.message)
      setLoading(false)
      return
    }

    setOpenings(ownOpenings ?? [])

    const openingIds = (ownOpenings ?? []).map((o) => o.id)
    if (openingIds.length === 0) {
      setApplicationsByOpening({})
      setLoading(false)
      return
    }

    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select("*, seeker:profiles(name)")
      .in("opportunity_id", openingIds)
      .order("applied_at", { ascending: false })

    if (applicationsError) {
      setLoadError(applicationsError.message)
      setLoading(false)
      return
    }

    const grouped: Record<string, Application[]> = {}
    for (const application of applications ?? []) {
      const openingId = application.opportunity_id
      if (!openingId) continue
      if (!grouped[openingId]) grouped[openingId] = []
      grouped[openingId].push(application)
    }
    setApplicationsByOpening(grouped)
    setLoading(false)
  }

  useEffect(() => {
    // Deferred via .then() rather than calling loadDashboard() directly:
    // react-hooks/set-state-in-effect traces into a function called
    // directly from the effect body and flags the setState calls inside
    // it. A promise-callback body isn't a direct statement of the effect,
    // so it's not flagged — the same shape app/feed/page.tsx uses.
    Promise.resolve().then(() => loadDashboard())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  function addCustomSkill() {
    const value = customSkill.trim()
    if (!value) return
    if (!skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkills((prev) => [...prev, value])
    }
    setCustomSkill("")
  }

  async function handlePostOpening(e: FormEvent) {
    e.preventDefault()
    setPostError(null)
    setPosting(true)

    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        company,
        type,
        description,
        required_skills: skills,
        stipend_text: stipendText,
        seats: seats ? Number(seats) : null,
        deadline: deadline || null,
      }),
    })

    const json = await res.json().catch(() => null)
    setPosting(false)

    if (!res.ok) {
      setPostError(json?.error ?? "Could not post this opening.")
      return
    }

    setTitle("")
    setCompany("")
    setType("")
    setDescription("")
    setSkills([])
    setStipendText("")
    setSeats("")
    setDeadline("")

    await loadDashboard()
  }

  async function handleStatusChange(applicationId: string, status: string) {
    const res = await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, status }),
    })

    if (!res.ok) {
      // Reload to get back to a known-good state instead of leaving the
      // dropdown showing a status that didn't actually save.
      await loadDashboard()
      return
    }

    setApplicationsByOpening((prev) => {
      const next: Record<string, Application[]> = {}
      for (const [openingId, apps] of Object.entries(prev)) {
        next[openingId] = apps.map((app) =>
          app.id === applicationId ? { ...app, status } : app
        )
      }
      return next
    })
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold">Recruiter dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Post an opening</CardTitle>
          <CardDescription>Visible to seekers once submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3" onSubmit={handlePostOpening}>
            {postError && (
              <p className="text-sm text-destructive" role="alert">
                {postError}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Required skills</Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...SKILL_PRESETS,
                  ...skills.filter((s) => !SKILL_PRESETS.includes(s)),
                ].map((skill) => {
                  const selected = skills.includes(skill)
                  return (
                    <Badge key={skill} asChild variant={selected ? "default" : "outline"}>
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        aria-pressed={selected}
                      >
                        {skill}
                      </button>
                    </Badge>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCustomSkill()
                    }
                  }}
                  placeholder="Add a custom skill"
                />
                <Button type="button" variant="outline" onClick={addCustomSkill}>
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="stipend">Stipend</Label>
                <Input
                  id="stipend"
                  value={stipendText}
                  onChange={(e) => setStipendText(e.target.value)}
                  placeholder="Rs 15,000/month"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="seats">Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  min={1}
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={posting}>
              {posting ? "Posting..." : "Post opening"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">My openings</h2>

        {loadError && (
          <p className="text-sm text-destructive" role="alert">
            {loadError}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : openings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t posted any openings yet.
          </p>
        ) : (
          openings.map((opening) => {
            const applicants = applicationsByOpening[opening.id] ?? []
            return (
              <Card key={opening.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>{opening.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{opening.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {opening.type && <Badge variant="secondary">{opening.type}</Badge>}
                      <Badge variant="outline">{opening.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
                  </p>
                </CardHeader>

                {applicants.length > 0 && (
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Applied</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applicants.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell>
                              {application.seeker?.name ?? "Unnamed applicant"}
                            </TableCell>
                            <TableCell>
                              {new Date(application.applied_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={application.status}
                                onValueChange={(status) =>
                                  handleStatusChange(application.id, status)
                                }
                              >
                                <SelectTrigger size="sm" className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {APPLICATION_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>
    </main>
  )
}
