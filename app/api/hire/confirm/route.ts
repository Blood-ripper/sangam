import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const applicationId = body?.applicationId

  if (typeof applicationId !== "string") {
    return NextResponse.json(
      { error: "applicationId is required" },
      { status: 400 }
    )
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select("id, seeker_id, status, opportunity:opportunities(recruiter_id)")
    .eq("id", applicationId)
    .maybeSingle()

  if (applicationError) {
    return NextResponse.json(
      { error: applicationError.message },
      { status: 500 }
    )
  }

  if (!application || application.seeker_id !== user.id) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    )
  }

  if (application.status !== "hired") {
    return NextResponse.json(
      { error: "Application is not marked hired yet" },
      { status: 409 }
    )
  }

  const recruiterId = application.opportunity?.recruiter_id
  if (!recruiterId) {
    return NextResponse.json(
      { error: "Recruiter not found for this opportunity" },
      { status: 500 }
    )
  }

  const confirmedAt = new Date().toISOString()

  const { error: updateApplicationError } = await supabase
    .from("applications")
    .update({ hire_confirmed: true, confirmed_at: confirmedAt })
    .eq("id", applicationId)

  if (updateApplicationError) {
    return NextResponse.json(
      { error: updateApplicationError.message },
      { status: 500 }
    )
  }

  const { data: hireEvent, error: hireEventError } = await supabase
    .from("hire_events")
    .update({ confirmed_at: confirmedAt })
    .eq("application_id", applicationId)
    .select("id")
    .maybeSingle()

  if (hireEventError) {
    return NextResponse.json({ error: hireEventError.message }, { status: 500 })
  }

  if (!hireEvent) {
    return NextResponse.json(
      { error: "No hire event found for this application yet" },
      { status: 409 }
    )
  }

  // types/supabase.ts hasn't been regenerated for migration 0006 yet (no
  // `supabase db push` has run), so this RPC name isn't in the typed
  // Functions map. Cast narrowly at the call site rather than hand-edit
  // the generated types file.
  const { data: score, error: rpcError } = await (
    supabase as unknown as {
      rpc: (
        fn: "recalc_hire_proof",
        args: { recruiter: string }
      ) => Promise<{ data: number | null; error: { message: string } | null }>
    }
  ).rpc("recalc_hire_proof", { recruiter: recruiterId })

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 })
  }

  return NextResponse.json({ score })
}
