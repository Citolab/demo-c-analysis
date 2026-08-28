import { useNavigate } from "react-router-dom"
import { ItemQtiStatsPreview } from "@/components/ItemQtiStatsPreview"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useFilteredItems, useAnalysisStore } from "@/store/analysis-store"
import { useTranslation } from "@/i18n/use-translation"

export function ItemNavigator({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const items = useFilteredItems()
  const selectedItemLabel = useAnalysisStore((s) => s.selectedItemLabel)
  const setSelectedItem = useAnalysisStore((s) => s.setSelectedItem)

  const assessmentSelected = !items.some((item) => item.selected)

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-3">
        <button
          type="button"
          onClick={() => {
            setSelectedItem(null)
            navigate("/dashboard/assessment")
            onNavigate?.()
          }}
          className={cn(
            "w-full rounded-lg border px-3 py-3 text-left transition-colors hover:bg-muted",
            assessmentSelected && "border-primary bg-primary/5",
          )}
        >
          <div className="text-sm font-medium">{t("GENERAL_ASSESSMENT")}</div>
          <div className="text-xs text-muted-foreground">
            {t("GRAPH_ASSESSMENT_HEADER_P_VALUE")}
          </div>
        </button>

        {items.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            {t("GENERAL_NO_ITEMS_FOR_DOMAIN")}
          </p>
        ) : (
          items.map((item) => {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setSelectedItem(item.label)
                  navigate(`/dashboard/item/${item.label}`)
                  onNavigate?.()
                }}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted",
                  item.label === selectedItemLabel && "border-primary bg-primary/5",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    p={Math.round(item.pValue * 100)}%
                  </span>
                </div>
                <div className="qti-stats-preview--card">
                  <ItemQtiStatsPreview item={item} compact />
                </div>
              </button>
            )
          })
        )}
      </div>
    </ScrollArea>
  )
}
