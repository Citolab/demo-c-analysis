import { NO_DOMAIN, NO_GROUP } from "../constants"
import {
  getExcelTemplateStrings,
  type ExcelLocale,
  type ExcelTemplateStrings,
} from "./excel-template-strings"
import { cellNumber, cellString, type SheetMatrix } from "./excel-workbook"
import type { ImporterStrings } from "./importer-strings"
import type { AnalysisSet } from "../../types/model"

const START_SHEET = "Start"

export function parseSettings(
  filename: string,
  sheets: Record<string, SheetMatrix>,
  result: AnalysisSet,
  errors: string[],
  strings: ImporterStrings,
): ExcelTemplateStrings {
  const startSheet = sheets[START_SHEET]
  if (!startSheet) {
    errors.push(`Sheet '${START_SHEET}' not found.`)
    return getExcelTemplateStrings("en")
  }

  const locale = detectLanguage(filename, startSheet, errors, strings)
  const template = getExcelTemplateStrings(locale ?? "en")
  if (!locale) {
    return template
  }

  const nameRow = startSheet.find(
    (row) => cellString(row[0]) === template.settingName,
  )
  if (!nameRow) {
    errors.push(strings.settingMissingName)
  } else {
    result.name = cellString(nameRow[1])
    if (!result.name) {
      errors.push(strings.settingEmptyName)
    }
  }

  parseCutOffScore(startSheet, result, errors, template, strings)
  parseDomains(startSheet, result, errors, template, strings)
  parseStudentGroups(startSheet, result, errors, template, strings)

  return template
}

function detectLanguage(
  filename: string,
  startSheet: SheetMatrix,
  errors: string[],
  strings: ImporterStrings,
): ExcelLocale | null {
  let base = filename.replace(/\.[^.]+$/, "").trim().toLowerCase()
  if (base.includes("(")) {
    base = base.slice(0, base.lastIndexOf("(")).trim()
  }

  let language: ExcelLocale | null = base.endsWith("nl")
    ? "nl"
    : base.endsWith("en")
      ? "en"
      : null

  if (!language) {
    const cell = cellString(startSheet[0]?.[1]).toLowerCase()
    if (cell === "nl" || cell === "en") {
      language = cell
    }
  }

  if (!language) {
    errors.push(strings.templateLanguageUndetermined)
    return null
  }

  return language
}

function parseCutOffScore(
  rows: SheetMatrix,
  result: AnalysisSet,
  errors: string[],
  template: ExcelTemplateStrings,
  strings: ImporterStrings,
) {
  const cutOffRow = rows.find(
    (row) => cellString(row[0]) === template.settingCutoffScore,
  )
  if (!cutOffRow) {
    errors.push(strings.settingMissingCutoffScore)
    return
  }

  if (cutOffRow[1] == null || cellString(cutOffRow[1]) === "") {
    result.cutOffScore = null
    result.importWarnings.push(strings.settingEmptyCutoffScore)
    return
  }

  const cutOff = cellNumber(cutOffRow[1])
  if (cutOff == null) {
    errors.push(strings.settingErrorCutoffScore(String(cutOffRow[1])))
    return
  }

  result.cutOffScore = Math.trunc(cutOff)
}

function parseStudentGroups(
  rows: SheetMatrix,
  analysisSet: AnalysisSet,
  errors: string[],
  template: ExcelTemplateStrings,
  strings: ImporterStrings,
) {
  const headerIndex = rows.findIndex(
    (row) => cellString(row[0]) === template.groupsHeader,
  )
  if (headerIndex < 0) {
    errors.push(strings.settingMissingStudentGroups)
    return
  }

  const groupRows = rows.slice(headerIndex + 1, headerIndex + 5)
  const studentGroups = new Set<string>([NO_GROUP])

  for (const groupRow of groupRows) {
    let group = cellString(groupRow[0])
    if (group === NO_GROUP) {
      errors.push(strings.settingInvalidStudentGroup)
    }
    if (!group) {
      group = NO_GROUP
    }
    studentGroups.add(group)
  }

  if (studentGroups.size <= 1) {
    analysisSet.importWarnings.push(strings.settingEmptyStudentGroups)
  }

  analysisSet.studentGroups = [...studentGroups]
}

function parseDomains(
  rows: SheetMatrix,
  analysisSet: AnalysisSet,
  errors: string[],
  template: ExcelTemplateStrings,
  strings: ImporterStrings,
) {
  const headerIndex = rows.findIndex(
    (row) =>
      cellString(row[0]) === template.domain1Header &&
      cellString(row[1]) === template.domain2Header,
  )
  if (headerIndex < 0) {
    errors.push(strings.settingMissingDomains)
    return
  }

  const domainRows = rows.slice(headerIndex + 1, headerIndex + 7)
  const domainName1 = cellString(domainRows[0]?.[0]) || template.headerDomain1
  const domainName2 = cellString(domainRows[0]?.[1]) || template.headerDomain2

  if (domainName1 === domainName2) {
    errors.push(strings.settingNonUniqueDomains(domainName1))
    return
  }

  const domainSet1 = { name: domainName1, domains: [NO_DOMAIN] as string[] }
  const domainSet2 = { name: domainName2, domains: [NO_DOMAIN] as string[] }

  for (let index = 1; index < 6; index++) {
    let domain1 = cellString(domainRows[index]?.[0])
    let domain2 = cellString(domainRows[index]?.[1])

    if (domain1 === NO_DOMAIN) errors.push(strings.settingInvalidDomain1)
    if (domain2 === NO_DOMAIN) errors.push(strings.settingInvalidDomain2)
    if (!domain1) domain1 = NO_DOMAIN
    if (!domain2) domain2 = NO_DOMAIN

    domainSet1.domains.push(domain1)
    domainSet2.domains.push(domain2)
  }

  if (domainSet1.domains.length <= 1) {
    analysisSet.importWarnings.push(strings.settingEmptyDomain(domainName1))
  }
  if (domainSet2.domains.length <= 1) {
    analysisSet.importWarnings.push(strings.settingEmptyDomain(domainName2))
  }

  analysisSet.domainSets = [domainSet1, domainSet2]
}
