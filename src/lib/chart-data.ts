import {
  allGroupsColor,
  genderColors,
  groupColors,
} from "@/lib/colors"
import { createRange, fullDomainName, sortBy, sum } from "@/lib/helpers"
import type {
  AnalysisSet,
  Annotation,
  Domain,
  GroupingType,
  ItemMetaData,
  PlotType,
} from "@/types/model"
import { Gender, GenderKey } from "@/types/model"
import { isPrescoredItem } from "@/lib/qti-item-stats"

const genders = [
  { key: GenderKey[Gender.Male], labelKey: "GENERAL_GENDER_MALE" as const },
  { key: GenderKey[Gender.Female], labelKey: "GENERAL_GENDER_FEMALE" as const },
]

export function getStudentGroups(analysis: AnalysisSet) {
  return analysis.studentGroups.filter(
    (group) => group.toLowerCase() !== "no group",
  )
}

export function getVisibleAnnotations(
  annotations: Record<string, Annotation[]> | undefined,
  plotType: PlotType,
  grouping: GroupingType,
  selectedDomain: Domain | null,
) {
  const list = annotations?.[plotType] ?? []
  return list.filter((annotation) => {
    if (!annotation.showPlot) return false
    if (annotation.byGender && grouping !== "gender") return false
    if (annotation.byStudentGroup && grouping !== "group") return false
    if (annotation.byDomain && !selectedDomain) return false
    if (
      annotation.byDomain &&
      selectedDomain &&
      annotation.domain &&
      annotation.domain !== fullDomainName(selectedDomain)
    ) {
      return false
    }
    return true
  })
}

export function buildPValueChart(
  analysis: AnalysisSet,
  grouping: GroupingType,
  selectedDomain: Domain | null,
  sort: "default" | "p-value",
  labels: Record<string, string>,
) {
  const domainKey = fullDomainName(selectedDomain)
  let items = domainKey
    ? Object.values(analysis.items).filter((item) =>
        item.domains.includes(domainKey),
      )
    : Object.values(analysis.items)

  if (sort === "p-value") {
    items = sortBy(items, (item) => item.pValue, true)
  }

  const groups = getStudentGroups(analysis)
  const series =
    grouping === "total"
      ? [
          {
            name: labels.allStudents,
            color: allGroupsColor,
            values: items.map((item) => +(item.pValue * 100).toFixed(2)),
          },
        ]
      : grouping === "gender"
        ? genders.map((gender, index) => ({
            name: labels[gender.labelKey],
            color: genderColors[index],
            values: items.map((item) => {
              const value = item.pValuesByGender[gender.key]
              return typeof value === "number" ? +(value * 100).toFixed(2) : 0
            }),
          }))
        : groups.map((group, index) => ({
            name: group,
            color: groupColors[index % groupColors.length],
            values: items.map(
              (item) => +(item.pValuesByStudentGroup[group] * 100).toFixed(2),
            ),
          }))

  const averages = series.map((entry) =>
    entry.values.length
      ? Math.round(sum(entry.values) / entry.values.length)
      : 0,
  )

  return {
    items: items.map((item) => item.label),
    series,
    averages,
  }
}

export function buildStudentScoreChart(
  analysis: AnalysisSet,
  grouping: GroupingType,
  selectedDomain: Domain | null,
  labels: Record<string, string>,
) {
  const domainKey = fullDomainName(selectedDomain)
  const scoreDistribution = domainKey
    ? analysis.perDomainScoreDistribution[domainKey]
    : analysis.scoreDistribution

  const groups = getStudentGroups(analysis)
  const series =
    grouping === "total"
      ? [
          {
            name: labels.allStudents,
            color: allGroupsColor,
            scores: Object.entries(scoreDistribution.all).map(([score, count]) => ({
              score: +score,
              count,
            })),
          },
        ]
      : grouping === "gender"
        ? genders.map((gender, index) => ({
            name: labels[gender.labelKey],
            color: genderColors[index],
            scores: Object.entries(scoreDistribution.byGender[gender.key] ?? {}).map(
              ([score, count]) => ({ score: +score, count }),
            ),
          }))
        : groups.map((group, index) => ({
            name: group,
            color: groupColors[index % groupColors.length],
            scores: Object.entries(
              scoreDistribution.byStudentGroup[group] ?? {},
            ).map(([score, count]) => ({ score: +score, count })),
          }))

  const allScores = series.flatMap((entry) => entry.scores.map((s) => s.score))
  const minValue = allScores.length ? Math.min(...allScores) : 0
  const maxValue = domainKey
    ? analysis.perDomainMaxTotalScore[domainKey]
    : analysis.maxTotalScore
  const min = domainKey
    ? minValue
    : Math.min(minValue, Math.floor(analysis.cutOffScore ?? minValue))
  const max = domainKey
    ? maxValue
    : Math.max(maxValue, Math.ceil(analysis.cutOffScore ?? maxValue))

  const labelsAxis = createRange(min, max)
  const chartData = labelsAxis.map((score) => {
    const row: Record<string, number | string> = { score: String(score) }
    for (const entry of series) {
      row[entry.name] =
        entry.scores.find((value) => value.score === score)?.count ?? 0
    }
    return row
  })

  const referenceLines = series.map((entry) => {
    const total = sum(entry.scores.map((value) => value.count))
    const weighted = sum(entry.scores.map((value) => value.score * value.count))
    return {
      name: entry.name,
      color: entry.color,
      average: total ? +(weighted / total).toFixed(2) : 0,
    }
  })

  return {
    chartData,
    series,
    referenceLines,
    cutOffScore: selectedDomain ? null : analysis.cutOffScore,
  }
}

