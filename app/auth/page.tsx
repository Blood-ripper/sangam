"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Briefcase, GraduationCap, Lightbulb, Users } from "lucide-react"
import { SangamLogo, SangamMark } from "@/components/brand/sangam-logo"
import { OrbitingCircles } from "@/components/magicui/orbiting-circles"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type Step = "email" | "otp"

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password sign-in/sign-up: a secondary path for team testing and demos,
  // where OTP email delivery is rate-limited.
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [pwEmail, setPwEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwNotice, setPwNotice] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    // On success the browser navigates to Google, so there's nothing
    // further to do here. Only an immediate failure reaches this line.
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setStep("otp")
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    })

    if (error || !data.user) {
      setError(error?.message ?? "That code didn't work. Try again.")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.user.id)
      .maybeSingle()

    router.push(profile?.name ? "/dashboard" : "/onboarding")
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPwError(null)
    setPwNotice(null)
    setPwLoading(true)

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: pwEmail,
        password,
      })

      setPwLoading(false)

      if (error) {
        setPwError(error.message)
        return
      }

      if (!data.session) {
        // Email confirmation is still required on this project.
        setPwNotice("Account created — check your email to confirm it before signing in.")
        return
      }

      // Brand-new user: the on_auth_user_created trigger only stubs the
      // profiles row, so there's no name yet. Always onboard.
      router.push("/onboarding")
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: pwEmail,
      password,
    })

    if (error || !data.user) {
      setPwError(error?.message ?? "Could not sign in.")
      setPwLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", data.user.id)
      .maybeSingle()

    setPwLoading(false)
    router.push(profile?.name ? "/dashboard" : "/onboarding")
  }

  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] p-10 lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="animate-aurora pointer-events-none absolute -inset-1/4 bg-[radial-gradient(40%_35%_at_30%_30%,rgb(77_102_233/0.22),transparent_70%),radial-gradient(35%_30%_at_70%_60%,rgb(36_176_127/0.16),transparent_70%),radial-gradient(30%_30%_at_40%_80%,rgb(232_158_49/0.14),transparent_70%)]"
        />
        <Link href="/" className="relative w-fit" aria-label="Sangam home">
          <SangamLogo size={34} />
        </Link>

        <div className="relative flex h-[440px] items-center justify-center">
          <OrbitingCircles radius={170} duration={36} iconSize={46}>
            {[Briefcase, Lightbulb, GraduationCap, Users].map((Icon, i) => (
              <span key={i} className="glass grid size-full place-items-center rounded-2xl text-foreground">
                <Icon className="size-5" />
              </span>
            ))}
          </OrbitingCircles>
          <OrbitingCircles radius={100} duration={22} iconSize={14} reverse path>
            {["#4d66e9", "#e89e31", "#24b07f"].map((c) => (
              <span key={c} className="size-full rounded-full" style={{ background: c, boxShadow: `0 0 16px ${c}` }} />
            ))}
          </OrbitingCircles>
          <SangamMark size={120} animated />
        </div>

        <div className="relative max-w-md">
          <p className="text-3xl leading-tight font-bold tracking-tight text-foreground">
            Where talent, ideas and opportunities meet.
          </p>
          <p className="text-gradient-accent mt-1 text-3xl leading-tight font-bold tracking-tight">Proof, not promises.</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Recruiters are scored on hires that candidates confirm. Ideas are tested by the community. Every
            student gets a free path to the skills openings ask for.
          </p>
        </div>
      </section>

      <div className="flex items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link href="/" className="mb-3 w-fit lg:hidden" aria-label="Sangam home">
            <SangamLogo size={30} />
          </Link>
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in to Sangam</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Continue with Google, or get a one-time code by email."
              : `Enter the 6-digit code we sent to ${email}.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          {step === "email" ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-2.5 text-sm font-semibold"
                disabled={loading}
                onClick={handleGoogleSignIn}
              >
                <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
                  <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.57-5.15 3.57-8.81Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3A7.16 7.16 0 0 1 12 19.25a7.17 7.17 0 0 1-6.73-4.95h-4v3.09A12 12 0 0 0 12 24Z" />
                  <path fill="#FBBC05" d="M5.27 14.3a7.2 7.2 0 0 1 0-4.6V6.61h-4a12 12 0 0 0 0 10.78l4-3.09Z" />
                  <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4 3.09A7.17 7.17 0 0 1 12 4.75Z" />
                </svg>
                Continue with Google
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <form className="flex flex-col gap-3" onSubmit={handleSendOtp}>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Send code
                </Button>
              </form>

              <Collapsible open={showPassword} onOpenChange={setShowPassword}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto self-center px-0 text-xs text-muted-foreground"
                  >
                    {showPassword ? "Hide" : "Sign in with password"}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <form
                    className="flex flex-col gap-3 border-t pt-3"
                    onSubmit={handlePasswordSubmit}
                  >
                    <p className="text-xs text-muted-foreground">
                      For team testing — OTP email delivery is rate-limited.
                    </p>

                    {pwError && (
                      <p className="text-sm text-destructive" role="alert">
                        {pwError}
                      </p>
                    )}
                    {pwNotice && (
                      <p className="text-sm text-muted-foreground">{pwNotice}</p>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pw-email" className="text-xs">
                        Email
                      </Label>
                      <Input
                        id="pw-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={pwEmail}
                        onChange={(e) => setPwEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pw-password" className="text-xs">
                        Password
                      </Label>
                      <Input
                        id="pw-password"
                        type="password"
                        required
                        minLength={6}
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full"
                      disabled={pwLoading}
                    >
                      {isSignUp ? "Create account" : "Sign in"}
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto self-center px-0 text-xs text-muted-foreground"
                      disabled={pwLoading}
                      onClick={() => {
                        setIsSignUp((v) => !v)
                        setPwError(null)
                        setPwNotice(null)
                      }}
                    >
                      {isSignUp
                        ? "Already have an account? Sign in"
                        : "New here? Sign up"}
                    </Button>
                  </form>
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : (
            <form
              className="flex flex-col items-center gap-4"
              onSubmit={handleVerifyOtp}
            >
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={loading}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || otp.length < 6}
              >
                Verify
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={loading}
                onClick={() => {
                  setStep("email")
                  setOtp("")
                  setError(null)
                }}
              >
                Use a different email
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Sangam connects verified job seekers, founders, startups,
            mentors, and recruiters.
          </p>
        </CardFooter>
      </Card>
      </div>
    </main>
  )
}
