import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { computeMd5Hash } from "./md5-hash"
import { importAndRunTia, importExcelTia } from "./excel-tia-importer"

const fixturePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "__fixtures__/testset_template_groot.xlsx",
)

describe("computeMd5Hash", () => {
  it("matches the system MD5 of the test fixture", () => {
    const buffer = readFileSync(fixturePath)
    expect(computeMd5Hash(buffer)).toBe("400B90D27DC55560F962638D93E17FFD")
  })
})

describe("importExcelTia", () => {
  const buffer = readFileSync(fixturePath)

  it("loads the math testset metadata from Excel", async () => {
    const analysis = await importExcelTia(buffer, "testset_template_groot.xlsx")

    expect(analysis.hash).toBe("400B90D27DC55560F962638D93E17FFD")
    expect(analysis.name).toBe("Math testset")
    expect(analysis.cutOffScore).toBe(38)
    expect(analysis.studentGroups).toEqual(["AA", "AB", "AC", "AD"])
    expect(analysis.domainSets[0]).toEqual({
      name: "Rekendomein",
      domains: ["Getallen", "Verhoudingen", "Meten", "Verbanden"],
    })
    expect(analysis.domainSets[1]).toEqual({
      name: "Referentiesets",
      domains: ["1F", "2F"],
    })
    expect(Object.keys(analysis.items).length).toBeGreaterThan(30)
    expect(Object.keys(analysis.studentResults).length).toBe(120)
  })

  it("produces the same cronbach alpha as the reference JSON after runTia", async () => {
    const referencePath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../public/data/analysis.json",
    )
    const reference = JSON.parse(readFileSync(referencePath, "utf8"))
    const computed = await importAndRunTia(buffer, "testset_template_groot.xlsx")

    expect(computed.name).toBe(reference.name)
    expect(computed.cronbachsAlpha).toBeCloseTo(reference.cronbachsAlpha, 6)
    expect(computed.passRate).toBeCloseTo(reference.passRate, 6)
    expect(computed.items.MK001.pValue).toBeCloseTo(reference.items.MK001.pValue, 6)
    expect(computed.items.OV005.responseDistribution.all).toEqual(
      reference.items.OV005.responseDistribution.all,
    )
  })
})
