import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { buildAnalysisSystemPrompt } from "@/lib/local-ai/analysis-context"
import { sendLocalAiChat, type ChatMessage } from "@/lib/local-ai/chat"
import {
  getLocalAiEngine,
  setModelLoadProgressListener,
  type LocalAiEngine,
} from "@/lib/local-ai/engine"
import type { AnalysisSet, Domain } from "@/types/model"

export type AssessmentAiStatus = "idle" | "loading-model" | "ready" | "thinking" | "error"

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  }
}

export function useAssessmentAi({
  analysis,
  selectedDomain,
  language,
  enabled,
}: {
  analysis: AnalysisSet
  selectedDomain: Domain | null
  language: "en" | "nl"
  enabled: boolean
}) {
  const [status, setStatus] = useState<AssessmentAiStatus>("idle")
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadMessage, setLoadMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const engineRef = useRef<LocalAiEngine | null>(null)

  const systemPrompt = useMemo(
    () => buildAnalysisSystemPrompt(analysis, selectedDomain, language),
    [analysis, selectedDomain, language],
  )

  useEffect(() => {
    if (!enabled) {
      setModelLoadProgressListener(null)
      return
    }

    if (engineRef.current) {
      setStatus("ready")
      setLoadProgress(1)
      setError(null)
      return
    }

    let cancelled = false
    setStatus("loading-model")
    setError(null)
    setLoadProgress(0)
    setLoadMessage("")

    setModelLoadProgressListener((progress) => {
      if (cancelled) return
      setLoadProgress(progress.progress)
      setLoadMessage(progress.text)
    })

    getLocalAiEngine()
      .then((engine) => {
        if (cancelled) return
        engineRef.current = engine
        setStatus("ready")
        setLoadProgress(1)
      })
      .catch((caught) => {
        if (cancelled) return
        setStatus("error")
        setError(caught instanceof Error ? caught.message : "Failed to load local model.")
      })

    return () => {
      cancelled = true
      setModelLoadProgressListener(null)
    }
  }, [enabled])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || status === "loading-model" || status === "thinking") return

      setError(null)
      setStatus("thinking")

      const userMessage = createMessage("user", trimmed)
      setMessages((current) => [...current, userMessage])

      try {
        const engine = engineRef.current ?? (await getLocalAiEngine())
        engineRef.current = engine

        const { reply } = await sendLocalAiChat({
          engine,
          systemPrompt,
          messages,
          userMessage: trimmed,
        })

        setMessages((current) => [...current, createMessage("assistant", reply)])
        setStatus("ready")
      } catch (caught) {
        setStatus(engineRef.current ? "ready" : "error")
        setError(caught instanceof Error ? caught.message : "Failed to generate a response.")
      }
    },
    [messages, status, systemPrompt],
  )

  return {
    status,
    loadProgress,
    loadMessage,
    error,
    messages,
    sendMessage,
    isModelLoading: status === "loading-model",
    isThinking: status === "thinking",
    isReady: status === "ready" || status === "thinking",
  }
}
