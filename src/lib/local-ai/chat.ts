import {
  extractAssistantContent,
  getLocalAiEngine,
  type LocalAiEngine,
} from "./engine"

export type ChatRole = "user" | "assistant"

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
}

export async function sendLocalAiChat({
  engine,
  systemPrompt,
  messages,
  userMessage,
}: {
  engine?: LocalAiEngine
  systemPrompt: string
  messages: ChatMessage[]
  userMessage: string
}): Promise<{ engine: LocalAiEngine; reply: string }> {
  const activeEngine = engine ?? (await getLocalAiEngine())
  const response = await activeEngine.chat.completions.create({
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: "user", content: userMessage },
    ],
  })

  const reply = extractAssistantContent(response.choices?.[0]?.message?.content).trim()
  if (!reply) {
    throw new Error("The local model returned an empty response.")
  }

  return { engine: activeEngine, reply }
}
