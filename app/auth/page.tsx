"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
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

    router.push(profile?.name ? "/feed" : "/onboarding")
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
    router.push(profile?.name ? "/feed" : "/onboarding")
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to Sangam</CardTitle>
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
                className="w-full"
                disabled={loading}
                onClick={handleGoogleSignIn}
              >
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
    </main>
  )
}
