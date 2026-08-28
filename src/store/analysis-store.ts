import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { AnalysisSet, Domain, GroupingType, ItemMetaData } from "@/types/model"

interface AnalysisState {
  analysis: AnalysisSet | null
  items: ItemMetaData[]
  selectedItemLabel: string | null
  selectedGrouping: GroupingType
  selectedDomain: Domain | null
  language: "en" | "nl"
  setAnalysis: (analysis: AnalysisSet | null) => void
  setSelectedGrouping: (grouping: GroupingType) => void
  setSelectedItem: (label: string | null) => void
  setSelectedDomain: (domain: Domain | null) => void
  setLanguage: (language: "en" | "nl") => void
}

function getItems(analysis: AnalysisSet | null) {
  return analysis?.items ? Object.values(analysis.items) : []
}

function resolveSelectedItem(
  items: ItemMetaData[],
  selectedLabel: string | null,
  domain: Domain | null,
) {
  if (!items.length) return null

  const selected = selectedLabel
    ? items.find((item) => item.label === selectedLabel)
    : undefined

  if (selected) {
    if (!domain) return selected.label
    const domainKey = `${domain.parent}-${domain.name}`
    if (selected.domains.includes(domainKey)) return selected.label
  }

  const domainKey = domain ? `${domain.parent}-${domain.name}` : null
  const filtered = domainKey
    ? items.filter((item) => item.domains.includes(domainKey))
    : items

  return filtered[0]?.label ?? null
}

function restoreDerivedState(state: AnalysisState) {
  state.items = getItems(state.analysis)
  state.selectedItemLabel = resolveSelectedItem(
    state.items,
    state.selectedItemLabel,
    state.selectedDomain,
  )
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      analysis: null,
      items: [],
      selectedItemLabel: null,
      selectedGrouping: "total",
      selectedDomain: null,
      language: "en",
      setAnalysis: (analysis) =>
        set({
          analysis,
          items: getItems(analysis),
          selectedItemLabel: null,
          selectedDomain: null,
          selectedGrouping: "total",
        }),
      setSelectedGrouping: (grouping) => set({ selectedGrouping: grouping }),
      setSelectedItem: (label) => set({ selectedItemLabel: label }),
      setSelectedDomain: (domain) => {
        const { items, selectedItemLabel } = get()
        set({
          selectedDomain: domain,
          selectedItemLabel: resolveSelectedItem(items, selectedItemLabel, domain),
        })
      },
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "c-analysis-demo",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        analysis: state.analysis,
        selectedGrouping: state.selectedGrouping,
        selectedDomain: state.selectedDomain,
        selectedItemLabel: state.selectedItemLabel,
        language: state.language,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          restoreDerivedState(state)
        }
      },
    },
  ),
)

export function useFilteredItems() {
  const items = useAnalysisStore((s) => s.items)
  const selectedDomain = useAnalysisStore((s) => s.selectedDomain)
  const selectedItemLabel = useAnalysisStore((s) => s.selectedItemLabel)

  const domainKey = selectedDomain
    ? `${selectedDomain.parent}-${selectedDomain.name}`
    : null

  return items
    .filter((item) => (domainKey ? item.domains.includes(domainKey) : true))
    .map((item) => ({
      ...item,
      selected: item.label === selectedItemLabel,
    }))
}
