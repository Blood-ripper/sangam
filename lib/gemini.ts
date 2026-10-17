// Server-side only: uses GEMINI_API_KEY, which must never reach the
// browser. Only import this from Route Handlers, Server Components, or
// Server Actions.
const GEMINI_MODEL = "gemini-2.0-flash-lite"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

async function callGemini(
  prompt: string,
  options: { responseMimeType?: string } = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set")
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      ...(options.responseMimeType && {
        generationConfig: { responseMimeType: options.responseMimeType },
      }),
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gemini request failed (${res.status}): ${body}`)
  }

  const json = await res.json()
  const parts = json?.candidates?.[0]?.content?.parts ?? []
  return parts.map((p: { text?: string }) => p.text ?? "").join("")
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
