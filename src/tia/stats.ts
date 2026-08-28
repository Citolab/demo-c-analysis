/**
 * Statistical helpers matching Accord.NET defaults used by the C# TIA backend.
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/** Sample variance (n - 1 denominator), matching Accord.Statistics.Measures.Variance. */
export function variance(values: number[]): number {
  if (values.length <= 1) return 0
  const avg = mean(values)
  let sum = 0
  for (const value of values) {
    const diff = value - avg
    sum += diff * diff
  }
  return sum / (values.length - 1)
}

export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values))
}

/** Sample covariance, matching Accord.Statistics.Measures.Covariance. */
export function covariance(left: number[], right: number[]): number {
  if (left.length !== right.length || left.length <= 1) return 0

  const leftMean = mean(left)
  const rightMean = mean(right)
  let sum = 0

  for (let index = 0; index < left.length; index++) {
    sum += (left[index] - leftMean) * (right[index] - rightMean)
  }

  return sum / (left.length - 1)
}

export function correlation(left: number[], right: number[]): number {
  const leftStd = standardDeviation(left)
  const rightStd = standardDeviation(right)
  if (leftStd === 0 || rightStd === 0) return Number.NaN
  return covariance(left, right) / (leftStd * rightStd)
}

/** Accord QuantileMethod.Type6 (Default) single quantile on a sorted array. */
function quantileType6(sorted: number[], probability: number): number {
  if (sorted.length === 0) return 0

  const lowThreshold = 1 / (sorted.length + 1)
  const highThreshold = sorted.length / (sorted.length + 1)

  if (probability < lowThreshold) return sorted[0]
  if (probability >= highThreshold) return sorted[sorted.length - 1]

  const h = (sorted.length + 1) * probability
  const hc = Math.floor(h)

  let i = hc
  if (i > 0) i--

  let i2 = i + 1
  if (i2 === sorted.length) i2--

  return sorted[i] + (h - hc) * (sorted[i2] - sorted[i])
}

export interface QuartileBoundaries {
  q1: number
  q2: number
  q3: number
}

/**
 * Computes quartile boundaries using Accord's default (Type6) method.
 * Returns integer boundaries after rounding, matching the C# calculator.
 */
export function quartileBoundaries(values: number[]): QuartileBoundaries {
  if (values.length === 0) {
    return { q1: 0, q2: 0, q3: 0 }
  }

  const sorted = [...values].sort((a, b) => a - b)
  const q1 = Math.round(quantileType6(sorted, 0.25))
  const q2 = Math.round(quantileType6(sorted, 0.5))
  const q3 = Math.round(quantileType6(sorted, 0.75))

  return { q1, q2, q3 }
}
