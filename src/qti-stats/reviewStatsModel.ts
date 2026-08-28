import {
  isChoiceInCorrectAnswer,
  matchesCorrectAnswer,
  statValueMatchesChoiceIdentifier,
} from "./responseAnswerMatching"

export type ChoiceStatRow = {
  value?: string | null
  count?: number | null
  score?: number | null
  responseIdentifier?: string | null
}

export type StatResponse = {
  value: string
  count: number
  percentage: number
  isCorrect: boolean
  tooltip: string
}

export type StatsApplyRoot = DocumentFragment | Element | ShadowRoot

export function buildStatTooltip(
  count: number,
  totalCount: number,
  pct: number,
  isCorrect: boolean,
) {
  return `${count} of ${totalCount} (${pct.toFixed(0)}%)${isCorrect ? " - correct" : ""}`
}

export function buildStatPayload(
  count: number,
  totalCount: number,
  isCorrect: boolean,
) {
  const pct =
    totalCount > 0 ? Math.min(100, Math.max(0, (count / totalCount) * 100)) : 0
  return {
    count,
    totalCount,
    pct,
    isCorrect,
    tooltip: buildStatTooltip(count, totalCount, pct, isCorrect),
  }
}

function responseIdentifierMatches(
  interactionResponseId: string | null,
  rowResponseId: string | null | undefined,
) {
  if (!interactionResponseId) return true
  const rowId = rowResponseId?.trim()
  if (!rowId) return true
  return rowId === interactionResponseId
}

export function findStatForChoice(
  responses: ChoiceStatRow[],
  choiceIdentifier: string,
  interactionResponseId: string | null,
) {
  return responses.find(
    (row) =>
      responseIdentifierMatches(interactionResponseId, row.responseIdentifier) &&
      statValueMatchesChoiceIdentifier(row.value, choiceIdentifier),
  )
}

export function statsRowsForInteraction(
  responses: ChoiceStatRow[],
  interactionResponseId: string | null,
) {
  return responses.filter((row) =>
    responseIdentifierMatches(interactionResponseId, row.responseIdentifier),
  )
}

export function totalCountForInteraction(
  responses: ChoiceStatRow[],
  interactionResponseId: string | null,
  fallbackTotalCount: number,
) {
  const scoped = statsRowsForInteraction(responses, interactionResponseId)
  const fromRows = scoped.reduce((sum, row) => sum + (row.count ?? 0), 0)
  if (fromRows <= 0) return fallbackTotalCount
  return Math.max(fromRows, fallbackTotalCount)
}

export function isCorrectChoiceForInteraction(
  choiceValue: string | null | undefined,
  choiceIdentifier: string,
  correctAnswer: string | null | undefined,
  score?: number | null,
) {
  if ((score ?? 0) > 0) return true
  return (
    statValueMatchesChoiceIdentifier(choiceValue, correctAnswer) ||
    isChoiceInCorrectAnswer(choiceIdentifier, correctAnswer) ||
    matchesCorrectAnswer(choiceValue ?? null, correctAnswer)
  )
}

export function totalCountFromChoiceStats(responses: ChoiceStatRow[]) {
  return responses.reduce((sum, row) => sum + (row.count ?? 0), 0)
}

export function buildDistinctResponses(
  responses: ChoiceStatRow[],
  interactionResponseId: string | null,
  interactionTotalCount: number,
  correctAnswer: string | null | undefined,
): StatResponse[] {
  const scoped = statsRowsForInteraction(responses, interactionResponseId)
  if (scoped.length === 0 || interactionTotalCount <= 0) {
    return []
  }

  const isRowCorrect = (row: ChoiceStatRow) =>
    (row.score ?? 0) > 0 || matchesCorrectAnswer(row.value ?? null, correctAnswer)

  const sorted = [...scoped].sort((left, right) => {
    const leftScore = Number(left.value)
    const rightScore = Number(right.value)
    if (!Number.isNaN(leftScore) && !Number.isNaN(rightScore)) {
      return leftScore - rightScore
    }
    return String(left.value ?? "").localeCompare(String(right.value ?? ""))
  })

  return sorted.map((row) => {
    const count = row.count ?? 0
    const isCorrect = isRowCorrect(row)
    const payload = buildStatPayload(count, interactionTotalCount, isCorrect)
    return {
      value: row.value?.trim() || "Empty",
      count: payload.count,
      percentage: payload.pct,
      isCorrect: payload.isCorrect,
      tooltip: payload.tooltip,
    }
  })
}
