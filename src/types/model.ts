export type GroupingType = "total" | "gender" | "group"

export type PlotType =
  | "assessment-pvalues-plot"
  | "assessment-reliability-plot"
  | "assessment-passrate-plot"
  | "assessment-scoredistribution-plot"
  | "assessment-skippeditems-plot"
  | "item-pvalue-plot"
  | "item-distractor-plot"
  | "item-skipped-plot"
  | "item-responsedistribution-plot"

export const ItemType = {
  MultipleChoice: 0,
  Prescored: 1,
} as const

export type ItemType = (typeof ItemType)[keyof typeof ItemType]

export const Gender = {
  Male: 0,
  Female: 1,
  UnknownOrOther: 2,
} as const

export type Gender = (typeof Gender)[keyof typeof Gender]

export const GenderKey = {
  [Gender.Male]: "Male",
  [Gender.Female]: "Female",
  [Gender.UnknownOrOther]: "UnknownOrOther",
} as const

export interface Domain {
  name: string
  parent: string
}

export interface DomainSet {
  name: string
  domains: string[]
}

export interface Annotation {
  byGender: boolean
  byStudentGroup: boolean
  byDomain: boolean
  showPlot: boolean
  text: string
  domain: string | null
}

export interface DistractorPlotData {
  data: Record<string, Record<string, number>>
}

export interface ResponseDistribution {
  all: Record<string, number>
  byGender: Record<string, Record<string, number>>
  byStudentGroup: Record<string, Record<string, number>>
  allSkipped: number
  byGenderSkipped: Record<string, number>
  byStudentGroupSkipped: Record<string, number>
}

export interface ItemSkippedAnalysis {
  domainSet: string
  domain: string
  all: number
  byGender: Record<string, number>
  byStudentGroup: Record<string, number>
}

export interface ItemMetaData {
  label: string
  itemType: ItemType
  maxScore: number
  key: string
  numberOfAlternatives: number
  responses?: string[]
  calamity: boolean
  domains: string[]
  responseDistribution: ResponseDistribution
  rit: number
  rir: number
  rars?: Record<string, number>
  pValue: number
  pValuesByGender: Record<string, number | string>
  pValuesByStudentGroup: Record<string, number>
  percentageCorrect: number
  percentageCorrectByGender: Record<string, number>
  percentageCorrectByStudentGroup: Record<string, number>
  distractorPlotData: DistractorPlotData
  distractorPlotDataByGender: Record<string, DistractorPlotData>
  distractorPlotDataByStudentGroup: Record<string, DistractorPlotData>
  skippedItemAnalysis?: ItemSkippedAnalysis
  skippedItemAnalysisByDomain?: Record<string, ItemSkippedAnalysis>
  annotations: Record<string, Annotation[]>
}

export interface SkippedItemsAnalysis {
  domainSet: string
  domain: string
  all: Record<number, number>
  byGender: Record<string, Record<number, number>>
  byStudentGroup: Record<string, Record<number, number>>
}

export interface ScoreDistribution {
  domainSet: string
  domain: string
  all: Record<number, number>
  byGender: Record<string, Record<number, number>>
  byStudentGroup: Record<string, Record<number, number>>
  meanScoreAll: number
  meanScoreByGender: Record<string, number>
  meanScoreByStudentGroup: Record<string, number>
}

export interface ItemResult {
  missing: boolean
  response: string | null
  score: number
  responseDistribution?: Record<string, number>
}

export interface StudentResult {
  studentIdentifier: string
  gender: Gender
  group: string
  itemResults: Record<string, ItemResult>
  totalScore: number
}

export interface AnalysisSet {
  id?: string
  name: string
  importWarnings: string[]
  missingValueCharacter?: string
  hash?: string
  ignoreUnknownOrOtherGender?: boolean
  cutOffScore: number | null
  domainSets: DomainSet[]
  studentGroups: string[]
  annotations: Record<string, Annotation[]>
  studentCount: number
  perGenderCounts: Record<string, number>
  perStudentGroupCounts: Record<string, number>
  perDomainItemCounts: Record<string, number>
  perDomainMaxTotalScore: Record<string, number>
  items: Record<string, ItemMetaData>
  maxTotalScore: number
  testScores?: number[]
  testScoreVariance?: number
  cronbachsAlpha: number
  perDomainCronbachsAlphas: Record<string, number>
  studentResults: Record<string, StudentResult>
  passRate: number
  perGenderPassRate: Record<string, number>
  perStudentGroupPassRate: Record<string, number>
  scoreDistribution: ScoreDistribution
  perDomainScoreDistribution: Record<string, ScoreDistribution>
  meanScore?: number
  perGenderMeanScore?: Record<string, number>
  perStudentGroupMeanScore?: Record<string, number>
  skippedItemsAnalysis: SkippedItemsAnalysis
  perDomainSkippedItemsAnalysis: Record<string, SkippedItemsAnalysis>
}
