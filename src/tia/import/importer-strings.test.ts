import { describe, expect, it } from "vitest"
import { getImporterStrings } from "./importer-strings"

describe("getImporterStrings", () => {
  it("returns Dutch strings for nl locale", () => {
    const strings = getImporterStrings("nl")
    expect(strings.errorsParsingStart).toContain("Start'-tabblad")
    expect(strings.minimumStudentCount3).toContain("3 leerlingen")
  })

  it("returns English strings for en locale", () => {
    const strings = getImporterStrings("en")
    expect(strings.errorsParsingStart).toContain("Start sheet")
    expect(strings.minimumStudentCount3).toContain("3.")
  })
})
