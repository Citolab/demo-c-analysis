import type { ExcelLocale } from "./excel-template-strings"

export interface ImporterStrings {
  errorsParsingStart: string
  errorsParsingTestDefinition: string
  errorsParsingStudentResults: string
  errorsCheckingCounts: string
  minimumStudentCount3: string
  minimumItemCount3: string
  settingMissingName: string
  settingEmptyName: string
  settingMissingCutoffScore: string
  settingErrorCutoffScore: (message: string) => string
  settingEmptyCutoffScore: string
  settingMissingStudentGroups: string
  settingInvalidStudentGroup: string
  settingEmptyStudentGroups: string
  settingMissingDomains: string
  settingNonUniqueDomains: (name: string) => string
  settingInvalidDomain1: string
  settingInvalidDomain2: string
  settingEmptyDomain: (name: string) => string
  columnHeadersError: string
  itemLabelNotUnique: (label: string) => string
  itemLabelErrorRow: (row: number) => string
  itemTypeErrorRow: (label: string, row: number) => string
  maxScoreErrorMcItem: (label: string, row: number) => string
  maxScoreErrorItem: (label: string, row: number) => string
  keyErrorMcItem: (label: string, row: number) => string
  keyErrorPsItem: (label: string, row: number) => string
  keyErrorItem: (label: string, row: number) => string
  alternativesErrorMcItem: (label: string, row: number) => string
  alternativesErrorPsItem: (label: string, row: number) => string
  alternativesNanMcItem: (label: string, row: number) => string
  alternativesErrorItem: (label: string, row: number) => string
  calamityErrorItem: (label: string, row: number) => string
  domainEmptyItem: (domainSet: string, label: string, row: number) => string
  domainErrorItem: (domainSet: string, label: string, row: number) => string
  baseColumnHeadersError: string
  columnHeaderExpectedAt: (header: string, column: string) => string
  studentIdentifierNotUnique: (id: string) => string
  studentIdentifierErrorRow: (row: number) => string
  genderErrorStudent: (id: string, row: number) => string
  studentGroupMissing: (id: string, row: number) => string
  studentGroupError: (id: string, row: number) => string
  itemScoreBoundsError: (id: string, row: number, maxScore: number) => string
  itemScoreError: (id: string, row: number) => string
  totalLessThan7Items: string
  domainLessThan7Items: (domain: string) => string
  totalLessThan15Students: string
  groupLessThan15Students: (group: string) => string
  genderLessThan15Students: (gender: string) => string
  templateLanguageUndetermined: string
}