export function buildPassRateChart(
  analysis: AnalysisSet,
  grouping: GroupingType,
  labels: Record<string, string>,
) {
  const groups = getStudentGroups(analysis)

  if (grouping === "total") {
    return [
      {
        name: labels.allStudents,
        value: +(analysis.passRate * 100).toFixed(2),
        color: allGroupsColor,
      },
    ]
  }

  if (grouping === "gender") {
    return genders.map((gender, index) => ({
      name: labels[gender.labelKey],
      value: +((analysis.perGenderPassRate[gender.key] ?? 0) * 100).toFixed(2),
      color: genderColors[index],
    }))
  }

  return groups.map((group, index) => ({
    name: group,
    value: +((analysis.perStudentGroupPassRate[group] ?? 0) * 100).toFixed(2),
    color: groupColors[index % groupColors.length],
  }))
}

export function buildSkippedItemsChart(
  analysis: AnalysisSet,
  grouping: GroupingType,
  selectedDomain: Domain | null,
  labels: Record<string, string>,
) {
  const domainKey = fullDomainName(selectedDomain)
  const skippedData = domainKey
    ? analysis.perDomainSkippedItemsAnalysis[domainKey]
    : analysis.skippedItemsAnalysis

  const groups = getStudentGroups(analysis)

  if (grouping === "total") {
    return {
      labels: Object.keys(skippedData.all),
      series: [
        {
          name: labels.allStudents,
          color: allGroupsColor,
          values: Object.values(skippedData.all),
        },
      ],
    }
  }

  if (grouping === "gender") {
    const labelsAxis = genders
      .flatMap((gender) => Object.keys(skippedData.byGender[gender.key] ?? {}))
      .filter((value, index, self) => self.indexOf(value) === index)

    return {
      labels: labelsAxis,
      series: genders.map((gender, index) => ({
        name: labels[gender.labelKey],
        color: genderColors[index],
        values: labelsAxis.map(
          (label) => skippedData.byGender[gender.key]?.[+label] ?? 0,
        ),
      })),
    }
  }

  const labelsAxis = groups
    .flatMap((group) => Object.keys(skippedData.byStudentGroup[group] ?? {}))
    .filter((value, index, self) => self.indexOf(value) === index)

  return {
    labels: labelsAxis,
    series: groups.map((group, index) => ({
      name: group,
      color: groupColors[index % groupColors.length],
      values: labelsAxis.map(
        (label) => skippedData.byStudentGroup[group]?.[+label] ?? 0,
      ),
    })),
  }
}

export function getCronbachAlpha(
  analysis: AnalysisSet,
  selectedDomain: Domain | null,
) {
  const domainKey = fullDomainName(selectedDomain)
  const value = domainKey
    ? analysis.perDomainCronbachsAlphas[domainKey]
    : analysis.cronbachsAlpha

  return Number.isNaN(value) ? 0 : +value.toFixed(2)
}

