import { genderLabel, getGenders, getStudents } from "../helpers"
import type { AnalysisSet } from "../../types/model"

export function calculatePValues(analysis: AnalysisSet): void {
  for (const [itemLabel, item] of Object.entries(analysis.items)) {
    const perGenderCorrect: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
    }
    const perGenderTotal: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
    }
    const perStudentGroupCorrect: Record<string, number> = {}
    const perStudentGroupTotal: Record<string, number> = {}

    for (const group of analysis.studentGroups) {
      perStudentGroupCorrect[group] = 0
      perStudentGroupTotal[group] = 0
    }

    let totalCorrect = 0
    let totalAnswered = 0

    for (const result of getStudents(analysis)) {
      const scoreFraction = result.itemResults[itemLabel].score / item.maxScore
      totalCorrect += scoreFraction
      totalAnswered++
      perGenderCorrect[result.gender] += scoreFraction
      perGenderTotal[result.gender]++
      perStudentGroupCorrect[result.group] += scoreFraction
      perStudentGroupTotal[result.group]++
    }

    item.pValue = totalCorrect / totalAnswered
    item.pValuesByGender = {}
    item.pValuesByStudentGroup = {}

    for (const gender of getGenders(analysis)) {
      const total = perGenderTotal[gender]
      item.pValuesByGender[genderLabel(gender)] =
        total > 0 ? perGenderCorrect[gender] / total : Number.NaN
    }

    for (const group of analysis.studentGroups) {
      const total = perStudentGroupTotal[group]
      item.pValuesByStudentGroup[group] =
        total > 0 ? perStudentGroupCorrect[group] / total : Number.NaN
    }
  }
}
