export const chartColors = {
  allGroups: "#0275ab",
  male: "#f6c900",
  female: "#ed1882",
  unknownOther: "#0c6a65",
  group1: "#77b3cd",
  group2: "#ec0d77",
  group3: "#0ca550",
  group4: "#efc815",
  correct: "#11a44f",
  incorrect: "#181a2a",
} as const

export const groupColors = [
  chartColors.group1,
  chartColors.group2,
  chartColors.group3,
  chartColors.group4,
]

export const genderColors = [
  chartColors.male,
  chartColors.female,
  chartColors.unknownOther,
]

export const allGroupsColor = chartColors.allGroups

export function hexToRGBA(hex: string, alpha = 1) {
  const value = hex.trim()
  const r = Number.parseInt(value.slice(1, 3), 16)
  const g = Number.parseInt(value.slice(3, 5), 16)
  const b = Number.parseInt(value.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
