export type SheetRow = unknown[]
export type SheetMatrix = SheetRow[]

export async function readWorkbook(
  data: ArrayBuffer | Uint8Array,
): Promise<Record<string, SheetMatrix>> {
  const XLSX = await import("xlsx")
  const workbook = XLSX.read(data, { type: "array", cellDates: false })
  const sheets: Record<string, SheetMatrix> = {}

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name]
    sheets[name] = XLSX.utils.sheet_to_json<SheetRow>(sheet, {
      header: 1,
      defval: null,
      raw: false,
    })
  }

  return sheets
}

export function cellString(value: unknown): string {
  if (value == null) return ""
  return String(value).trim()
}

export function cellNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const numeric = Number(value)
  return Number.isNaN(numeric) ? null : numeric
}

export function columnLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

export function findRowIndex(
  rows: SheetMatrix,
  predicate: (row: SheetRow) => boolean,
): number {
  return rows.findIndex(predicate)
}
