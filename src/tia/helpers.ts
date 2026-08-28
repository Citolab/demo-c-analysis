import { ALL_GENDERS, genderLabel } from "./constants"
import { Gender, ItemType } from "../types/model"

export { genderLabel }
import type {
  ItemMetaData,
  ItemResult,
  SkippedItemsAnalysis,
  ScoreDistribution,
  StudentResult,
  AnalysisSet,
} from "../types/model"

export function getGenders(analysis: AnalysisSet): Gender[] {
  if (analysis.ignoreUnknownOrOtherGender) {
    return ALL_GENDERS.filter((gender) => gender !== Gender.UnknownOrOther)
  }
  return [...ALL_GENDERS]
}

export function getStudents(analysis: AnalysisSet): StudentResult[] {
  return Object.values(analysis.studentResults)
}

export function domainName(domainSetName: string, domain: string): string {
  return `${domainSetName}-${domain}`
}

export function isMultipleChoice(item: ItemMetaData): boolean {
  return item.itemType === ItemType.MultipleChoice
}

export function isPrescored(item: ItemMetaData): boolean {
  return item.itemType === ItemType.Prescored
}

export function itemResponseMatches(
  item: ItemMetaData,
  itemResult: ItemResult,
  response: string,
): boolean {
  if (!itemResult || itemResult.missing) return false

  if (isMultipleChoice(item)) {
    return itemResult.response === response
  }

  const score = Number(response)
  return !Number.isNaN(score) && itemResult.score === score
}

export function distractorResponseMatches(
  item: ItemMetaData,
  itemResult: ItemResult,
  response: string,
): boolean {
  if (!itemResult || itemResult.missing) return false

  if (isPrescored(item)) {
    return String(itemResult.score) === response
  }

  return itemResult.response === response
}

export function createScoreDistribution(
  analysis: AnalysisSet,
  domainSet = "<all>",
  domain = "<all>",
): ScoreDistribution {
  const byGender: ScoreDistribution["byGender"] = {}
  const byStudentGroup: ScoreDistribution["byStudentGroup"] = {}
  const meanScoreByGender: ScoreDistribution["meanScoreByGender"] = {}
  const meanScoreByStudentGroup: ScoreDistribution["meanScoreByStudentGroup"] = {}

  for (const gender of getGenders(analysis)) {
    byGender[genderLabel(gender)] = {}
    meanScoreByGender[genderLabel(gender)] = 0
  }

  for (const group of analysis.studentGroups) {
    byStudentGroup[group] = {}
    meanScoreByStudentGroup[group] = 0
  }

  return {
    domainSet,
    domain,
    all: {},
    byGender,
    byStudentGroup,
    meanScoreAll: 0,
    meanScoreByGender,
    meanScoreByStudentGroup,
  }
}

export function createSkippedItemsAnalysis(
  analysis: AnalysisSet,
  domainSet = "<all>",
  domain = "<all>",
): SkippedItemsAnalysis {
  const byGender: SkippedItemsAnalysis["byGender"] = {}
  const byStudentGroup: SkippedItemsAnalysis["byStudentGroup"] = {}

  for (const gender of getGenders(analysis)) {
    byGender[genderLabel(gender)] = {}
  }

  for (const group of analysis.studentGroups) {
    byStudentGroup[group] = {}
  }

  return {
    domainSet,
    domain,
    all: {},
    byGender,
    byStudentGroup,
  }
}

export function expandMeanScores(distribution: ScoreDistribution): void {
  distribution.meanScoreAll = meanFromHistogram(distribution.all)

  for (const [gender, scores] of Object.entries(distribution.byGender)) {
    distribution.meanScoreByGender[gender] = meanFromHistogram(scores)
  }

  for (const [group, scores] of Object.entries(distribution.byStudentGroup)) {
    distribution.meanScoreByStudentGroup[group] = meanFromHistogram(scores)
  }
}

function meanFromHistogram(histogram: Record<number, number>): number {
  const entries = Object.entries(histogram)
  if (entries.length === 0) return 0

  let total = 0
  let weighted = 0

  for (const [score, count] of entries) {
    total += count
    weighted += Number(score) * count
  }

  return total ? weighted / total : 0
}

export function incrementHistogram(
  histogram: Record<number, number>,
  score: number,
): void {
  histogram[score] = (histogram[score] ?? 0) + 1
}
