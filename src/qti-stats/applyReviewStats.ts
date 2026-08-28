import { deepQuerySelectorAll } from "./utils"
import {
  buildDistinctResponses,
  buildStatPayload,
  findStatForChoice,
  isCorrectChoiceForInteraction,
  totalCountForInteraction,
} from "./reviewStatsModel"

import type { ChoiceStatRow, StatResponse, StatsApplyRoot } from "./reviewStatsModel"

export type { ChoiceStatRow, StatResponse } from "./reviewStatsModel"

type ApplyOptions = Readonly<{
  responses: ChoiceStatRow[]
  totalCount: number
  correctAnswer?: string | null
}>

type ChoiceOptionStatsElement = HTMLElement & {
  statCount?: number
  statTotalCount?: number
  statIsCorrect?: boolean
  statTooltip?: string
}

type DistinctResponsesElement = HTMLElement & {
  distinctResponses?: StatResponse[]
  resetStats?: () => void
}

type CorrectResponseInteraction = HTMLElement & {
  toggleCorrectResponse?: (show: boolean) => void
}

const DISTINCT_RESPONSE_INTERACTION_TAGS = [
  "qti-extended-text-interaction-stats",
  "qti-text-entry-interaction-stats",
]

function interactionResponseIdOf(element: Element | null) {
  return element?.getAttribute("response-identifier")?.trim() ?? null
}

function applyChoiceOptionStats(root: StatsApplyRoot, options: ApplyOptions) {
  const { responses, totalCount, correctAnswer } = options

  deepQuerySelectorAll(root, "qti-simple-choice-stats").forEach((element) => {
    const choice = element as ChoiceOptionStatsElement
    const identifier = choice.getAttribute("identifier")
    if (!identifier) return

    const interaction = choice.closest("qti-choice-interaction-stats")
    const interactionResponseId = interactionResponseIdOf(interaction)
    const interactionTotalCount = totalCountForInteraction(
      responses,
      interactionResponseId,
      totalCount,
    )

    if (interactionTotalCount <= 0) {
      choice.statCount = 0
      choice.statTotalCount = 0
      choice.statIsCorrect = false
      choice.statTooltip = ""
      choice.title = ""
      return
    }

    const stat = findStatForChoice(responses, identifier, interactionResponseId)
    const count = stat?.count ?? 0
    const isCorrect = isCorrectChoiceForInteraction(
      stat?.value ?? null,
      identifier,
      correctAnswer,
      stat?.score,
    )
    const payload = buildStatPayload(count, interactionTotalCount, isCorrect)

    choice.statCount = payload.count
    choice.statTotalCount = payload.totalCount
    choice.statIsCorrect = payload.isCorrect
    choice.statTooltip = payload.tooltip
    choice.title = payload.tooltip
  })
}

function applyDistinctResponseInteractions(root: StatsApplyRoot, options: ApplyOptions) {
  const { responses, totalCount, correctAnswer } = options

  deepQuerySelectorAll(
    root,
    DISTINCT_RESPONSE_INTERACTION_TAGS.join(", "),
  ).forEach((element) => {
    const interaction = element as DistinctResponsesElement
    const interactionResponseId = interactionResponseIdOf(interaction)
    const interactionTotalCount = totalCountForInteraction(
      responses,
      interactionResponseId,
      totalCount,
    )

    const distinct = buildDistinctResponses(
      responses,
      interactionResponseId,
      interactionTotalCount,
      correctAnswer,
    )

    if (distinct.length === 0) {
      interaction.resetStats?.()
      interaction.distinctResponses = []
      return
    }

    interaction.distinctResponses = distinct
  })
}

export function applyReviewStats(root: StatsApplyRoot, options: ApplyOptions) {
  applyChoiceOptionStats(root, options)
  applyDistinctResponseInteractions(root, options)

  deepQuerySelectorAll(root, "qti-choice-interaction-stats").forEach(
    (interaction) => {
      ;(interaction as CorrectResponseInteraction).toggleCorrectResponse?.(true)
    },
  )
}
