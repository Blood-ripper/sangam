import { geminiJSON } from "@/lib/gemini"

export type ScamCheckResult = {
  isScam: boolean
  confidence: number
  flags: string[]
}

export type ScamCheckListing = {
  title?: string | null
  company?: string | null
  description?: string | null
  stipend_text?: string | null
}

/**
 * Flags training/registration-fee requests, UPI payment requests,
 * unrealistic stipends, and missing company details on a listing.
 */
export async function scamCheck(
  listing: ScamCheckListing
): Promise<ScamCheckResult> {
  return geminiJSON<ScamCheckResult>(buildScamCheckPrompt(listing))
}

function buildScamCheckPrompt(listing: ScamCheckListing) {
  return [
    "Assess whether this job/internship listing shows signs of being a scam.",
    `Title: ${listing.title ?? "(not given)"}`,
    `Company: ${listing.company ?? "(not given)"}`,
    `Stipend: ${listing.stipend_text ?? "(not given)"}`,
    `Description: ${listing.description ?? "(not given)"}`,
    "",
    "Specifically check for: requests for a training or registration fee,",
    "requests to pay via UPI, unrealistically high stipends for the stated",
    "role, and missing or vague company details.",
    "",
    "Return a JSON object with exactly these keys:",
    '- "isScam": boolean.',
    '- "confidence": number 0-1.',
    '- "flags": array of short strings, one per issue found (empty if none).',
    "",
    "Respond with JSON only, no other text.",
  ].join("\n")
}
