export const tiaStringsEn = {
  QUESTIONS_TOO_EASY: "The questions might be too easy for the students.",
  POSSIBLE_INCORRECT_KEY_STUDENTS_CHOOSE_ANSWER_0:
    "There might be a problem with the key. Students choose '{0}' more often.",
  POSSIBLE_INCORRECT_KEY_STUDENTS_GENDER_CHOOSE_OTHERWISE:
    "There might be a problem with the key. Students with gender '{0}' more often choose '{1}'.",
  POSSIBLE_INCORRECT_KEY_STUDENTS_GROUP_CHOOSE_OTHERWISE:
    "There might be a problem with the key. Students in group '{0}' more often choose '{1}'.",
  POSSIBLE_INCORRECT_KEY_HIGH_SCORING_STUDENTS_FAIL_MORE:
    "There might be a problem with the key. High scoring students answer this question wrong more often than low scoring students.",
  POSSIBLE_INCORRECT_KEY_HIGH_SCORING_STUDENTS_CHOOSE_ANSWER_0:
    "There might be a problem with the key. High scoring students tend to choose '{0}'.",
  ANSWER_0_NEVER_CHOSEN: "Answer '{0}' was never chosen.",
  ANSWER_0_NEVER_CHOSEN_GENDER_1:
    "Answer(s) {0} was/were never chosen by someone with gender '{1}'.",
  ANSWER_0_NEVER_CHOSEN_GROUP_1:
    "Answer(s) {0} was/were never chosen by someone in group '{1}'.",
  QUESTION_SKIPPED_BY_MANY: "The question was skipped by a lot of students.",
  QUESTION_SKIPPED_BY_MANY_OF_GENDER_0:
    "The question was skipped by a lot of students with gender '{0}'.",
  QUESTION_SKIPPED_BY_MANY_OF_GROUP_0:
    "The question was skipped by a lot of students in group(s) '{0}'.",
  CAREFUL_INTERPRETING_LOW_STUDENT_COUNT_GENDER_0:
    "Be careful interpreting the analyses because of the low number of students (<=3) with gender '{0}'.",
  CAREFUL_INTERPRETING_LOW_STUDENT_COUNT_GROUP_0:
    "Be careful interpreting the analyses because of the low number of students (<=3) in group '{0}'.",
  QUESTIONS_TOO_HARD: "The questions might be too hard for the students.",
  QUESTIONS_TOO_EASY_GENDER_0:
    "The questions might be too easy for students with gender '{0}'.",
  QUESTIONS_TOO_EASY_GROUP_0:
    "The questions might be too easy for students in group '{0}'.",
  ASSESSMENT_UNRELIABLE: "The test might not be reliable.",
  UNRELIABLE_MEASUREMENT_DOMAIN_0:
    "The measurement of domain '{0}' might not be reliable.",
  SKIPPED_MORE_THAN_HALF:
    "Some of the students have skipped more than half of the questions.",
  SKIPPED_MORE_THAN_HALF_GENDER_0:
    "Some of the students with gender '{0}' have skipped more than half of the questions.",
  SKIPPED_MORE_THAN_HALF_GROUP_0:
    "Some of the students in group(s) '{0}' have skipped more than half of the questions.",
  SKIPPED_MORE_THAN_HALF_DOMAIN_0:
    "Some of the students have skipped more than half of the questions in domain '{0}'.",
  SKIPPED_MORE_THAN_HALF_GENDER_0_DOMAIN_1:
    "Some of the students with gender '{0}' have skipped more than half of the questions in domain '{1}'.",
  SKIPPED_MORE_THAN_HALF_GROUP_0_DOMAIN_1:
    "Some of the students in group(s) '{0}' have skipped more than half of the questions in domain '{1}'.",
  TOO_MANY_PASSING: "It's possible that too many students pass the test.",
  TOO_MANY_FAILING: "It's possible that too many students fail the test.",
  TOO_MANY_PASSING_GENDER_0:
    "It's possible that too many students with gender '{0}' pass the test.",
  TOO_MANY_FAILING_GENDER_0:
    "It's possible that too many students with gender '{0}' fail the test.",
  TOO_MANY_PASSING_GROUP_0:
    "It's possible that too many students in group '{0}' pass the test.",
  TOO_MANY_FAILING_GROUP_0:
    "It's possible that too many students in group '{0}' fail the test.",
  QUESTION_TOO_HARD_OR_INCORRECT_KEY:
    "The question might be too hard for the students, or there might be a problem with the key.",
  QUESTION_TOO_HARD: "The question might be too hard for the students.",
  QUESTION_TOO_EASY: "The question might be too easy for the students.",
  QUESTION_TOO_HARD_GENDER_0:
    "The question might be too hard for students with gender '{0}'.",
  QUESTION_TOO_EASY_GENDER_0:
    "The question might be too easy for students with gender '{0}'.",
  QUESTION_TOO_HARD_GROUP_0:
    "The question might be too hard for students in group(s) '{0}'.",
  QUESTION_TOO_EASY_GROUP_0:
    "The question might be too easy for students in group(s) '{0}'.",
  NO_RELIABILITY_LOW_NUMBER_OF_QUESTIONS_DOMAIN_0:
    "The reliability can't be determined because of the low number of questions in domain '{0}'.",
  CAREFUL_INTERPRETING_ALPHA_LOW_NUMBER_OF_QUESTIONS_DOMAIN_0:
    "Be careful interpreting Cronbach's alpha because of the low number of questions in domain '{0}'.",
} as const

export type TiaStrings = typeof tiaStringsEn

export function formatString(template: string, ...values: string[]): string {
  return values.reduce(
    (result, value, index) => result.replace(`{${index}}`, value),
    template,
  )
}

export function joinItems(items: string[], locale: "en" | "nl" = "en"): string {
  if (items.length === 0) return ""
  if (items.length === 1) return `'${items[0]}'`

  const head = items
    .slice(0, -1)
    .map((item) => `'${item}'`)
    .join(", ")
  const tail = items[items.length - 1]
  const conjunction = locale === "nl" ? "en" : "and"
  return `${head} ${conjunction} '${tail}'`
}
