export const DEFAULT_WEB_LLM_MODEL = "Qwen2.5-7B-Instruct-q4f16_1-MLC"

export type LocalAiEngine = {
  chat: {
    completions: {
      create: (request: {
        messages: Array<{ role: "system" | "user" | "assistant"; content: string }>
        temperature?: number
      }) => Promise<{
        choices?: Array<{
          message?: {
            content?: string | Array<{ text?: string }>
          }
        }>
      }>
    }
  }
}

export type ModelLoadProgress = {
  text: string
  progress: number
}

let enginePromise: Promise<LocalAiEngine> | null = null
let progressListener: ((progress: ModelLoadProgress) => void) | null = null

export function setModelLoadProgressListener(
  listener: ((progress: ModelLoadProgress) => void) | null,
) {
  progressListener = listener
}

export function resetLocalAiEngine() {
  enginePromise = null
}

export async function getLocalAiEngine(): Promise<LocalAiEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm")
      return CreateMLCEngine(DEFAULT_WEB_LLM_MODEL, {
        initProgressCallback: (report) => {
          const payload = report as { text?: string; progress?: number }
          progressListener?.({
            text: payload.text ?? "Loading model...",
            progress: payload.progress ?? 0,
          })
        },
      }) as Promise<LocalAiEngine>
    })()
  }

  return enginePromise
}

export function extractAssistantContent(
  content: string | Array<{ text?: string }> | undefined,
): string {
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    return content.map((part) => part.text ?? "").join("")
  }
  return ""
}
