import type { ItemMetaData } from "@/types/model"
import { ItemType } from "@/types/model"
import type { ChoiceStatRow } from "@/qti-stats/reviewStatsModel"
import { totalCountFromChoiceStats } from "@/qti-stats/reviewStatsModel"

const RESPONSE_IDENTIFIER = "RESPONSE"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function isPrescoredItem(item: ItemMetaData) {
  return item.itemType === ItemType.Prescored || item.numberOfAlternatives === 0
}

function orderedChoiceIds(item: ItemMetaData) {
  const labels = Object.keys(item.responseDistribution.all)
  const alternatives = Array.from({ length: item.numberOfAlternatives }, (_, index) =>
    String.fromCharCode(65 + index),
  )

  const ordered = [
    ...alternatives.filter((id) => labels.includes(id)),
    ...labels.filter((id) => !alternatives.includes(id)),
  ]

  return ordered.filter((id) => id.trim().length > 0)
}

function orderedScoreResponses(item: ItemMetaData) {
  const scores = item.responses?.length
    ? [...item.responses]
    : Object.keys(item.responseDistribution.all)

  return scores.sort((left, right) => Number(left) - Number(right))
}

export function getCorrectAnswerForItem(item: ItemMetaData) {
  if (item.key && item.key !== "-") return item.key
  if (item.maxScore > 0) return String(item.maxScore)
  return null
}

export function buildChoiceStatRows(item: ItemMetaData): ChoiceStatRow[] {
  const correctAnswer = getCorrectAnswerForItem(item)
  return orderedChoiceIds(item).map((identifier) => ({
    responseIdentifier: RESPONSE_IDENTIFIER,
    value: identifier,
    count: item.responseDistribution.all[identifier] ?? 0,
    score: correctAnswer && identifier === correctAnswer ? 1 : 0,
  }))
}

export function buildExtendedTextStatRows(item: ItemMetaData): ChoiceStatRow[] {
  const correctAnswer = getCorrectAnswerForItem(item)
  return orderedScoreResponses(item).map((score) => ({
    responseIdentifier: RESPONSE_IDENTIFIER,
    value: score,
    count: item.responseDistribution.all[score] ?? 0,
    score: correctAnswer && score === correctAnswer ? 1 : 0,
  }))
}

export function buildChoiceStatsQtiHtml(item: ItemMetaData) {
  const choices = orderedChoiceIds(item)
  const maxChoices = Math.max(1, item.key.length)

  const choicesHtml = choices
    .map(
      (identifier) =>
        `<qti-simple-choice-stats identifier="${escapeHtml(identifier)}">${escapeHtml(identifier)}</qti-simple-choice-stats>`,
    )
    .join("")

  return `
    <qti-assessment-item identifier="${escapeHtml(item.label)}">
      <qti-item-body>
        <qti-choice-interaction-stats response-identifier="${RESPONSE_IDENTIFIER}" max-choices="${maxChoices}">
          ${choicesHtml}
        </qti-choice-interaction-stats>
      </qti-item-body>
    </qti-assessment-item>
  `.trim()
}

export function buildExtendedTextStatsQtiHtml(item: ItemMetaData) {
  return `
    <qti-assessment-item identifier="${escapeHtml(item.label)}">
      <qti-item-body>
        <qti-extended-text-interaction-stats
          response-identifier="${RESPONSE_IDENTIFIER}"
          expected-lines="2"
          placeholder="Open question"
        ></qti-extended-text-interaction-stats>
      </qti-item-body>
    </qti-assessment-item>
  `.trim()
}

export function buildItemStatsQtiHtml(item: ItemMetaData) {
  return isPrescoredItem(item)
    ? buildExtendedTextStatsQtiHtml(item)
    : buildChoiceStatsQtiHtml(item)
}

export function fragmentFromQtiHtml(html: string) {
  const template = document.createElement("template")
  template.innerHTML = html.trim()
  return template.content
}

export function getItemStatsApplyOptions(item: ItemMetaData) {
  const responses = isPrescoredItem(item)
    ? buildExtendedTextStatRows(item)
    : buildChoiceStatRows(item)

  return {
    responses,
    totalCount: totalCountFromChoiceStats(responses),
    correctAnswer: getCorrectAnswerForItem(item),
  }
}

/** @deprecated Use getItemStatsApplyOptions */
export const getChoiceStatsApplyOptions = getItemStatsApplyOptions
