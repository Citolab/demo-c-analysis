import { Gender } from "../../types/model"
import { ImportException } from "./import-exception"
import type { ImporterStrings } from "./importer-strings"
import type { AnalysisSet } from "../../types/model"

export function finalizeImport(
  analysisSet: AnalysisSet,
  strings: ImporterStrings,
  doChecks = true,
): AnalysisSet {
  removeNoGroupData(analysisSet)
  removeNoDomainData(analysisSet)
  removeUnknownOrOtherGenderIfEmpty(analysisSet)

  if (doChecks) {
    checkForOverallErrors(analysisSet, strings)
    checkForPrePrepareWarnings(analysisSet, strings)
  }

  return analysisSet
}

export function appendPostPrepareWarnings(
  analysisSet: AnalysisSet,
  strings: ImporterStrings,
): void {
  const itemCount = Object.keys(analysisSet.items).length
  if (itemCount > 7) {
    for (const [domain, count] of Object.entries(analysisSet.perDomainItemCounts)) {
      if (count <= 7) {
        analysisSet.importWarnings.push(strings.domainLessThan7Items(domain))
      }
    }
  }

  const studentCount = analysisSet.studentCount
  if (studentCount > 15) {
    for (const [group, count] of Object.entries(analysisSet.perStudentGroupCounts)) {
      if (count <= 15) {
        analysisSet.importWarnings.push(strings.groupLessThan15Students(group))
      }
    }
    for (const [gender, count] of Object.entries(analysisSet.perGenderCounts)) {
      if (count <= 15) {
        analysisSet.importWarnings.push(strings.genderLessThan15Students(gender))
      }
    }
  }
}

function removeNoGroupData(analysisSet: AnalysisSet): void {
  analysisSet.studentGroups = analysisSet.studentGroups.filter(
    (group) => group !== "No group",
  )
}

function removeNoDomainData(analysisSet: AnalysisSet): void {
  for (const domainSet of analysisSet.domainSets) {
    domainSet.domains = domainSet.domains.filter((domain) => domain !== "No domain")
  }
}

function removeUnknownOrOtherGenderIfEmpty(analysisSet: AnalysisSet): void {
  const hasUnknown = Object.values(analysisSet.studentResults).some(
    (result) => result.gender === Gender.UnknownOrOther,
  )
  if (!hasUnknown) {
    analysisSet.ignoreUnknownOrOtherGender = true
  }
}

function checkForOverallErrors(analysisSet: AnalysisSet, strings: ImporterStrings) {
  const errors: string[] = []

  if (Object.keys(analysisSet.studentResults).length < 3) {
    errors.push(strings.minimumStudentCount3)
  }
  if (Object.keys(analysisSet.items).length < 3) {
    errors.push(strings.minimumItemCount3)
  }

  if (errors.length > 0) {
    throw new ImportException(errors, strings.errorsCheckingCounts)
  }
}

function checkForPrePrepareWarnings(
  analysisSet: AnalysisSet,
  strings: ImporterStrings,
): void {
  const itemCount = Object.keys(analysisSet.items).length
  if (itemCount <= 7) {
    analysisSet.importWarnings.push(strings.totalLessThan7Items)
  }

  const studentCount = Object.keys(analysisSet.studentResults).length
  if (studentCount <= 15) {
    analysisSet.importWarnings.push(strings.totalLessThan15Students)
  }
}
