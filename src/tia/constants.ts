import { Gender, GenderKey } from "../types/model"

export const NO_GROUP = "No group"
export const NO_DOMAIN = "No domain"

/** Score quartile bucket labels used in distractor plot exports. */
export const SCORE_GROUP_NAMES = ["Q1", "Q2", "Q3", "Q4"] as const

export const ALL_GENDERS = [Gender.Male, Gender.Female, Gender.UnknownOrOther] as const

export function genderLabel(gender: Gender): string {
  return GenderKey[gender]
}
