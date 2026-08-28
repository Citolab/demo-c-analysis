import {
  detectLocaleFromFilename,
  type ExcelLocale,
} from "./excel-template-strings"
import { getImporterStrings } from "./importer-strings"
import { ImportException } from "./import-exception"
import { computeMd5Hash } from "./md5-hash"
import { readWorkbook } from "./excel-workbook"
import { parseSettings } from "./parse-settings"
import { parseTestDefinition } from "./parse-test-definition"
import { parseStudentResults } from "./parse-student-results"
import {
  appendPostPrepareWarnings,
  finalizeImport,
} from "./finalize-import"
import { runTia } from "../index"
import type { AnalysisSet } from "../../types/model"

export interface ImportExcelOptions {
  locale?: ExcelLocale
  doChecks?: boolean
}

function createEmptyAnalysisSet(): AnalysisSet {
  return {
    name: "",
    importWarnings: [],
    missingValueCharacter: "-",
    cutOffScore: null,
    domainSets: [],
    studentGroups: [],
    annotations: {},
    studentCount: 0,
    perGenderCounts: {},
    perStudentGroupCounts: {},
    perDomainItemCounts: {},
    perDomainMaxTotalScore: {},
    items: {},
    maxTotalScore: 0,
    cronbachsAlpha: 0,
    perDomainCronbachsAlphas: {},
    studentResults: {},
    passRate: 0,
    perGenderPassRate: {},
    perStudentGroupPassRate: {},
    scoreDistribution: {
      domainSet: "<all>",
      domain: "<all>",
      all: {},
      byGender: {},
      byStudentGroup: {},
      meanScoreAll: 0,
      meanScoreByGender: {},
      meanScoreByStudentGroup: {},
    },
    perDomainScoreDistribution: {},
    skippedItemsAnalysis: {
      domainSet: "<all>",
      domain: "<all>",
      all: {},
      byGender: {},
      byStudentGroup: {},
    },
    perDomainSkippedItemsAnalysis: {},
  }
}

/**
 * Parses a C-Analysis Excel template into a raw analysis set (no statistics yet).
 * Ported from C# ExcelTiaJobImporter.
 */
export async function importExcelTia(
  data: ArrayBuffer | Uint8Array,
  filename: string,
  options: ImportExcelOptions = {},
): Promise<AnalysisSet> {
  const { doChecks = true } = options
  const locale =
    options.locale ??
    detectLocaleFromFilename(filename) ??
    ("en" as ExcelLocale)
  const strings = getImporterStrings(locale)
  const result = createEmptyAnalysisSet()
  result.hash = computeMd5Hash(data)

  const sheets = await readWorkbook(data)

  const startErrors: string[] = []
  const template = parseSettings(filename, sheets, result, startErrors, strings)
  if (startErrors.length > 0) {
    throw new ImportException(startErrors, strings.errorsParsingStart)
  }

  const testDefinitionErrors: string[] = []
  parseTestDefinition(
    sheets[template.testDefinitionSheetName],
    result,
    testDefinitionErrors,
    template,
    strings,
  )
  if (testDefinitionErrors.length > 0) {
    throw new ImportException(testDefinitionErrors, strings.errorsParsingTestDefinition)
  }

  const studentResultErrors: string[] = []
  parseStudentResults(
    sheets[template.studentResultsSheetName],
    result,
    studentResultErrors,
    template,
    strings,
  )
  if (studentResultErrors.length > 0) {
    throw new ImportException(studentResultErrors, strings.errorsParsingStudentResults)
  }

  return finalizeImport(result, strings, doChecks)
}

/** Parses Excel, runs the full TIA pipeline, and returns a complete analysis set. */
export async function importAndRunTia(
  data: ArrayBuffer | Uint8Array,
  filename: string,
  options: ImportExcelOptions = {},
): Promise<AnalysisSet> {
  const locale =
    options.locale ??
    detectLocaleFromFilename(filename) ??
    ("en" as ExcelLocale)
  const strings = getImporterStrings(locale)
  const raw = await importExcelTia(data, filename, options)
  const analysis = runTia(raw, { annotate: true, locale })
  appendPostPrepareWarnings(analysis, strings)
  return analysis
}

export { ImportException } from "./import-exception"
