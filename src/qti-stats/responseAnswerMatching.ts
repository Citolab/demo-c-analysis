function normalizeTokens(value: string, sep: RegExp): string[] {
  return value
    .split(sep)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .sort()
}

export function tokenizeCorrectAnswer(correctAnswer: string | null | undefined) {
  if (!correctAnswer?.trim()) return []
  return normalizeTokens(correctAnswer, /[&;,\s]+/)
}

export function isChoiceInCorrectAnswer(
  choiceIdentifier: string,
  correctAnswer: string | null | undefined,
) {
  const id = choiceIdentifier.trim().toLowerCase()
  if (!id) return false
  return tokenizeCorrectAnswer(correctAnswer).includes(id)
}

export function matchesCorrectAnswer(
  responseValue: string | null | undefined,
  correctAnswer: string | null | undefined,
) {
  if (!responseValue || !correctAnswer) return false
  const responseTokens = normalizeTokens(responseValue, /[&\s]+/)
  const correctTokens = normalizeTokens(correctAnswer, /[&;,\s]+/)
  return (
    responseTokens.length === correctTokens.length &&
    responseTokens.every((token, index) => token === correctTokens[index])
  )
}

export function statValueMatchesChoiceIdentifier(
  statValue: string | null | undefined,
  choiceIdentifier: string | null | undefined,
) {
  if (statValue == null || choiceIdentifier == null) return false
  const value = statValue.trim()
  const id = choiceIdentifier.trim()
  if (!value || !id) return false
  if (value === id) return true
  if (value.toLowerCase() === id.toLowerCase()) return true

  if (value.includes("&")) {
    const parts = value
      .split("&")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean)
    if (parts.includes(id.toLowerCase())) return true
  }

  if (id.length <= 2) return false
  const lowerValue = value.toLowerCase()
  const lowerId = id.toLowerCase()
  return lowerValue.endsWith(lowerId) || lowerId.endsWith(lowerValue)
}
