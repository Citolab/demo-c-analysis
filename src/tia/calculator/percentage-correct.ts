import { genderLabel, getGenders, getStudents, isMultipleChoice } from "../helpers"
import type { AnalysisSet, ItemMetaData, StudentResult } from "../../types/model"

export function calculatePercentageCorrectPerItem(analysis: AnalysisSet): void {
  for (const item of Object.values(analysis.items)) {
    item.percentageCorrect = calculatePercentageCorrect(getStudents(analysis), item)
    item.percentageCorrectByGender = Object.fromEntries(
      getGenders(analysis).map((gender) => [
        genderLabel(gender),
        calculatePercentageCorrect(
          getStudents(analysis).filter((student) => student.gender === gender),
          item,
        ),
      ]),
    )
    item.percentageCorrectByStudentGroup = Object.fromEntries(
      analysis.studentGroups.map((group) => [
        group,
        calculatePercentageCorrect(
          getStudents(analysis).filter((student) => student.group === group),
          item,
        ),
      ]),
    )
  }
}

function calculatePercentageCorrect(
  students: StudentResult[],
  item: ItemMetaData,
): number {
  const totalResults = students.filter((student) =>
    student.itemResults[item.label],
  ).length

  if (isMultipleChoice(item)) {
    const totalCorrect = students.filter((student) => {
      const itemResult = student.itemResults[item.label]
      if (!itemResult?.response?.length) return false
      return item.key.includes(itemResult.response[0])
    }).length

    return totalResults > 0 ? totalCorrect / totalResults : 0
  }

  const maxScore = item.maxScore * totalResults
  const scoreSum = students.reduce((sum, student) => {
    const itemResult = student.itemResults[item.label]
    return sum + (itemResult ? itemResult.score : 0)
  }, 0)

  return maxScore > 0 ? scoreSum / maxScore : 0
}
