import { describe, expect, it } from "vitest"
import { buildAnalysisAiContext } from "./analysis-context"
import type { AnalysisSet } from "@/types/model"

const analysis = {
  name: "Math testset",
  studentCount: 120,
  cutOffScore: 38,
  passRate: 0.4,
  cronbachsAlpha: 0.71,
  meanScore: 25,
  studentGroups: ["AA"],
  domainSets: [{ name: "Rekendomein", domains: ["Getallen"] }],
  perDomainCronbachsAlphas: {},
  perDomainItemCounts: {},
  items: {
    MK001: {
      label: "MK001",
      itemType: 0,
      maxScore: 1,
      key: "A",
      numberOfAlternatives: 4,
      calamity: false,
      domains: ["Rekendomein-Getallen"],
      pValue: 0.53,
      rit: 0.4,
      rir: 0.35,
      percentageCorrect: 53,
      responseDistribution: { all: {}, byGender: {}, byStudentGroup: {}, allSkipped: 0, byGenderSkipped: {}, byStudentGroupSkipped: {} },
      pValuesByGender: {},
      pValuesByStudentGroup: {},
      percentageCorrectByGender: {},
      percentageCorrectByStudentGroup: {},
      distractorPlotData: { data: {} },
      distractorPlotDataByGender: {},
      distractorPlotDataByStudentGroup: {},
      annotations: {},
    },
    MK002: {
      label: "MK002",
      itemType: 0,
      maxScore: 1,
      key: "B",
      numberOfAlternatives: 4,
      calamity: true,
      domains: ["Rekendomein-Getallen"],
      pValue: 0.12,
      rit: 0.05,
      rir: 0.02,
      percentageCorrect: 12,
      responseDistribution: { all: {}, byGender: {}, byStudentGroup: {}, allSkipped: 0, byGenderSkipped: {}, byStudentGroupSkipped: {} },
      pValuesByGender: {},
      pValuesByStudentGroup: {},
      percentageCorrectByGender: {},
      percentageCorrectByStudentGroup: {},
      distractorPlotData: { data: {} },
      distractorPlotDataByGender: {},
      distractorPlotDataByStudentGroup: {},
      annotations: {},
    },
  },
} as unknown as AnalysisSet

describe("buildAnalysisAiContext", () => {
  it("includes assessment summary and item highlights", () => {
    const context = buildAnalysisAiContext(analysis, null)

    expect(context.assessment.name).toBe("Math testset")
    expect(context.items).toHaveLength(2)
    expect(context.highlights.hardestItems[0]).toBe("MK002")
    expect(context.highlights.calamityItems).toEqual(["MK002"])
  })
})
