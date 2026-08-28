export function deepQuerySelectorAll(
  root: DocumentFragment | Element | ShadowRoot,
  selector: string,
): Element[] {
  const results: Element[] = []
  const pending: (DocumentFragment | Element | ShadowRoot)[] = [root]

  while (pending.length > 0) {
    const current = pending.pop()
    if (!current) continue

    if ("querySelectorAll" in current) {
      current.querySelectorAll(selector).forEach((element) => results.push(element))
    }

    const children =
      current instanceof DocumentFragment
        ? [...current.children]
        : [...current.children]

    for (const child of children) {
      pending.push(child)
      if (child.shadowRoot) pending.push(child.shadowRoot)
    }
  }

  return results
}