const en: ImporterStrings = {
  errorsParsingStart: "Errors while parsing the Start sheet.",
  errorsParsingTestDefinition: "Errors while parsing the Test Definition sheet.",
  errorsParsingStudentResults: "Errors while parsing the Student results sheet.",
  errorsCheckingCounts: "Errors while checking student and item counts.",
  minimumStudentCount3:
    "The minimum number of students necessary for meaningful analyses is 3.",
  minimumItemCount3:
    "The minimum number of questions necessary for meaningful analyses is 3.",
  settingMissingName: "Setting not found: 'Name of this analysis set'",
  settingEmptyName: "Setting is empty: 'Name of this analysis set'",
  settingMissingCutoffScore: "Setting not found: 'Points required to pass'",
  settingErrorCutoffScore: (message) =>
    `Wrong setting: 'Points required to pass'. Error: ${message}`,
  settingEmptyCutoffScore: "A cut-off score (points required to pass) was not provided.",
  settingMissingStudentGroups: "Settings not found: Student groups.",
  settingInvalidStudentGroup: "Student groups: 'No group' is not a valid student group.",
  settingEmptyStudentGroups: "No student groups defined.",
  settingMissingDomains: "Settings not found: Domain 1 and Domain 2",
  settingNonUniqueDomains: (name) => `Domains must not have the same name. (${name})`,
  settingInvalidDomain1: "Domain 1: 'No domain' is not a valid domain.",
  settingInvalidDomain2: "Domain 2: 'No domain' is not a valid domain.",
  settingEmptyDomain: (name) => `No subdomains specified for domain ${name}`,
  columnHeadersError: "The column headers are incorrect.",
  itemLabelNotUnique: (label) => `item label '${label}' was used more than once.`,
  itemLabelErrorRow: (row) => `The item label is incorrectly specified for item on row ${row}`,
  itemTypeErrorRow: (label, row) =>
    `The item type is incorrectly specified for item with label ${label} (row ${row})`,
  maxScoreErrorMcItem: (label, row) =>
    `The max score is incorrectly specified for multiple choice item with label ${label} (row ${row}). The max score should be 1.`,
  maxScoreErrorItem: (label, row) =>
    `The max score is incorrectly specified for item with label ${label} (row ${row})`,
  keyErrorMcItem: (label, row) =>
    `The key for multiple choice item with label '${label}' (row ${row}) is incorrectly specified.`,
  keyErrorPsItem: (label, row) =>
    `A key was provided for prescored item with label '${label}' (row ${row}).`,
  keyErrorItem: (label, row) =>
    `The key for item with label '${label}' (row ${row}) is incorrectly specified.`,
  alternativesErrorMcItem: (label, row) =>
    `The number of alternatives for multiple choice item with label '${label}' (row ${row}) is incorrectly specified.`,
  alternativesErrorPsItem: (label, row) =>
    `The number of alternatives for prescored item with label '${label}' (row ${row}) is incorrectly specified.`,
  alternativesNanMcItem: (label, row) =>
    `The number of alternatives for multiple choice item with label '${label}' (row ${row}) is incorrectly specified (not a number).`,
  alternativesErrorItem: (label, row) =>
    `The number of alternatives for item with label '${label}' (row ${row}) is incorrectly specified.`,
  calamityErrorItem: (label, row) =>
    `The calamity value for item with label '${label}' (row ${row}) is incorrectly specified.`,
  domainEmptyItem: (domainSet, label, row) =>
    `No subdomain '${domainSet}' was specified for item with label '${label}' (row ${row})`,
  domainErrorItem: (domainSet, label, row) =>
    `Subdomain '${domainSet}' for item with label '${label}' (row ${row}) is incorrectly specified.`,
  baseColumnHeadersError: "The base column headers are incorrect.",
  columnHeaderExpectedAt: (header, column) =>
    `Expected column header '${header}' at column ${column}`,
  studentIdentifierNotUnique: (id) => `Student identifier '${id}' was used more than once.`,
  studentIdentifierErrorRow: (row) =>
    `The student identifier is incorrectly specified for the student on row ${row}`,
  genderErrorStudent: (id, row) =>
    `The gender is incorrectly specified for student '${id}' (row ${row})`,
  studentGroupMissing: (id, row) =>
    `No student group was specified for student '${id}' (row ${row})`,
  studentGroupError: (id, row) =>
    `Group for student '${id}' (row ${row}) is incorrectly specified.`,
  itemScoreBoundsError: (id, row, maxScore) =>
    `Item score for student '${id}' (row ${row}) is not within the bounds of 0 and ${maxScore}.`,
  itemScoreError: (id, row) =>
    `Item score for student '${id}' (row ${row}) is incorrectly specified.`,
  totalLessThan7Items:
    "The total number of questions in this set is less than 7, so some analyses will not be meaningful.",
  domainLessThan7Items: (domain) =>
    `Domain '${domain}' has less that 7 questions, so some analyses will not be meaningful.`,
  totalLessThan15Students:
    "The total student count is less than 15, so most analyses will not be meaningful.",
  groupLessThan15Students: (group) =>
    `Student group '${group}' has less than 15 students, so some analyses for this group will not be meaningful.`,
  genderLessThan15Students: (gender) =>
    `Gender group '${gender}' has less than 15 students, so some analyses for this group will not be meaningful.`,
  templateLanguageUndetermined:
    "The template language of this Excel file could not be determined (should be NL or EN in cell B1).",
}