export function buildItemCharts(
  item: ItemMetaData,
  grouping: GroupingType,
  groups: string[],
  labels: Record<string, string>,
) {
  const responseLabels = Object.keys(item.responseDistribution.all)

  const responseDistribution =
    grouping === "total"
      ? [
          {
            name: labels.allStudents,
            color: allGroupsColor,
            values: responseLabels.map(
              (label) => item.responseDistribution.all[label] ?? 0,
            ),
          },
        ]
      : grouping === "gender"
        ? genders.map((gender, index) => ({
            name: labels[gender.labelKey],
            color: genderColors[index],
            values: responseLabels.map(
              (label) =>
                item.responseDistribution.byGender[gender.key]?.[label] ?? 0,
            ),
          }))
        : groups.map((group, index) => ({
            name: group,
            color: groupColors[index % groupColors.length],
            values: responseLabels.map(
              (label) =>
                item.responseDistribution.byStudentGroup[group]?.[label] ?? 0,
            ),
          }))

  const percentageCorrect =
    grouping === "total"
      ? [
          {
            name: labels.allStudents,
            value: Math.round(item.percentageCorrect * 100),
            color: allGroupsColor,
          },
        ]
      : grouping === "gender"
        ? genders.map((gender, index) => ({
            name: labels[gender.labelKey],
            value: Math.round(
              (item.percentageCorrectByGender[gender.key] ?? 0) * 100,
            ),
            color: genderColors[index],
          }))
        : groups.map((group, index) => ({
            name: group,
            value: Math.round(
              (item.percentageCorrectByStudentGroup[group] ?? 0) * 100,
            ),
            color: groupColors[index % groupColors.length],
          }))

  const skipped =
    grouping === "total"
      ? [
          {
            name: labels.allStudents,
            value: Math.round(item.responseDistribution.allSkipped),
            color: allGroupsColor,
          },
        ]
      : grouping === "gender"
        ? genders.map((gender, index) => ({
            name: labels[gender.labelKey],
            value: item.responseDistribution.byGenderSkipped[gender.key] ?? 0,
            color: genderColors[index],
          }))
        : groups.map((group, index) => ({
            name: group,
            value: Math.round(
              (item.responseDistribution.byStudentGroupSkipped[group] ?? 0) *
                100,
            ),
            color: groupColors[index % groupColors.length],
          }))

  const distractorSource =
    grouping === "total"
      ? [{ name: "all", color: allGroupsColor, data: item.distractorPlotData }]
      : grouping === "gender"
        ? genders.map((gender, index) => ({
            name: labels[gender.labelKey],
            color: genderColors[index],
            data: item.distractorPlotDataByGender[gender.key] ?? { data: {} },
          }))
        : groups.map((group, index) => ({
            name: group,
            color: groupColors[index % groupColors.length],
            data: item.distractorPlotDataByStudentGroup[group] ?? { data: {} },
          }))

  const distractorValues = Object.values(distractorSource[0]?.data.data ?? {})
  const scoreGroups =
    distractorValues.length > 0 ? Object.keys(distractorValues[0]) : []

  const distractorSeries = distractorSource.map((entry) => ({
    name: entry.name,
    color: entry.color,
    lines: Object.entries(entry.data.data).map(([alternative, values]) => ({
      alternative,
      isKey: item.key.includes(alternative),
      points: scoreGroups.map((group) => ({
        group,
        value: +(values[group] ?? 0).toFixed(2),
      })),
    })),
  }))

  return {
    responseLabels,
    responseDistribution,
    percentageCorrect,
    skipped,
    distractorSeries,
    scoreGroups,
  }
}

export function buildItemPerformanceSummary(
  item: ItemMetaData,
  studentCount: number,
  grouping: GroupingType,
  groups: string[],
  labels: Record<string, string>,
  percentageCorrect: { name: string; value: number; color: string }[],
  skipped: { name: string; value: number; color: string }[],
) {
  if (!isPrescoredItem(item)) {
    return percentageCorrect.map((entry, index) => {
      const skippedValue = skipped[index]?.value ?? 0
      const correct = entry.value
      const incorrect = Math.max(0, 100 - correct - skippedValue)

      return {
        name: entry.name,
        color: entry.color,
        correct,
        partiallyCorrect: 0,
        incorrect,
        skipped: skippedValue,
        prescored: false,
      }
    })
  }

  const sources =
    grouping === "total"
      ? [
          {
            name: labels.allStudents,
            color: allGroupsColor,
            distribution: item.responseDistribution.all,
          },
        ]
      : grouping === "gender"
        ? genders.map((gender, index) => ({
            name: labels[gender.labelKey],
            color: genderColors[index],
            distribution: item.responseDistribution.byGender[gender.key] ?? {},
          }))
        : groups.map((group, index) => ({
            name: group,
            color: groupColors[index % groupColors.length],
            distribution: item.responseDistribution.byStudentGroup[group] ?? {},
          }))

  return sources.map((source, index) => {
    const skippedValue = skipped[index]?.value ?? 0
    const breakdown = breakdownPrescoredDistribution(
      source.distribution,
      item.maxScore,
      studentCount,
    )

    return {
      name: source.name,
      color: source.color,
      ...breakdown,
      skipped: skippedValue,
      prescored: true,
    }
  })
}

function breakdownPrescoredDistribution(
  distribution: Record<string, number>,
  maxScore: number,
  studentCount: number,
) {
  const denominator = Math.max(1, studentCount)
  let correctCount = 0
  let partiallyCorrectCount = 0
  let incorrectCount = 0

  for (const [score, count] of Object.entries(distribution)) {
    const numericScore = Number(score)
    if (numericScore === maxScore) {
      correctCount += count
    } else if (numericScore > 0) {
      partiallyCorrectCount += count
    } else {
      incorrectCount += count
    }
  }

  return {
    correct: Math.round((correctCount / denominator) * 100),
    partiallyCorrect: Math.round((partiallyCorrectCount / denominator) * 100),
    incorrect: Math.round((incorrectCount / denominator) * 100),
  }
}
