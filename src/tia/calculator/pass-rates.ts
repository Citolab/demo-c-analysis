import { genderLabel, getGenders, getStudents } from "../helpers"
import type { AnalysisSet } from "../../types/model"

export function calculatePassRates(analysis: AnalysisSet): void {
  const perGenderPassed: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
  const perGenderTotal: Record<number, number> = { 0: 0, 1: 0, 2: 0 }
  const perStudentGroupPassed: Record<string, number> = {}
  const perStudentGroupTotal: Record<string, number> = {}

  for (const group of analysis.studentGroups) {
    perStudentGroupPassed[group] = 0
    perStudentGroupTotal[group] = 0
  }

  let totalPassed = 0
  const cutOff = analysis.cutOffScore ?? 0

  for (const result of getStudents(analysis)) {
    const passed = result.totalScore >= cutOff
    if (passed) {
      totalPassed++
      perGenderPassed[result.gender]++
      perStudentGroupPassed[result.group]++
    }

    perGenderTotal[result.gender]++
    perStudentGroupTotal[result.group]++
  }

  const studentCount = getStudents(analysis).length
  analysis.passRate = totalPassed / studentCount
  analysis.perGenderPassRate = {}
  analysis.perStudentGroupPassRate = {}

  for (const gender of getGenders(analysis)) {
    const total = perGenderTotal[gender]
    analysis.perGenderPassRate[genderLabel(gender)] =
      total > 0 ? perGenderPassed[gender] / total : 0
  }

  for (const group of analysis.studentGroups) {
    const total = perStudentGroupTotal[group]
    analysis.perStudentGroupPassRate[group] =
      total > 0 ? perStudentGroupPassed[group] / total : 0
  }
}
