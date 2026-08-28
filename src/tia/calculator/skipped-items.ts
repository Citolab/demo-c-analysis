import {
  createSkippedItemsAnalysis,
  domainName,
  genderLabel,
  getGenders,
  getStudents,
} from "../helpers"
import type { AnalysisSet, ItemMetaData } from "../../types/model"

export function calculateSkippedItemCountAnalysis(analysis: AnalysisSet): void {
  analysis.skippedItemsAnalysis = calculateSkippedItemCountAnalysisByDomain(analysis)
}

export function calculateSkippedItemCountAnalysesByDomain(
  analysis: AnalysisSet,
): void {
  analysis.perDomainSkippedItemsAnalysis = {}

  for (const domainSet of analysis.domainSets) {
    for (const domain of domainSet.domains) {
      const key = domainName(domainSet.name, domain)
      analysis.perDomainSkippedItemsAnalysis[key] =
        calculateSkippedItemCountAnalysisByDomain(analysis, domainSet.name, domain)
    }
  }
}

export function calculateSkippedItemCountAnalysisByDomain(
  analysis: AnalysisSet,
  domainSetName = "",
  domain = "",
) {
  const items = getDomainItems(analysis, domainSetName, domain)
  const result = createSkippedItemsAnalysis(
    analysis,
    domainSetName || "<all>",
    domain || "<all>",
  )

  for (const student of getStudents(analysis)) {
    const skipped = Object.entries(student.itemResults).filter(
      ([label, itemResult]) => items[label] && itemResult.missing,
    ).length

    if (skipped === 0) continue

    result.all[skipped] = (result.all[skipped] ?? 0) + 1
    result.byGender[genderLabel(student.gender)][skipped] =
      (result.byGender[genderLabel(student.gender)][skipped] ?? 0) + 1
    result.byStudentGroup[student.group][skipped] =
      (result.byStudentGroup[student.group][skipped] ?? 0) + 1
  }

  return result
}

export function calculateSkippedItemAnalysisPerItem(analysis: AnalysisSet): void {
  const studentCount = getStudents(analysis).length

  for (const [itemLabel, item] of Object.entries(analysis.items)) {
    item.skippedItemAnalysis = {
      domainSet: "<all>",
      domain: "<all>",
      all:
        getStudents(analysis).filter(
          (student) => student.itemResults[itemLabel]?.missing,
        ).length / studentCount,
      byGender: {},
      byStudentGroup: {},
    }

    for (const gender of getGenders(analysis)) {
      const students = getStudents(analysis).filter(
        (student) => student.gender === gender,
      )
      item.skippedItemAnalysis.byGender[genderLabel(gender)] =
        students.length > 0
          ? students.filter((student) => student.itemResults[itemLabel]?.missing)
              .length / students.length
          : 0
    }

    for (const group of analysis.studentGroups) {
      const students = getStudents(analysis).filter(
        (student) => student.group === group,
      )
      item.skippedItemAnalysis.byStudentGroup[group] =
        students.length > 0
          ? students.filter((student) => student.itemResults[itemLabel]?.missing)
              .length / students.length
          : 0
    }

    item.skippedItemAnalysisByDomain = {}

    for (const domainSet of analysis.domainSets) {
      for (const domain of domainSet.domains) {
        const key = domainName(domainSet.name, domain)
        if (!item.domains.includes(key)) continue

        const skippedAnalysis = {
          domainSet: domainSet.name,
          domain,
          all:
            getStudents(analysis).filter(
              (student) => student.itemResults[itemLabel]?.missing,
            ).length / studentCount,
          byGender: {} as Record<string, number>,
          byStudentGroup: {} as Record<string, number>,
        }

        for (const gender of getGenders(analysis)) {
          const students = getStudents(analysis).filter(
            (student) => student.gender === gender,
          )
          skippedAnalysis.byGender[genderLabel(gender)] =
            students.length > 0
              ? students.filter(
                  (student) => student.itemResults[itemLabel]?.missing,
                ).length / students.length
              : 0
        }

        for (const group of analysis.studentGroups) {
          const students = getStudents(analysis).filter(
            (student) => student.group === group,
          )
          skippedAnalysis.byStudentGroup[group] =
            students.length > 0
              ? students.filter(
                  (student) => student.itemResults[itemLabel]?.missing,
                ).length / students.length
              : 0
        }

        item.skippedItemAnalysisByDomain[key] = skippedAnalysis
      }
    }
  }
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