const nl: ImporterStrings = {
  errorsParsingStart: "Er zijn fouten opgetreden bij het inlezen van het 'Start'-tabblad.",
  errorsParsingTestDefinition:
    "Er zijn fouten opgetreden bij het inlezen van het 'Toetsdefinitie'-tabblad.",
  errorsParsingStudentResults:
    "Er zijn fouten opgetreden bij het inlezen van het 'Toetsresultaten'-tabblad.",
  errorsCheckingCounts:
    "Er zijn fouten opgetreden bij het controleren van de leerling- en itemaantallen.",
  minimumStudentCount3: "Analyses kunnen niet worden gedaan met minder dan 3 leerlingen.",
  minimumItemCount3: "Analyses kunnen niet worden gedaan met minder dan 3 opgaven.",
  settingMissingName: "Instelling niet gevonden: 'Naam van deze analyseset'",
  settingEmptyName: "Instelling is leeg: 'Naam van deze analyseset'",
  settingMissingCutoffScore: "Instelling niet gevonden: 'Cesuur'",
  settingErrorCutoffScore: (message) =>
    `Fout bij instelling: 'Cesuur'. Foutmelding: ${message}`,
  settingEmptyCutoffScore: "Een cesuur is niet opgegeven.",
  settingMissingStudentGroups: "Instelling niet gevonden: 'Leerlinggroepen'.",
  settingInvalidStudentGroup:
    "Leerlinggroepen: 'No group' is niet een geldige leerlinggroep.",
  settingEmptyStudentGroups: "Geen leerlinggroepen gedefiniëerd.",
  settingMissingDomains: "Instelling niet gevonden: Domein 1 and Domein 2",
  settingNonUniqueDomains: (name) => `Domeinen mogen niet dezelfde naam hebben. (${name})`,
  settingInvalidDomain1: "Domein 1: 'No domain' is niet een geldig domein.",
  settingInvalidDomain2: "Domein 2: 'No domain' is niet een geldig domein.",
  settingEmptyDomain: (name) => `Geen subdomeinen gedefiniëerd voor domein ${name}.`,
  columnHeadersError: "De kolomkoppen (headers) zijn anders dan in de template.",
  itemLabelNotUnique: (label) => `Itemlabel '${label}' wordt meer dan één keer gebruikt.`,
  itemLabelErrorRow: (row) => `Het itemlabel is foutief voor het item op rij ${row}.`,
  itemTypeErrorRow: (label, row) =>
    `Het itemtype is foutief voor het item met label '${label}' (rij ${row})`,
  maxScoreErrorMcItem: (label, row) =>
    `De max score is foutief voor het meerkeuze-item met label '${label}' (rij ${row}). De max score moet 1 zijn.`,
  maxScoreErrorItem: (label, row) =>
    `De max score is foutief voor het item met label '${label}' (rij ${row})`,
  keyErrorMcItem: (label, row) =>
    `De sleutel voor het meerkeuze-item met label '${label}' (rij ${row}) is foutief.`,
  keyErrorPsItem: (label, row) =>
    `Er is een sleutel ingevoegd voor het voorafgescoorde item met label '${label}' (rij ${row}).`,
  keyErrorItem: (label, row) =>
    `De sleutel voor het item met label '${label}' (rij ${row}) is foutief.`,
  alternativesErrorMcItem: (label, row) =>
    `Het aantal alternatieven voor het meerkeuze-item met label '${label}' (rij ${row}) is foutief.`,
  alternativesErrorPsItem: (label, row) =>
    `Het aantal alternatieven voor het voorafgescoorde item met label '${label}' (rij ${row}) is foutief.`,
  alternativesNanMcItem: (label, row) =>
    `Het aantal alternatieven voor het meerkeuze-item met label '${label}' (rij ${row}) is foutief (het is geen geheel getal).`,
  alternativesErrorItem: (label, row) =>
    `Het aantal alternatieven voor het item met label '${label}' (rij ${row}) is foutief.`,
  calamityErrorItem: (label, row) =>
    `De 'calamiteit'-waarde voor het item met label '${label}' (rij ${row}) is foutief.`,
  domainEmptyItem: (domainSet, label, row) =>
    `Geen subdomein van '${domainSet}' gespecificeerd voor item met label '${label}' (rij ${row}).`,
  domainErrorItem: (domainSet, label, row) =>
    `Subdomein van '${domainSet}' voor item met label '${label}' (rij ${row}) is foutief.`,
  baseColumnHeadersError:
    "De eerste kolomkoppen (leerling,geslacht,groep) zijn anders dan in de template.",
  columnHeaderExpectedAt: (header, column) =>
    `Kolomkop '${header}' verwacht bij kolom ${column}.`,
  studentIdentifierNotUnique: (id) =>
    `Leerlingidentificatie '${id}' wordt meer dan één keer gebruikt.`,
  studentIdentifierErrorRow: (row) => `De leerlingidentificatie is fout op rij ${row}.`,
  genderErrorStudent: (id, row) =>
    `Het geslacht is foutief gespecificeerd voor leerling ${id} (rij ${row}).`,
  studentGroupMissing: (id, row) =>
    `Geen leerlinggroep gespecificeerd voor leerling '${id}' (rij ${row}).`,
  studentGroupError: (id, row) =>
    `De leerlinggroep voor leerling '${id}' (rij ${row}) is foutief gespecificeerd.`,
  itemScoreBoundsError: (id, row, maxScore) =>
    `De itemscore voor leerling ${id} (rij ${row}) is niet tussen 0 en ${maxScore}.`,
  itemScoreError: (id, row) =>
    `De itemscore voor leerling ${id} (rij ${row}) is foutief gespecificeerd.`,
  totalLessThan7Items:
    "Het totale aantal vragen is minder dan 7, dus sommige analyses zijn niet betekenisvol.",
  domainLessThan7Items: (domain) =>
    `Domein '${domain}' heeft minder dan 7 vragen, dus sommige analyses zijn niet betekenisvol.`,
  totalLessThan15Students:
    "Het totale aantal leerlingen is minder dan 15, dus de meeste analyses zijn niet betekenisvol.",
  groupLessThan15Students: (group) =>
    `Leerlinggroep '${group}' heeft minder dan 15 leerlingen, dus sommige analyses zijn niet betekenisvol.`,
  genderLessThan15Students: (gender) =>
    `Geslacht '${gender}' heeft minder dan 15 leerlingen, dus sommige analyses zijn niet betekenisvol.`,
  templateLanguageUndetermined:
    "De taal van dit Excel-bestand kon niet worden bepaald (cel B1 moet NL of EN bevatten).",
}

const stringsByLocale: Record<ExcelLocale, ImporterStrings> = { en, nl }

export function getImporterStrings(locale: ExcelLocale): ImporterStrings {
  return stringsByLocale[locale] ?? en
}
