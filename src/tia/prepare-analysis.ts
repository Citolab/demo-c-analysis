import { NO_DOMAIN, NO_GROUP, genderLabel } from "./constants"
import { domainName } from "./helpers"
import { variance } from "./stats"
import {
  Gender,
  ItemType,
  type AnalysisSet,
  type ItemMetaData,
} from "../types/model"

export function prepareAnalysis(analysis: AnalysisSet): void {
  removeNoGroupData(analysis)
  removeNoDomainData(analysis)
  removeUnknownOrOtherGenderIfEmpty(analysis)
  calculateBasicStats(analysis)
}

function removeNoGroupData(analysis: AnalysisSet): void {
  analysis.studentGroups = analysis.studentGroups.filter((group) => group !== NO_GROUP)
}

function removeNoDomainData(analysis: AnalysisSet): void {
  for (const domainSet of analysis.domainSets) {
    domainSet.domains = domainSet.domains.filter((domain) => domain !== NO_DOMAIN)
  }
}

function removeUnknownOrOtherGenderIfEmpty(analysis: AnalysisSet): void {
  const hasUnknown = Object.values(analysis.studentResults).some(
    (result) => result.gender === Gender.UnknownOrOther,
  )
  if (!hasUnknown) {
    analysis.ignoreUnknownOrOtherGender = true
  }
}

function calculateBasicStats(analysis: AnalysisSet): void {
  analysis.studentCount = Object.keys(analysis.studentResults).length
  analysis.perGenderCounts = {}

  for (const gender of [Gender.Male, Gender.Female, Gender.UnknownOrOther]) {
    if (gender === Gender.UnknownOrOther && analysis.ignoreUnknownOrOtherGender) {
      continue
    }
    analysis.perGenderCounts[genderLabel(gender)] = 0
  }

  analysis.perStudentGroupCounts = {}
  for (const group of analysis.studentGroups) {
    analysis.perStudentGroupCounts[group] = 0
  }

  analysis.perDomainItemCounts = {}
  analysis.perDomainMaxTotalScore = {}

  for (const domainSet of analysis.domainSets) {
    for (const domain of domainSet.domains) {
      const key = domainName(domainSet.name, domain)
      analysis.perDomainItemCounts[key] = 0
      analysis.perDomainMaxTotalScore[key] = 0
    }
  }

  for (const item of Object.values(analysis.items)) {
    for (const itemDomain of item.domains) {
      if (!itemDomain.includes(NO_DOMAIN)) {
        analysis.perDomainItemCounts[itemDomain] =
          (analysis.perDomainItemCounts[itemDomain] ?? 0) + 1
        analysis.perDomainMaxTotalScore[itemDomain] =
          (analysis.perDomainMaxTotalScore[itemDomain] ?? 0) + item.maxScore
      }
    }
  }

  analysis.maxTotalScore = Object.values(analysis.items).reduce(
    (sum, item) => sum + item.maxScore,
    0,
  )

  for (const result of Object.values(analysis.studentResults)) {
    result.totalScore = Object.values(result.itemResults).reduce(
      (sum, itemResult) => sum + itemResult.score,
      0,
    )

    if (
      !analysis.ignoreUnknownOrOtherGender ||
      result.gender !== Gender.UnknownOrOther
    ) {
      analysis.perGenderCounts[genderLabel(result.gender)] =
        (analysis.perGenderCounts[genderLabel(result.gender)] ?? 0) + 1
    }

    if (result.group !== NO_GROUP) {
      analysis.perStudentGroupCounts[result.group] =
        (analysis.perStudentGroupCounts[result.group] ?? 0) + 1
    }
  }

  const testScores = Object.values(analysis.studentResults).map(
    (result) => result.totalScore,
  )
  analysis.testScores = testScores
  analysis.testScoreVariance = variance(testScores.map(Number))

  for (const item of Object.values(analysis.items)) {
    item.responses = buildResponses(item)
  }
}

function buildResponses(item: ItemMetaData): string[] {
  if (item.itemType === ItemType.MultipleChoice) {
    return Array.from({ length: item.numberOfAlternatives }, (_, index) =>
      String.fromCharCode(65 + index),
    )
  }

  return Array.from({ length: item.maxScore + 1 }, (_, index) => String(index))
}
