// Server-side only: loads a local ONNX model via @xenova/transformers.
// Never import this from a Client Component — it pulls in Node-only
// native bindings (onnxruntime-node) that can't run in the browser.
import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers"

const MODEL = "Xenova/all-MiniLM-L6-v2" // 384-dim sentence embeddings

// Cached at module scope so the model is loaded once per server process
// instead of on every call.
let extractorPromise: Promise<FeatureExtractionPipeline> | null = null

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL) as Promise<
      FeatureExtractionPipeline
    >
  }
  return extractorPromise
}

export async function embed(text: string): Promise<number[]> {
  const extractor = await getExtractor()
  const output = await extractor(text, { pooling: "mean", normalize: true })
  return Array.from(output.data as Float32Array)
}

// pgvector (and the `vector` function params in 0004_match_fn.sql) take
// text in bracket-vector literal form, e.g. "[0.1,-0.2,...]" — this is
// also how @supabase/supabase-js serializes a `vector` column (see
// opportunities.embedding in types/supabase.ts, typed `string | null`).
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`
}
