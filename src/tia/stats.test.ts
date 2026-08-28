import { describe, expect, it } from "vitest"
import { correlation, mean, quartileBoundaries, variance } from "./stats"

describe("stats", () => {
  it("computes sample variance", () => {
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(4.571428571428571, 6)
  })

  it("computes mean", () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5)
  })

  it("computes correlation", () => {
    expect(correlation([1, 2, 3, 4, 5], [1, 2, 3, 4, 5])).toBeCloseTo(1, 6)
  })

  it("computes accord-style quartile boundaries", () => {
    const boundaries = quartileBoundaries([
      18, 14, 1, 15, 4, 32, 10, 26, 38, 9, 24, 16, 31, 20, 25, 30, 22, 6, 28, 21,
      33, 17, 5, 35, 2, 13, 36, 8, 29, 7,
    ])

    expect(boundaries.q1).toBe(9)
    expect(boundaries.q2).toBe(19)
    expect(boundaries.q3).toBe(29)
  })
})
