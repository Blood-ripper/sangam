import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const STATUSES = ["applied", "reviewing", "hired", "rejected"] as const

export async function PATCH(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const applicationId = body?.applicationId
  const status = body?.status

  if (
    typeof applicationId !== "string" ||
    typeof status !== "string" ||
    !(STATUSES as readonly string[]).includes(status)
  ) {
    return NextResponse.json(
      { error: "applicationId and a valid status are required" },
      { status: 400 }
    )
  }

  // Defense in depth, not the real enforcement: RLS
  // (applications_update_recruiter_status, 0002_rls.sql) already scopes
  // updates to the recruiter who owns the opportunity, and the
  // enforce_applications_update_scope trigger already limits a
  // recruiter's update to the status column. This check just turns a
  // mismatch into a clean 404 instead of a raw Postgres/RLS error.
  const { data: application } = await supabase
    .from("applications")
    .select("id, opportunity:opportunities(recruiter_id)")
    .eq("id", applicationId)
    .maybeSingle()

  if (!application || application.opportunity?.recruiter_id !== user.id) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (status === "hired") {
    // So /api/hire/confirm has a row to find and update later — it can
    // only update hire_events (RLS), never insert one as the seeker.
    const { data: existingHireEvent } = await supabase
      .from("hire_events")
      .select("id")
      .eq("application_id", applicationId)
      .maybeSingle()

    if (!existingHireEvent) {
      const { error: hireEventError } = await supabase
        .from("hire_events")
        .insert({
          application_id: applicationId,
          claimed_at: new Date().toISOString(),
        })

      if (hireEventError) {
        return NextResponse.json(
          { error: hireEventError.message },
          { status: 500 }
        )
      }
    }

    const recruiterId = application.opportunity?.recruiter_id
    if (recruiterId) {
      // types/supabase.ts hasn't been regenerated for migration 0006 yet,
      // so this RPC name isn't in the typed Functions map. Cast narrowly
      // at the call site rather than hand-edit the generated types file.
      const { error: rpcError } = await (
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
    }
  }

  return NextResponse.json({ application: data })
}
