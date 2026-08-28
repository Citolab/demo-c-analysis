import { genderLabel, getGenders, isMultipleChoice } from "../helpers"
import { mean } from "../stats"
import {
  formatString,
  joinItems,
  tiaStringsEn,
  type TiaStrings,
} from "./strings"
import type { AnalysisSet, Annotation } from "../../types/model"

const PLOT_TYPES = {
  assessmentPValues: "assessment-pvalues-plot",
  assessmentScoreDistribution: "assessment-scoredistribution-plot",
  assessmentPassRate: "assessment-passrate-plot",
  assessmentReliability: "assessment-reliability-plot",
  assessmentSkippedItems: "assessment-skippeditems-plot",
  itemPValue: "item-pvalue-plot",
  itemDistractor: "item-distractor-plot",
  itemSkipped: "item-skipped-plot",
  itemResponseDistribution: "item-responsedistribution-plot",
} as const

function createAnnotation(
  text: string,
  options: Partial<Annotation> = {},
): Annotation {
  return {
    byGender: false,
    byStudentGroup: false,
    byDomain: false,
    showPlot: true,
    text,
    domain: null,
    ...options,
  }
}

function domainAnnotation(
  text: string,
  domain: string,
  options: Partial<Annotation> = {},
): Annotation {
  return createAnnotation(text, { ...options, byDomain: true, domain })
}

/** Annotates an analysis set with warning annotations (ported from C# TiaAnnotator). */
export function annotateAnalysis(
  analysis: AnalysisSet,
  strings: TiaStrings = tiaStringsEn,
  locale: "en" | "nl" = "en",
): void {
  analysis.annotations = {
    [PLOT_TYPES.assessmentPValues]: [],
    [PLOT_TYPES.assessmentScoreDistribution]: [],
    [PLOT_TYPES.assessmentPassRate]: [],
    [PLOT_TYPES.assessmentReliability]: [],
    [PLOT_TYPES.assessmentSkippedItems]: [],
  }

  for (const item of Object.values(analysis.items)) {
    item.annotations = {
      [PLOT_TYPES.itemPValue]: [],
      [PLOT_TYPES.itemDistractor]: [],
      [PLOT_TYPES.itemSkipped]: [],
      [PLOT_TYPES.itemResponseDistribution]: [],
    }
  }

  checkAssessmentLevelWarnings(analysis, strings, locale)
  checkItemLevelWarnings(analysis, strings, locale)
}

function checkAssessmentLevelWarnings(
  analysis: AnalysisSet,
  strings: TiaStrings,
  _locale: "en" | "nl",
): void {
  assessmentPValueWarnings(analysis, strings)
  assessmentReliabilityWarnings(analysis, strings)
  assessmentPassRateWarnings(analysis, strings)
  analysis.annotations[PLOT_TYPES.assessmentScoreDistribution] = []
  assessmentSkippedItemsWarnings(analysis, strings)
  groupCountWarnings(analysis, strings)
  itemCountPerDomainWarnings(analysis, strings)
}

function checkItemLevelWarnings(
  analysis: AnalysisSet,
  strings: TiaStrings,
  locale: "en" | "nl",
): void {
  itemPValueWarnings(analysis, strings)
  itemResponseDistributionWarnings(analysis, strings, locale)
  itemDistractorPlotWarnings(analysis, strings)
  itemSkippedWarnings(analysis, strings)
}

function itemPValueWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  for (const item of Object.values(analysis.items)) {
    const annotations: Annotation[] = []

    if (item.pValue < 0.3) {
      annotations.push(
        createAnnotation(
          isMultipleChoice(item)
            ? strings.QUESTION_TOO_HARD_OR_INCORRECT_KEY
            : strings.QUESTION_TOO_HARD,
        ),
      )
    }

    if (item.pValue > 0.9) {
      annotations.push(createAnnotation(strings.QUESTION_TOO_EASY))
    }

    for (const gender of getGenders(analysis)) {
      const label = genderLabel(gender)
      const pValue = Number(item.pValuesByGender[label])
      if (pValue < 0.3) {
        annotations.push(
          createAnnotation(
            formatString(strings.QUESTION_TOO_HARD_GENDER_0, label),
            { byGender: true },
          ),
        )
      }
      if (pValue > 0.9) {
        annotations.push(
          createAnnotation(
            formatString(strings.QUESTION_TOO_EASY_GENDER_0, label),
            { byGender: true },
          ),
        )
      }
    }

    const tooEasyGroups: string[] = []
    const tooHardGroups: string[] = []
    for (const [group, pValue] of Object.entries(item.pValuesByStudentGroup)) {
      if (pValue < 0.3) tooHardGroups.push(group)
      if (pValue > 0.9) tooEasyGroups.push(group)
    }

    if (tooHardGroups.length > 0) {
      annotations.push(
        createAnnotation(
          formatString(strings.QUESTION_TOO_HARD_GROUP_0, tooHardGroups.join("','")),
          { byStudentGroup: true },
        ),
      )
    }

    if (tooEasyGroups.length > 0) {
      annotations.push(
        createAnnotation(
          formatString(strings.QUESTION_TOO_EASY_GROUP_0, tooEasyGroups.join("','")),
          { byStudentGroup: true },
        ),
      )
    }

    item.annotations[PLOT_TYPES.itemPValue] = annotations
  }
}

