import { NO_GROUP } from "../constants"
import { cellString, columnLetter, type SheetMatrix } from "./excel-workbook"
import type { ExcelTemplateStrings } from "./excel-template-strings"
import type { ImporterStrings } from "./importer-strings"
import {
  Gender,
  ItemType,
  type AnalysisSet,
  type ItemResult,
  type StudentResult,
} from "../../types/model"

export function parseStudentResults(
  sheet: SheetMatrix | undefined,
  analysisSet: AnalysisSet,
  errors: string[],
  template: ExcelTemplateStrings,
  strings: ImporterStrings,
): void {
  if (!sheet || sheet.length < 2) {
    errors.push(strings.baseColumnHeadersError)
    return
  }

  const headerRow = sheet[1]
  if (
    cellString(headerRow?.[0]) !== template.headerStudent ||
    cellString(headerRow?.[1]) !== template.headerGender ||
    cellString(headerRow?.[2]) !== template.headerGroup
  ) {
    errors.push(strings.baseColumnHeadersError)
    return
  }

  const itemLabels = Object.keys(analysisSet.items)
  let headerIndex = 3
  for (const itemLabel of itemLabels) {
    if (cellString(headerRow?.[headerIndex]) !== itemLabel) {
      errors.push(strings.columnHeaderExpectedAt(itemLabel, columnLetter(headerIndex)))
    }
    headerIndex++
  }

  if (errors.length > 0) {
    return
  }

  analysisSet.studentResults = {}
  let resultCounter = 2
  const missingValue = analysisSet.missingValueCharacter ?? "-"

  for (const resultRow of sheet.slice(2)) {
    if (resultRow.every((cell) => cell == null || cellString(cell) === "")) {
      continue
    }

    resultCounter++
    const studentResult: StudentResult = {
      studentIdentifier: "",
      gender: Gender.Male,
      group: "",
      itemResults: {},
      totalScore: 0,
    }

    const studentIdentifier = cellString(resultRow[0])
    if (!studentIdentifier) {
      errors.push(strings.studentIdentifierErrorRow(resultCounter))
      continue
    }
    if (analysisSet.studentResults[studentIdentifier]) {
      errors.push(strings.studentIdentifierNotUnique(studentIdentifier))
      return
    }
    studentResult.studentIdentifier = studentIdentifier

    const genderString = cellString(resultRow[1])
    if (genderString === template.optionGenderMale) {
      studentResult.gender = Gender.Male
    } else if (genderString === template.optionGenderFemale) {
      studentResult.gender = Gender.Female
    } else if (genderString === template.optionGenderUnknownOther) {
      studentResult.gender = Gender.UnknownOrOther
    } else {
      errors.push(strings.genderErrorStudent(studentIdentifier, resultCounter))
      continue
    }

    let group = cellString(resultRow[2])
    if (!group) {
      group = NO_GROUP
      analysisSet.importWarnings.push(
        strings.studentGroupMissing(studentIdentifier, resultCounter),
      )
    }
    if (!analysisSet.studentGroups.includes(group)) {
      errors.push(strings.studentGroupError(studentIdentifier, resultCounter))
      continue
    }
    studentResult.group = group

    let columnIndex = 3
    for (const itemLabel of itemLabels) {
      const item = analysisSet.items[itemLabel]
      const itemResult: ItemResult = {
        missing: false,
        response: null,
        score: 0,
      }
      const cellValue = cellString(resultRow[columnIndex])

      if (cellValue === missingValue) {
        itemResult.missing = true
      }

      if (item.itemType === ItemType.MultipleChoice) {
        itemResult.response = cellValue
        itemResult.score =
          item.key.includes(itemResult.response ?? "") || item.calamity
            ? item.maxScore
            : 0
      } else {
        if (item.calamity) {
          itemResult.score = item.maxScore
        } else if (!itemResult.missing) {
          const score = Number(cellValue)
          if (
            Number.isInteger(score) &&
            score >= 0 &&
            score <= item.maxScore
          ) {
            itemResult.score = score
            itemResult.response = String(score)
          } else if (cellValue !== missingValue) {
            if (Number.isInteger(score) && (score < 0 || score > item.maxScore)) {
              errors.push(
                strings.itemScoreBoundsError(
                  studentIdentifier,
                  resultCounter,
                  item.maxScore,
                ),
              )
            } else {
              errors.push(strings.itemScoreError(studentIdentifier, resultCounter))
            }
          }
        }
      }

      studentResult.itemResults[item.label] = itemResult
      columnIndex++
    }

    analysisSet.studentResults[studentIdentifier] = studentResult
  }
}
