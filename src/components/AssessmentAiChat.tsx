import { useEffect, useRef, useState } from "react"
import { Loader2, SendHorizontal, Sparkles, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMarkdown } from "@/components/ChatMarkdown"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAssessmentAi } from "@/hooks/use-assessment-ai"
import { ASSESSMENT_AI_PROMPT_IDS } from "@/lib/local-ai/example-prompts"
import { useTranslation } from "@/i18n/use-translation"
import type { AnalysisSet, Domain } from "@/types/model"
import { cn } from "@/lib/utils"

interface AssessmentAiChatProps {
  analysis: AnalysisSet
  selectedDomain: Domain | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AssessmentAiBetaWarning({ className }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-amber-600 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-amber-400 dark:hover:bg-amber-950/40",
              className,
            )}
            aria-label={t("ASSESSMENT_AI_BETA_WARNING_LABEL")}
          />
        }
      >
        <TriangleAlert className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        className="max-w-sm px-3 py-2 text-left whitespace-normal"
      >
        <p className="font-medium">{t("ASSESSMENT_AI_BETA_TITLE")}</p>
        <p className="mt-1 text-background/90">{t("ASSESSMENT_AI_BETA_TOOLTIP")}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function AssessmentAiChat({
  analysis,
  selectedDomain,
  open,
  onOpenChange,
}: AssessmentAiChatProps) {
  const { t, language } = useTranslation()
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)
  const messageCountRef = useRef(0)
  const {
    loadProgress,
    loadMessage,
    error,
    messages,
    sendMessage,
    isModelLoading,
    isThinking,
    isReady,
  } = useAssessmentAi({
    analysis,
    selectedDomain,
    language,
    enabled: open,
  })

  useEffect(() => {
    const shouldScroll =
      messages.length > messageCountRef.current || isThinking
    messageCountRef.current = messages.length

    if (shouldScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isThinking])

  const handleSend = async () => {
    const value = draft
    setDraft("")
    await sendMessage(value)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-svh max-h-svh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b px-4 py-4 pr-12">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <SheetTitle className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("ASSESSMENT_AI_TITLE")}
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {t("ASSESSMENT_AI_BETA_BADGE")}
                </span>
              </SheetTitle>
              <SheetDescription>{t("ASSESSMENT_AI_DESCRIPTION")}</SheetDescription>
            </div>
            <AssessmentAiBetaWarning />
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {isModelLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="space-y-2">
                <p className="font-medium">{t("ASSESSMENT_AI_LOADING_TITLE")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("ASSESSMENT_AI_LOADING_HINT")}
                </p>
                {loadMessage ? (
                  <p className="text-xs text-muted-foreground">{loadMessage}</p>
                ) : null}
              </div>
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.round(loadProgress * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(loadProgress * 100)}%
              </p>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {t("ASSESSMENT_AI_EMPTY")}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {t("ASSESSMENT_AI_EXAMPLES_TITLE")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ASSESSMENT_AI_PROMPT_IDS.map((promptId) => (
                            <Button
                              key={promptId}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-auto whitespace-normal text-left"
                              disabled={!isReady || isThinking}
                              onClick={() => void sendMessage(t(promptId))}
                            >
                              {t(promptId)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        message.role === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {message.role === "user" ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <ChatMarkdown content={message.content} />
                      )}
                    </div>
                  ))}

                  {isThinking ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("ASSESSMENT_AI_THINKING")}
                    </div>
                  ) : null}

                  {error ? (
                    <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  ) : null}

                  <div ref={bottomRef} />
                </div>
              </div>

              {messages.length > 0 ? (
                <div className="shrink-0 border-t px-4 py-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("ASSESSMENT_AI_EXAMPLES_TITLE")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ASSESSMENT_AI_PROMPT_IDS.map((promptId) => (
                      <Button
                        key={promptId}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-auto whitespace-normal text-left"
                        disabled={!isReady || isThinking}
                        onClick={() => void sendMessage(t(promptId))}
                      >
                        {t(promptId)}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="shrink-0 border-t p-4">
                <form
                  className="flex items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleSend()
                  }}
                >
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={t("ASSESSMENT_AI_INPUT_PLACEHOLDER")}
                    rows={3}
                    disabled={!isReady || isThinking}
                    className="min-h-20 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!draft.trim() || !isReady || isThinking}
                    aria-label={t("ASSESSMENT_AI_SEND")}
                  >
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AssessmentAiChatButton({
  onClick,
}: {
  onClick: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" onClick={onClick}>
        <Sparkles className="mr-2 h-4 w-4" />
        {t("ASSESSMENT_AI_BUTTON")}
        <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {t("ASSESSMENT_AI_BETA_BADGE")}
        </span>
      </Button>
      <AssessmentAiBetaWarning />
    </div>
  )
}
