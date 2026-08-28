import { SCORE_GROUP_NAMES } from "../constants"
import {
  distractorResponseMatches,
  genderLabel,
  getGenders,
  getStudents,
} from "../helpers"
import { quartileBoundaries } from "../stats"
import type { AnalysisSet, DistractorPlotData, StudentResult } from "../../types/model"

export function calculateDistractorPlotData(analysis: AnalysisSet): void {
  const totalQuartiles = quartileBoundaries(
    getStudents(analysis).map((student) => student.totalScore),
  )

  const byGenderQuartiles = new Map<number, ReturnType<typeof quartileBoundaries>>()
  for (const gender of getGenders(analysis)) {
    const scores = getStudents(analysis)
      .filter((student) => student.gender === gender)
      .map((student) => student.totalScore)
    if (scores.length > 0) {
      byGenderQuartiles.set(gender, quartileBoundaries(scores))
    }
  }

  const byStudentGroupQuartiles = new Map<string, ReturnType<typeof quartileBoundaries>>()
  for (const group of analysis.studentGroups) {
    const scores = getStudents(analysis)
      .filter((student) => student.group === group)
      .map((student) => student.totalScore)
    if (scores.length > 0) {
      byStudentGroupQuartiles.set(group, quartileBoundaries(scores))
    }
  }

  for (const [itemLabel, item] of Object.entries(analysis.items)) {
    const responses = item.responses ?? []

    item.distractorPlotData = buildDistractorPlotData(
      getStudents(analysis),
      itemLabel,
      item,
      responses,
      totalQuartiles,
    )

    item.distractorPlotDataByGender = {}
    for (const gender of getGenders(analysis)) {
      const quartiles = byGenderQuartiles.get(gender)
      if (!quartiles) continue

      const students = getStudents(analysis).filter(
        (student) => student.gender === gender,
      )
      item.distractorPlotDataByGender[genderLabel(gender)] = buildDistractorPlotData(
        students,
        itemLabel,
        item,
        responses,
        quartiles,
      )
    }

    item.distractorPlotDataByStudentGroup = {}
    for (const group of analysis.studentGroups) {
      const quartiles = byStudentGroupQuartiles.get(group)
      if (!quartiles) continue

      const students = getStudents(analysis).filter(
        (student) => student.group === group,
      )
      item.distractorPlotDataByStudentGroup[group] = buildDistractorPlotData(
        students,
        itemLabel,
        item,
        responses,
        quartiles,
      )
    }
  }
}

function buildDistractorPlotData(
  students: StudentResult[],
  itemLabel: string,
  item: AnalysisSet["items"][string],
  responses: string[],
  { q1, q2, q3 }: ReturnType<typeof quartileBoundaries>,
): DistractorPlotData {
  const buckets = [
    students.filter((student) => student.totalScore <= q1),
    students.filter(
      (student) => student.totalScore > q1 && student.totalScore <= q2,
    ),
    students.filter(
      (student) => student.totalScore > q2 && student.totalScore <= q3,
    ),
    students.filter((student) => student.totalScore > q3),
  ]

  const data: DistractorPlotData["data"] = {}

  for (const response of responses) {
    data[response] = {}
    buckets.forEach((bucket, index) => {
      const groupName = SCORE_GROUP_NAMES[index]
      if (bucket.length === 0) {
        data[response][groupName] = 0
        return
      }

      const matches = bucket.filter((student) =>
        distractorResponseMatches(
          item,
          student.itemResults[itemLabel],
          response,
        ),
      ).length

      data[response][groupName] = (100 * matches) / bucket.length
    })
  }

  return { data }
}
