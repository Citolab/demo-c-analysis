export type ExcelLocale = "en" | "nl"

export interface ExcelTemplateStrings {
  testDefinitionSheetName: string
  studentResultsSheetName: string
  groupsHeader: string
  domain1Header: string
  domain2Header: string
  headerItemLabel: string
  headerItemType: string
  headerMaxScore: string
  headerKey: string
  headerAlternatives: string
  headerCalamity: string
  headerDomain1: string
  headerDomain2: string
  optionMc: string
  optionPrescored: string
  optionYes: string
  optionNo: string
  headerStudent: string
  headerGender: string
  headerGroup: string
  optionGenderMale: string
  optionGenderFemale: string
  optionGenderUnknownOther: string
  settingName: string
  settingCutoffScore: string
}

const en: ExcelTemplateStrings = {
  testDefinitionSheetName: "Test definition",
  studentResultsSheetName: "Student results",
  groupsHeader: "Groups (max 4)",
  domain1Header: "Domain 1 (max 5)",
  domain2Header: "Domain 2 (max 5)",
  headerItemLabel: "Item label",
  headerItemType: "Item type",
  headerMaxScore: "Max score",
  headerKey: "Key",
  headerAlternatives: "#alternatives",
  headerCalamity: "Calamity",
  headerDomain1: "Domain 1",
  headerDomain2: "Domain 2",
  optionMc: "Multiple choice",
  optionPrescored: "Prescored",
  optionYes: "yes",
  optionNo: "no",
  headerStudent: "student",
  headerGender: "gender",
  headerGroup: "group",
  optionGenderMale: "Male",
  optionGenderFemale: "Female",
  optionGenderUnknownOther: "Unknown/other",
  settingName: "Name for this analysis set",
  settingCutoffScore: "Points required to pass",
}

const nl: ExcelTemplateStrings = {
  testDefinitionSheetName: "Toetsdefinitie",
  studentResultsSheetName: "Toetsresultaten",
  groupsHeader: "Groepen (max 4)",
  domain1Header: "Domein 1 (max 5)",
  domain2Header: "Domein 2 (max 5)",
  headerItemLabel: "Itemlabel",
  headerItemType: "Itemtype",
  headerMaxScore: "Max score",
  headerKey: "Sleutel",
  headerAlternatives: "#alternatieven",
  headerCalamity: "Calamiteit",
  headerDomain1: "Domein 1",
  headerDomain2: "Domein 2",
  optionMc: "Multiple choice",
  optionPrescored: "Voorgescoord",
  optionYes: "ja",
  optionNo: "nee",
  headerStudent: "leerling",
  headerGender: "geslacht",
  headerGroup: "groep",
  optionGenderMale: "Man",
  optionGenderFemale: "Vrouw",
  optionGenderUnknownOther: "Onbekend/anders",
  settingName: "Naam van deze analyseset",
  settingCutoffScore: "Cesuur",
}

export function getExcelTemplateStrings(locale: ExcelLocale): ExcelTemplateStrings {
  return locale === "nl" ? nl : en
}

export function detectLocaleFromFilename(filename: string): ExcelLocale | null {
  const base = filename.replace(/\.[^.]+$/, "").trim().toLowerCase()
  const withoutParens = base.includes("(") ? base.slice(0, base.lastIndexOf("(")).trim() : base
  if (withoutParens.endsWith("nl")) return "nl"
  if (withoutParens.endsWith("en")) return "en"
  return null
}
