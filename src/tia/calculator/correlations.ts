import { getStudents, isMultipleChoice } from "../helpers"
import { correlation } from "../stats"
import type { AnalysisSet } from "../../types/model"

export function calculateRit(analysis: AnalysisSet): void {
  const testScores = getStudents(analysis).map((student) => student.totalScore)

  for (const [itemLabel, item] of Object.entries(analysis.items)) {
    const itemScores = getStudents(analysis).map(
      (student) => student.itemResults[itemLabel].score,
    )
    item.rit = correlation(itemScores, testScores)
  }
}

export function calculateRir(analysis: AnalysisSet): void {
  for (const [itemLabel, item] of Object.entries(analysis.items)) {
    const itemScores = getStudents(analysis).map(
      (student) => student.itemResults[itemLabel].score,
    )
    const testScoresWithoutItem = getStudents(analysis).map((student) =>
      Object.entries(student.itemResults)
        .filter(([label]) => label !== itemLabel)
        .reduce((sum, [, itemResult]) => sum + itemResult.score, 0),
    )
    item.rir = correlation(itemScores, testScoresWithoutItem)
  }
}

export function calculateRar(analysis: AnalysisSet): void {
  for (const [itemLabel, item] of Object.entries(analysis.items)) {
    if (!isMultipleChoice(item)) continue

    item.rars = {}
    const testScoresWithoutItem = getStudents(analysis).map((student) =>
      Object.entries(student.itemResults)
        .filter(([label]) => label !== itemLabel)
        .reduce((sum, [, itemResult]) => sum + itemResult.score, 0),
    )

    const distractors = new Set(
      getStudents(analysis)
        .map((student) => student.itemResults[itemLabel]?.response)
        .filter((response): response is string => Boolean(response) && response !== item.key),
    )

    for (const distractor of distractors) {
      const binaryScores = getStudents(analysis).map((student) =>
        student.itemResults[itemLabel]?.response === distractor ? 1 : 0,
      )
      item.rars[distractor] = correlation(binaryScores, testScoresWithoutItem)
    }
  }
}
