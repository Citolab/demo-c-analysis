import type { AnalysisSet, ItemMetaData } from "../types/model"

/** Strips precomputed statistics from a reference analysis, keeping only import inputs. */
export function toRawAnalysis(reference: AnalysisSet): AnalysisSet {
  const items = Object.fromEntries(
    Object.entries(reference.items).map(([label, item]) => [
      label,
      {
        label: item.label,
        itemType: item.itemType,
        maxScore: item.maxScore,
        key: item.key,
        numberOfAlternatives: item.numberOfAlternatives,
        calamity: item.calamity,
        domains: [...item.domains],
        annotations: {},
      } as ItemMetaData,
    ]),
  )

  return {
    name: reference.name,
    importWarnings: [...(reference.importWarnings ?? [])],
    missingValueCharacter: reference.missingValueCharacter,
    hash: reference.hash,
    ignoreUnknownOrOtherGender: reference.ignoreUnknownOrOtherGender,
    cutOffScore: reference.cutOffScore,
    domainSets: structuredClone(reference.domainSets),
    studentGroups: [...reference.studentGroups],
    studentResults: structuredClone(reference.studentResults),
    annotations: {},
    studentCount: 0,
    perGenderCounts: {},
    perStudentGroupCounts: {},
    perDomainItemCounts: {},
    perDomainMaxTotalScore: {},
    items,
    maxTotalScore: 0,
    cronbachsAlpha: 0,
    perDomainCronbachsAlphas: {},
    passRate: 0,
    perGenderPassRate: {},
    perStudentGroupPassRate: {},
    scoreDistribution: {
      domainSet: "<all>",
      domain: "<all>",
      all: {},
      byGender: {},
      byStudentGroup: {},
      meanScoreAll: 0,
      meanScoreByGender: {},
      meanScoreByStudentGroup: {},
    },
    perDomainScoreDistribution: {},
    skippedItemsAnalysis: {
      domainSet: "<all>",
      domain: "<all>",
      all: {},
      byGender: {},
      byStudentGroup: {},
    },
    perDomainSkippedItemsAnalysis: {},
  }
}
