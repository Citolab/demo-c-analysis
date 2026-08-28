import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { runTia } from "./index"
import { toRawAnalysis } from "./test-fixtures"
import type { AnalysisSet } from "../types/model"

const fixturePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../public/data/analysis.json",
)

function loadReferenceAnalysis(): AnalysisSet {
  return JSON.parse(readFileSync(fixturePath, "utf8")) as AnalysisSet
}

function expectClose(actual: number, expected: number, precision = 6) {
  expect(actual).toBeCloseTo(expected, precision)
}

function expectRecordClose(
  actual: Record<string, number>,
  expected: Record<string, number>,
  precision = 6,
) {
  for (const key of Object.keys(expected)) {
    expectClose(actual[key] ?? actual[Number(key)], expected[key], precision)
  }
}

describe("runTia integration", () => {
  const reference = loadReferenceAnalysis()
  const computed = runTia(toRawAnalysis(reference))

  it("matches overall assessment metrics", () => {
    expect(computed.studentCount).toBe(reference.studentCount)
    expectClose(computed.testScoreVariance ?? 0, reference.testScoreVariance ?? 0)
    expectClose(computed.cronbachsAlpha, reference.cronbachsAlpha)
    expectClose(computed.passRate, reference.passRate)
    expectClose(computed.maxTotalScore, reference.maxTotalScore)
    expect(computed.perGenderCounts).toEqual(reference.perGenderCounts)
    expect(computed.perStudentGroupCounts).toEqual(reference.perStudentGroupCounts)
  })

  it("matches MK001 item statistics", () => {
    const item = computed.items.MK001
    const expected = reference.items.MK001

    expectClose(item.pValue, expected.pValue)
    expectClose(item.rit, expected.rit, 5)
    expectClose(item.rir, expected.rir, 5)
    expectClose(item.percentageCorrect, expected.percentageCorrect)
    expect(item.responseDistribution.all).toEqual(expected.responseDistribution.all)
    expectRecordClose(
      item.distractorPlotData.data.A,
      expected.distractorPlotData.data.A,
      4,
    )
    expectClose(item.skippedItemAnalysis?.all ?? 0, expected.skippedItemAnalysis?.all ?? 0)
  })

  it("matches OV005 response distribution and p-value", () => {
    const item = computed.items.OV005
    const expected = reference.items.OV005

    expectClose(item.pValue, expected.pValue)
    expect(item.responseDistribution.all).toEqual(expected.responseDistribution.all)
    expectClose(item.percentageCorrect, expected.percentageCorrect)
  })

  it("computes non-zero prescored distractor plot data for OV005", () => {
    const plot = computed.items.OV005.distractorPlotData.data
    const hasData = Object.values(plot).some((groups) =>
      Object.values(groups).some((value) => value > 0),
    )

    expect(hasData).toBe(true)
    const totalShare = Object.values(plot).reduce(
      (sum, groups) => sum + Object.values(groups).reduce((inner, value) => inner + value, 0),
      0,
    )
    expect(totalShare).toBeGreaterThan(100)
  })

  it("generates item-level annotations for MK001", () => {
    const annotations = computed.items.MK001.annotations["item-pvalue-plot"] ?? []
    const expected = reference.items.MK001.annotations["item-pvalue-plot"] ?? []

    expect(annotations.length).toBe(expected.length)
    expect(annotations.map((entry) => entry.text).sort()).toEqual(
      expected.map((entry) => entry.text).sort(),
    )
  })

  it("generates assessment-level reliability warnings", () => {
    const annotations =
      computed.annotations["assessment-reliability-plot"] ?? []
    expect(annotations.length).toBeGreaterThan(0)
  })
})
