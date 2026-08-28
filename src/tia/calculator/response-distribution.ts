import { genderLabel, getGenders, getStudents, itemResponseMatches } from "../helpers"
import type { AnalysisSet } from "../../types/model"

export function calculateResponseDistribution(analysis: AnalysisSet): void {
  for (const [itemLabel, item] of Object.entries(analysis.items)) {
    const responses = item.responses ?? []

    item.responseDistribution = {
      all: Object.fromEntries(
        responses.map((response) => [
          response,
          getStudents(analysis).filter((student) =>
            itemResponseMatches(item, student.itemResults[itemLabel], response),
          ).length,
        ]),
      ),
      byGender: Object.fromEntries(
        getGenders(analysis).map((gender) => [
          genderLabel(gender),
          Object.fromEntries(
            responses.map((response) => [
              response,
              getStudents(analysis).filter(
                (student) =>
                  student.gender === gender &&
                  itemResponseMatches(item, student.itemResults[itemLabel], response),
              ).length,
            ]),
          ),
        ]),
      ),
      byStudentGroup: Object.fromEntries(
        analysis.studentGroups.map((group) => [
          group,
          Object.fromEntries(
            responses.map((response) => [
              response,
              getStudents(analysis).filter(
                (student) =>
                  student.group === group &&
                  itemResponseMatches(item, student.itemResults[itemLabel], response),
              ).length,
            ]),
          ),
        ]),
      ),
      allSkipped: getStudents(analysis).filter(
        (student) => student.itemResults[itemLabel]?.missing,
      ).length,
      byGenderSkipped: Object.fromEntries(
        getGenders(analysis).map((gender) => [
          genderLabel(gender),
          getStudents(analysis).filter(
            (student) =>
              student.gender === gender &&
              student.itemResults[itemLabel]?.missing,
          ).length,
        ]),
      ),
      byStudentGroupSkipped: Object.fromEntries(
        analysis.studentGroups.map((group) => [
          group,
          getStudents(analysis).filter(
            (student) =>
              student.group === group && student.itemResults[itemLabel]?.missing,
          ).length,
        ]),
      ),
    }
  }
}