function itemResponseDistributionWarnings(
  analysis: AnalysisSet,
  strings: TiaStrings,
  locale: "en" | "nl",
): void {
  for (const item of Object.values(analysis.items)) {
    const annotations: Annotation[] = []
    if (!isMultipleChoice(item)) {
      item.annotations[PLOT_TYPES.itemResponseDistribution] = annotations
      continue
    }

    const keyResponseCount =
      item.key.length > 1
        ? Math.min(...item.key.split("").map((key) => item.responseDistribution.all[key] ?? 0))
        : (item.responseDistribution.all[item.key] ?? 0)

    const responsesChosenOverKey = Object.entries(item.responseDistribution.all).filter(
      ([response, count]) => !item.key.includes(response) && count > keyResponseCount,
    )

    if (responsesChosenOverKey.length > 0) {
      annotations.push(
        createAnnotation(
          formatString(
            strings.POSSIBLE_INCORRECT_KEY_STUDENTS_CHOOSE_ANSWER_0,
            responsesChosenOverKey.map(([response]) => response).join("','"),
          ),
        ),
      )
    }

    for (const gender of getGenders(analysis)) {
      const label = genderLabel(gender)
      const distribution = item.responseDistribution.byGender[label] ?? {}
      const byGenderKeyResponseCount =
        item.key.length > 1
          ? Math.min(...item.key.split("").map((key) => distribution[key] ?? 0))
          : (distribution[item.key] ?? 0)
      const byGenderResponsesChosenOverKey = Object.entries(distribution).filter(
        ([response, count]) => !item.key.includes(response) && count > byGenderKeyResponseCount,
      )

      if (byGenderResponsesChosenOverKey.length > 0) {
        annotations.push(
          createAnnotation(
            formatString(
              strings.POSSIBLE_INCORRECT_KEY_STUDENTS_GENDER_CHOOSE_OTHERWISE,
              label,
              byGenderResponsesChosenOverKey.map(([response]) => response).join("','"),
            ),
            { byGender: true },
          ),
        )
      }
    }

    for (const group of analysis.studentGroups) {
      const distribution = item.responseDistribution.byStudentGroup[group] ?? {}
      const byGroupKeyResponseCount =
        item.key.length > 1
          ? Math.min(...item.key.split("").map((key) => distribution[key] ?? 0))
          : (distribution[item.key] ?? 0)
      const byGroupResponsesChosenOverKey = Object.entries(distribution).filter(
        ([response, count]) => !item.key.includes(response) && count > byGroupKeyResponseCount,
      )

      if (byGroupResponsesChosenOverKey.length > 0) {
        annotations.push(
          createAnnotation(
            formatString(
              strings.POSSIBLE_INCORRECT_KEY_STUDENTS_GROUP_CHOOSE_OTHERWISE,
              group,
              byGroupResponsesChosenOverKey.map(([response]) => response).join("','"),
            ),
            { byStudentGroup: true },
          ),
        )
      }
    }

    const notSelected = Object.entries(item.responseDistribution.all).filter(
      ([, count]) => count === 0,
    )

    if (notSelected.length > 0) {
      for (const [response] of notSelected) {
        annotations.push(
          createAnnotation(formatString(strings.ANSWER_0_NEVER_CHOSEN, response)),
        )
      }
    } else {
      for (const gender of getGenders(analysis)) {
        const label = genderLabel(gender)
        const neverChosen = Object.entries(item.responseDistribution.byGender[label] ?? {})
          .filter(([, count]) => count === 0)
          .map(([response]) => response)

        if (neverChosen.length > 0) {
          annotations.push(
            createAnnotation(
              formatString(
                strings.ANSWER_0_NEVER_CHOSEN_GENDER_1,
                joinItems(neverChosen, locale),
                label,
              ),
              { byGender: true },
            ),
          )
        }
      }

      for (const group of analysis.studentGroups) {
        const neverChosen = Object.entries(
          item.responseDistribution.byStudentGroup[group] ?? {},
        )
          .filter(([, count]) => count === 0)
          .map(([response]) => response)

        if (neverChosen.length > 0) {
          annotations.push(
            createAnnotation(
              formatString(
                strings.ANSWER_0_NEVER_CHOSEN_GROUP_1,
                joinItems(neverChosen, locale),
                group,
              ),
              { byStudentGroup: true },
            ),
          )
        }
      }
    }

    item.annotations[PLOT_TYPES.itemResponseDistribution] = annotations
  }
}

function itemDistractorPlotWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  for (const item of Object.values(analysis.items)) {
    const annotations: Annotation[] = []
    if (!isMultipleChoice(item)) {
      item.annotations[PLOT_TYPES.itemDistractor] = annotations
      continue
    }

    if (item.rir <= 0) {
      annotations.push(
        createAnnotation(strings.POSSIBLE_INCORRECT_KEY_HIGH_SCORING_STUDENTS_FAIL_MORE),
      )
    } else {
      const abnormalRars = Object.entries(item.rars ?? {}).filter(
        ([, value]) => value > item.rir || value > 0.1,
      )
      for (const [distractor] of abnormalRars) {
        annotations.push(
          createAnnotation(
            formatString(
              strings.POSSIBLE_INCORRECT_KEY_HIGH_SCORING_STUDENTS_CHOOSE_ANSWER_0,
              distractor,
            ),
          ),
        )
      }
    }

    item.annotations[PLOT_TYPES.itemDistractor] = annotations
  }
}

function itemSkippedWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  for (const item of Object.values(analysis.items)) {
    const annotations: Annotation[] = []

    if ((item.skippedItemAnalysis?.all ?? 0) > 0.25) {
      annotations.push(createAnnotation(strings.QUESTION_SKIPPED_BY_MANY))
    }

    for (const [gender, skippedFraction] of Object.entries(
      item.skippedItemAnalysis?.byGender ?? {},
    )) {
      if (skippedFraction > 0.25) {
        annotations.push(
          createAnnotation(
            formatString(strings.QUESTION_SKIPPED_BY_MANY_OF_GENDER_0, gender),
            { byGender: true },
          ),
        )
      }
    }

    const skippedGroups = Object.entries(item.skippedItemAnalysis?.byStudentGroup ?? {})
      .filter(([, fraction]) => fraction > 0.25)
      .map(([group]) => group)

    if (skippedGroups.length > 0) {
      annotations.push(
        createAnnotation(
          formatString(strings.QUESTION_SKIPPED_BY_MANY_OF_GROUP_0, skippedGroups.join("','")),
          { byStudentGroup: true },
        ),
      )
    }

    for (const [domain, skippedAnalysis] of Object.entries(
      item.skippedItemAnalysisByDomain ?? {},
    )) {
      if (skippedAnalysis.all > 0.25) {
        annotations.push(domainAnnotation(strings.QUESTION_SKIPPED_BY_MANY, domain))
      }

      for (const [gender, skippedFraction] of Object.entries(skippedAnalysis.byGender)) {
        if (skippedFraction > 0.25) {
          annotations.push(
            domainAnnotation(
              formatString(strings.QUESTION_SKIPPED_BY_MANY_OF_GENDER_0, gender),
              domain,
              { byGender: true },
            ),
          )
        }
      }

      const skippedGroupsByDomain = Object.entries(skippedAnalysis.byStudentGroup)
        .filter(([, fraction]) => fraction > 0.25)
        .map(([group]) => group)

      if (skippedGroupsByDomain.length > 0) {
        annotations.push(
          domainAnnotation(
            formatString(
              strings.QUESTION_SKIPPED_BY_MANY_OF_GROUP_0,
              skippedGroupsByDomain.join("','"),
            ),
            domain,
            { byStudentGroup: true },
          ),
        )
      }
    }

    item.annotations[PLOT_TYPES.itemSkipped] = annotations
  }
}

function itemCountPerDomainWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  for (const [domain, count] of Object.entries(analysis.perDomainItemCounts)) {
    if (count <= 3) {
      analysis.annotations[PLOT_TYPES.assessmentReliability].push(
        domainAnnotation(
          formatString(strings.NO_RELIABILITY_LOW_NUMBER_OF_QUESTIONS_DOMAIN_0, domain),
          domain,
          { showPlot: false },
        ),
      )
    } else if (count <= 7) {
      analysis.annotations[PLOT_TYPES.assessmentReliability].push(
        domainAnnotation(
          formatString(
            strings.CAREFUL_INTERPRETING_ALPHA_LOW_NUMBER_OF_QUESTIONS_DOMAIN_0,
            domain,
          ),
          domain,
        ),
      )
    }
  }
}

function groupCountWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  for (const [group, count] of Object.entries(analysis.perStudentGroupCounts)) {
    if (count <= 3) {
      const text = formatString(strings.CAREFUL_INTERPRETING_LOW_STUDENT_COUNT_GROUP_0, group)
      analysis.annotations[PLOT_TYPES.assessmentPValues].push(
        createAnnotation(text, { byStudentGroup: true }),
      )
      analysis.annotations[PLOT_TYPES.assessmentScoreDistribution].push(
        createAnnotation(text, { byStudentGroup: true }),
      )
      analysis.annotations[PLOT_TYPES.assessmentPassRate].push(
        createAnnotation(text, { byStudentGroup: true }),
      )
    }
  }

  for (const [gender, count] of Object.entries(analysis.perGenderCounts)) {
    if (count <= 3) {
      const text = formatString(strings.CAREFUL_INTERPRETING_LOW_STUDENT_COUNT_GENDER_0, gender)
      analysis.annotations[PLOT_TYPES.assessmentPValues].push(
        createAnnotation(text, { byGender: true }),
      )
      analysis.annotations[PLOT_TYPES.assessmentScoreDistribution].push(
        createAnnotation(text, { byGender: true }),
      )
      analysis.annotations[PLOT_TYPES.assessmentPassRate].push(
        createAnnotation(text, { byGender: true }),
      )
    }
  }
}

function assessmentPValueWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  const items = Object.values(analysis.items)
  const overallMeanPValue = mean(items.map((item) => item.pValue))
  const annotations: Annotation[] = []

  if (overallMeanPValue > 0.9) {
    annotations.push(createAnnotation(strings.QUESTIONS_TOO_EASY))
  }
  if (overallMeanPValue < 0.3) {
    annotations.push(createAnnotation(strings.QUESTIONS_TOO_HARD))
  }

  for (const gender of getGenders(analysis)) {
    const label = genderLabel(gender)
    const meanPValue = mean(
      items.map((item) => Number(item.pValuesByGender[label])),
    )
    if (meanPValue > 0.9) {
      annotations.push(
        createAnnotation(formatString(strings.QUESTIONS_TOO_EASY_GENDER_0, label), {
          byGender: true,
        }),
      )
    }
    if (meanPValue < 0.3) {
      annotations.push(
        createAnnotation(formatString(strings.QUESTIONS_TOO_EASY_GENDER_0, label), {
          byGender: true,
        }),
      )
    }
  }

  for (const group of analysis.studentGroups) {
    const meanPValue = mean(items.map((item) => item.pValuesByStudentGroup[group]))
    if (meanPValue > 0.9) {
      annotations.push(
        createAnnotation(formatString(strings.QUESTIONS_TOO_EASY_GROUP_0, group), {
          byStudentGroup: true,
        }),
      )
    }
    if (meanPValue < 0.3) {
      annotations.push(
        createAnnotation(formatString(strings.QUESTIONS_TOO_EASY_GROUP_0, group), {
          byStudentGroup: true,
        }),
      )
    }
  }

  analysis.annotations[PLOT_TYPES.assessmentPValues] = annotations
}

function assessmentReliabilityWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  const annotations: Annotation[] = []
  if (analysis.cronbachsAlpha < 0.5) {
    annotations.push(createAnnotation(strings.ASSESSMENT_UNRELIABLE))
  }

  for (const [domain, alpha] of Object.entries(analysis.perDomainCronbachsAlphas)) {
    if (alpha < 0.5) {
      annotations.push(
        domainAnnotation(
          formatString(strings.UNRELIABLE_MEASUREMENT_DOMAIN_0, domain),
          domain,
        ),
      )
    }
  }

  analysis.annotations[PLOT_TYPES.assessmentReliability] = annotations
}

function assessmentPassRateWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  const annotations: Annotation[] = []

  if (analysis.passRate > 0.9) {
    annotations.push(createAnnotation(strings.TOO_MANY_PASSING))
  }
  if (analysis.passRate < 0.3) {
    annotations.push(createAnnotation(strings.TOO_MANY_FAILING))
  }

  for (const [gender, passRate] of Object.entries(analysis.perGenderPassRate)) {
    if (passRate > 0.9) {
      annotations.push(
        createAnnotation(formatString(strings.TOO_MANY_PASSING_GENDER_0, gender), {
          byGender: true,
        }),
      )
    }
    if (passRate < 0.3) {
      annotations.push(
        createAnnotation(formatString(strings.TOO_MANY_FAILING_GENDER_0, gender), {
          byGender: true,
        }),
      )
    }
  }

  for (const [group, passRate] of Object.entries(analysis.perStudentGroupPassRate)) {
    if (passRate > 0.9) {
      annotations.push(
        createAnnotation(formatString(strings.TOO_MANY_PASSING_GROUP_0, group), {
          byStudentGroup: true,
        }),
      )
    }
    if (passRate < 0.3) {
      annotations.push(
        createAnnotation(formatString(strings.TOO_MANY_FAILING_GROUP_0, group), {
          byStudentGroup: true,
        }),
      )
    }
  }

  analysis.annotations[PLOT_TYPES.assessmentPassRate] = annotations
}

function assessmentSkippedItemsWarnings(analysis: AnalysisSet, strings: TiaStrings): void {
  const annotations: Annotation[] = []
  const halfItemCount = Math.floor(Object.keys(analysis.items).length / 2) + 1

  if (Object.keys(analysis.skippedItemsAnalysis.all).some((key) => Number(key) >= halfItemCount)) {
    annotations.push(createAnnotation(strings.SKIPPED_MORE_THAN_HALF))
  }

  for (const [gender, skippedItemCounts] of Object.entries(
    analysis.skippedItemsAnalysis.byGender,
  )) {
    if (Object.keys(skippedItemCounts).some((key) => Number(key) >= halfItemCount)) {
      annotations.push(
        createAnnotation(formatString(strings.SKIPPED_MORE_THAN_HALF_GENDER_0, gender), {
          byGender: true,
        }),
      )
    }
  }

  const skippedGroups = Object.entries(analysis.skippedItemsAnalysis.byStudentGroup)
    .filter(([, counts]) =>
      Object.keys(counts).some((key) => Number(key) >= halfItemCount),
    )
    .map(([group]) => group)

  if (skippedGroups.length > 0) {
    annotations.push(
      createAnnotation(
        formatString(strings.SKIPPED_MORE_THAN_HALF_GROUP_0, skippedGroups.join("','")),
        { byStudentGroup: true },
      ),
    )
  }

  for (const [domain, skippedItemsAnalysis] of Object.entries(
    analysis.perDomainSkippedItemsAnalysis,
  )) {
    const domainHalfItemCount =
      Math.floor(
        Object.values(analysis.items).filter((item) => item.domains.includes(domain)).length / 2,
      ) + 1

    if (
      Object.keys(skippedItemsAnalysis.all).some(
        (key) => Number(key) >= domainHalfItemCount,
      )
    ) {
      annotations.push(
        domainAnnotation(
          formatString(strings.SKIPPED_MORE_THAN_HALF_DOMAIN_0, domain),
          domain,
        ),
      )
    }

    for (const [gender, skippedItemCounts] of Object.entries(skippedItemsAnalysis.byGender)) {
      if (
        Object.keys(skippedItemCounts).some((key) => Number(key) >= domainHalfItemCount)
      ) {
        annotations.push(
          domainAnnotation(
            formatString(strings.SKIPPED_MORE_THAN_HALF_GENDER_0_DOMAIN_1, gender, domain),
            domain,
            { byGender: true },
          ),
        )
      }
    }

    const skippedGroupsByDomain = Object.entries(skippedItemsAnalysis.byStudentGroup)
      .filter(([, counts]) =>
        Object.keys(counts).some((key) => Number(key) >= domainHalfItemCount),
      )
      .map(([group]) => group)

    if (skippedGroupsByDomain.length > 0) {
      annotations.push(
        domainAnnotation(
          formatString(
            strings.SKIPPED_MORE_THAN_HALF_GROUP_0_DOMAIN_1,
            skippedGroupsByDomain.join("','"),
            domain,
          ),
          domain,
          { byStudentGroup: true },
        ),
      )
    }
  }

  analysis.annotations[PLOT_TYPES.assessmentSkippedItems] = annotations
}
