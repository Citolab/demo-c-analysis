import {
  createScoreDistribution,
  domainName,
  expandMeanScores,
  genderLabel,
  getStudents,
  incrementHistogram,
} from "../helpers"
import type { AnalysisSet, ItemMetaData } from "../../types/model"

export function calculateScoreDistribution(analysis: AnalysisSet): void {
  analysis.scoreDistribution = calculateScoreDistributionByDomain(analysis)
}

export function calculateScoreDistributionsByDomain(analysis: AnalysisSet): void {
  analysis.perDomainScoreDistribution = {}

  for (const domainSet of analysis.domainSets) {
    for (const domain of domainSet.domains) {
      const key = domainName(domainSet.name, domain)
      analysis.perDomainScoreDistribution[key] = calculateScoreDistributionByDomain(
        analysis,
        domainSet.name,
        domain,
      )
    }
  }
}

export function calculateScoreDistributionByDomain(
  analysis: AnalysisSet,
  domainSetName = "",
  domain = "",
) {
  const items = getDomainItems(analysis, domainSetName, domain)
  const result = createScoreDistribution(
    analysis,
    domainSetName || "<all>",
    domain || "<all>",
  )

  for (const student of getStudents(analysis)) {
    const totalScore = Object.entries(student.itemResults)
      .filter(([label]) => items[label])
      .reduce((sum, [, itemResult]) => sum + itemResult.score, 0)

    incrementHistogram(result.all, totalScore)
    incrementHistogram(result.byGender[genderLabel(student.gender)], totalScore)
    incrementHistogram(result.byStudentGroup[student.group], totalScore)
  }

  expandMeanScores(result)
  return result
}

function getDomainItems(
  analysis: AnalysisSet,
  domainSetName: string,
  domain: string,
): Record<string, ItemMetaData> {
  if (!domainSetName) {
    return analysis.items
  }

  const key = domainName(domainSetName, domain)
  return Object.fromEntries(
    Object.entries(analysis.items).filter(([, item]) => item.domains.includes(key)),
  )
}
