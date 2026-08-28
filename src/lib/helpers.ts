export function sortBy<T>(
  list: T[],
  getKey: (item: T) => number,
  descending = false,
) {
  return [...list].sort((a, b) => {
    const valueA = getKey(a)
    const valueB = getKey(b)
    if (valueA < valueB) return descending ? 1 : -1
    if (valueA > valueB) return descending ? -1 : 1
    return 0
  })
}

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

export const createRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start)

export const onlyUnique = <T>(value: T, index: number, self: T[]) =>
  self.indexOf(value) === index

export function fullDomainName(domain: { parent: string; name: string } | null) {
  return domain ? `${domain.parent}-${domain.name}` : null
}
