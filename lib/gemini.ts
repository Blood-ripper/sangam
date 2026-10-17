// Server-side only: uses GEMINI_API_KEY, which must never reach the
// browser. Only import this from Route Handlers, Server Components, or
// Server Actions.
const GEMINI_MODEL = "gemini-2.0-flash-lite"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// The free tier can rate-limit or hang during a live demo, so every call
// gets a hard timeout and one retry before giving up — callers (feed,
// skill-gap, idea-critique, scam-check) are responsible for falling back
// to a sensible default instead of surfacing a 500.
const GEMINI_TIMEOUT_MS = 10_000
const GEMINI_MAX_ATTEMPTS = 2

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function callGemini(
  prompt: string,
  options: { responseMimeType?: string } = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set")
  }

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    ...(options.responseMimeType && {
      generationConfig: { responseMimeType: options.responseMimeType },
    }),
  })

  let lastError: unknown

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${GEMINI_URL}?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
        GEMINI_TIMEOUT_MS
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Gemini request failed (${res.status}): ${text}`)
      }

      const json = await res.json()
      const parts = json?.candidates?.[0]?.content?.parts ?? []
      return parts.map((p: { text?: string }) => p.text ?? "").join("")
    } catch (error) {
      lastError = error
      console.error(
        `[gemini] attempt ${attempt}/${GEMINI_MAX_ATTEMPTS} failed:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini request failed")
}

/** POSTs `prompt` to Gemini and returns the plain text response. */
export async function gemini(prompt: string): Promise<string> {
  return callGemini(prompt)
}

/**
 * Like `gemini()`, but asks the model for JSON output (via
 * `generationConfig.responseMimeType`) and parses it as `T`.
 */
export async function geminiJSON<T>(prompt: string): Promise<T> {
  const text = await callGemini(prompt, {
    responseMimeType: "application/json",
  })

  try {
    return JSON.parse(text) as T
  } catch (cause) {
    throw new Error(
      `Gemini did not return valid JSON: ${text.slice(0, 500)}`,
      { cause }
    )
  }
}
