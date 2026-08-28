import { NO_DOMAIN } from "../constants"
import { cellNumber, cellString, type SheetMatrix } from "./excel-workbook"
import type { ExcelTemplateStrings } from "./excel-template-strings"
import type { ImporterStrings } from "./importer-strings"
import { ItemType, type AnalysisSet, type ItemMetaData } from "../../types/model"

export function parseTestDefinition(
  sheet: SheetMatrix | undefined,
  analysisSet: AnalysisSet,
  errors: string[],
  template: ExcelTemplateStrings,
  strings: ImporterStrings,
): void {
  if (!sheet?.length) {
    errors.push(strings.columnHeadersError)
    return
  }

  const headerRow = sheet[0]
  if (
    cellString(headerRow?.[0]) !== template.headerItemLabel ||
    cellString(headerRow?.[1]) !== template.headerItemType ||
    cellString(headerRow?.[2]) !== template.headerMaxScore ||
    cellString(headerRow?.[3]) !== template.headerKey ||
    cellString(headerRow?.[4]) !== template.headerAlternatives ||
    cellString(headerRow?.[5]) !== template.headerCalamity
  ) {
    errors.push(strings.columnHeadersError)
    return
  }

  analysisSet.items = {}
  let itemCounter = 1

  for (const itemRow of sheet.slice(1)) {
    if (itemRow.every((cell) => cell == null || cellString(cell) === "")) {
      continue
    }

    itemCounter++
    const item = createEmptyItem()
    const missingValue = analysisSet.missingValueCharacter ?? "-"

    const label = cellString(itemRow[0])
    if (!label) {
      errors.push(strings.itemLabelErrorRow(itemCounter))
      continue
    }
    if (analysisSet.items[label]) {
      errors.push(strings.itemLabelNotUnique(label))
      return
    }
    item.label = label

    const itemTypeString = cellString(itemRow[1])
    if (itemTypeString === template.optionMc) {
      item.itemType = ItemType.MultipleChoice
    } else if (itemTypeString === template.optionPrescored) {
      item.itemType = ItemType.Prescored
    } else {
      errors.push(strings.itemTypeErrorRow(item.label, itemCounter))
      continue
    }

    const maxScore = cellNumber(itemRow[2])
    if (maxScore == null) {
      errors.push(strings.maxScoreErrorItem(item.label, itemCounter))
      continue
    }
    if (item.itemType === ItemType.MultipleChoice && maxScore !== 1) {
      errors.push(strings.maxScoreErrorMcItem(item.label, itemCounter))
      continue
    }
    item.maxScore = Math.trunc(maxScore)

    const key = cellString(itemRow[3])
    if (item.itemType === ItemType.MultipleChoice && key === missingValue) {
      errors.push(strings.keyErrorMcItem(item.label, itemCounter))
    } else if (item.itemType === ItemType.Prescored && key !== missingValue) {
      errors.push(strings.keyErrorPsItem(item.label, itemCounter))
    }
    item.key = key || missingValue

    const alternativesString = cellString(itemRow[4])
    if (
      item.itemType === ItemType.MultipleChoice &&
      alternativesString === missingValue
    ) {
      errors.push(strings.alternativesErrorMcItem(item.label, itemCounter))
    } else if (
      item.itemType === ItemType.Prescored &&
      alternativesString !== missingValue
    ) {
      errors.push(strings.alternativesErrorPsItem(item.label, itemCounter))
    } else if (item.itemType === ItemType.MultipleChoice) {
      const alternatives = Number(alternativesString)
      if (Number.isNaN(alternatives)) {
        errors.push(strings.alternativesNanMcItem(item.label, itemCounter))
      } else {
        item.numberOfAlternatives = alternatives
      }
    }

    const calamity = cellString(itemRow[5]).toLowerCase()
    if (calamity === template.optionYes) {
      item.calamity = true
    } else if (calamity === template.optionNo) {
      item.calamity = false
    } else {
      errors.push(strings.calamityErrorItem(item.label, itemCounter))
    }

    const domain1 = cellString(itemRow[6]) || NO_DOMAIN
    if (domain1 === NO_DOMAIN) {
      analysisSet.importWarnings.push(
        strings.domainEmptyItem(analysisSet.domainSets[0].name, item.label, itemCounter),
      )
    }
    if (!analysisSet.domainSets[0].domains.includes(domain1)) {
      errors.push(
        strings.domainErrorItem(analysisSet.domainSets[0].name, item.label, itemCounter),
      )
    } else {
      item.domains.push(`${analysisSet.domainSets[0].name}-${domain1}`)
    }

    const domain2 = cellString(itemRow[7]) || NO_DOMAIN
    if (domain2 === NO_DOMAIN) {
      analysisSet.importWarnings.push(
        strings.domainEmptyItem(analysisSet.domainSets[1].name, item.label, itemCounter),
      )
    }
    if (!analysisSet.domainSets[1].domains.includes(domain2)) {
      errors.push(
        strings.domainErrorItem(analysisSet.domainSets[1].name, item.label, itemCounter),
      )
    } else {
      item.domains.push(`${analysisSet.domainSets[1].name}-${domain2}`)
    }

    analysisSet.items[item.label] = item
  }
}

function createEmptyItem(): ItemMetaData {
  return {
    label: "",
    itemType: ItemType.MultipleChoice,
    maxScore: 0,
    key: "-",
    numberOfAlternatives: 0,
    calamity: false,
    domains: [],
    responseDistribution: {
      all: {},
      byGender: {},
      byStudentGroup: {},
      allSkipped: 0,
      byGenderSkipped: {},
      byStudentGroupSkipped: {},
    },
    rit: 0,
    rir: 0,
    pValue: 0,
    pValuesByGender: {},
    pValuesByStudentGroup: {},
    percentageCorrect: 0,
    percentageCorrectByGender: {},
    percentageCorrectByStudentGroup: {},
    distractorPlotData: { data: {} },
    distractorPlotDataByGender: {},
    distractorPlotDataByStudentGroup: {},
    annotations: {},
  }
}
