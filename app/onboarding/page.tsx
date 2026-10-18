"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { TablesInsert } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Role = "seeker" | "founder" | "mentor" | "recruiter"

const SKILL_PRESETS = [
  "React",
  "TypeScript",
  "Python",
  "Node",
  "UI/UX",
  "ML",
  "SQL",
  "Marketing",
]

const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "seeker",
    label: "Job seeker",
    description: "Looking for roles, internships, or gigs.",
  },
  {
    value: "founder",
    label: "Founder",
    description: "Building a startup and testing ideas.",
  },
  {
    value: "mentor",
    label: "Mentor",
    description: "Guiding seekers and founders.",
  },
  {
    value: "recruiter",
    label: "Recruiter",
    description: "Hiring for roles and internships.",
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")

  // Step 2
  const [university, setUniversity] = useState("")
  const [college, setCollege] = useState("")
  const [course, setCourse] = useState("")
  const [year, setYear] = useState("")

  // Step 3
  const [skills, setSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState("")
  const [goal, setGoal] = useState("")
  const [role, setRole] = useState<Role | null>(null)
  const [dpdpConsent, setDpdpConsent] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/auth")
        return
      }
      setUserId(data.user.id)
    })
  }, [router, supabase])

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

  const customSkills = skills.filter((s) => !SKILL_PRESETS.includes(s))
  const canContinueStep1 = name.trim().length > 0
  const canSubmit = Boolean(role) && dpdpConsent && Boolean(userId) && !saving

  async function handleSubmit() {
    if (!userId || !role || !dpdpConsent) return

    setSaving(true)
    setError(null)

    const payload: TablesInsert<"profiles"> = {
      id: userId,
      name: name.trim(),
      age: age ? Number(age) : null,
      gender: gender.trim() || null,
      university: university.trim() || null,
      college: college.trim() || null,
      course: course.trim() || null,
      year: year ? Number(year) : null,
      skills: skills.length ? skills : null,
      goal: goal.trim() || null,
      role,
      dpdp_consent: dpdpConsent,
    }

    const { error } = await supabase.from("profiles").upsert(payload)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push("/dashboard")
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set up your profile ({step}/3)</CardTitle>
          <CardDescription>
            {step === 1 && "Tell us who you are."}
            {step === 2 && "Where do you study?"}
            {step === 3 && "Skills, goals, and how you'll use Sangam."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={0}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min={1}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col gap-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-1.5">
                  {[...SKILL_PRESETS, ...customSkills].map((skill) => {
                    const selected = skills.includes(skill)
                    return (
                      <Badge
                        key={skill}
                        asChild
                        variant={selected ? "default" : "outline"}
                      >
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="goal">Goal</Label>
                <Input
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="What are you here to do?"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>I am a...</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <Card
                      key={r.value}
                      role="button"
                      tabIndex={0}
                      onClick={() => setRole(r.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          setRole(r.value)
                        }
                      }}
                      size="sm"
                      className={cn(
                        "cursor-pointer gap-1 ring-1 ring-foreground/10 transition-colors",
                        role === r.value && "ring-2 ring-primary"
                      )}
                    >
                      <CardContent className="flex flex-col gap-0.5">
                        <span className="font-medium">{r.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.description}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="dpdp"
                  checked={dpdpConsent}
                  onCheckedChange={(checked) => setDpdpConsent(checked === true)}
                />
                <Label htmlFor="dpdp" className="font-normal text-muted-foreground">
                  I consent to Sangam processing my personal data in accordance
                  with the Digital Personal Data Protection (DPDP) Act.
                </Label>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 1}
            onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2) : s))}
          >
            Back
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              disabled={step === 1 && !canContinueStep1}
              onClick={() => setStep((s) => (s < 3 ? ((s + 1) as 2 | 3) : s))}
            >
              Next
            </Button>
          ) : (
            <Button type="button" disabled={!canSubmit} onClick={handleSubmit}>
              {saving ? "Saving..." : "Finish"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  )
}
