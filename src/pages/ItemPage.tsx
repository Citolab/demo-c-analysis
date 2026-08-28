import { useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { ChartCard } from "@/components/ChartCard"
import { ItemPerformanceSummary } from "@/components/ItemPerformanceSummary"
import { ItemQtiStatsPreview } from "@/components/ItemQtiStatsPreview"
import { DistractorPlotChart } from "@/components/charts/AssessmentCharts"
import {
  buildItemCharts,
  buildItemPerformanceSummary,
  getStudentGroups,
} from "@/lib/chart-data"
import { useAnalysisStore } from "@/store/analysis-store"
import { useTranslation } from "@/i18n/use-translation"
import { ItemType } from "@/types/model"

export function ItemPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const analysis = useAnalysisStore((s) => s.analysis)
  const grouping = useAnalysisStore((s) => s.selectedGrouping)
  const selectedDomain = useAnalysisStore((s) => s.selectedDomain)
  const setSelectedItem = useAnalysisStore((s) => s.setSelectedItem)
  const items = useAnalysisStore((s) => s.items)

  useEffect(() => {
    if (id) setSelectedItem(id)
  }, [id, setSelectedItem])

  const item = useMemo(
    () => items.find((entry) => entry.label === id),
    [items, id],
  )

  const labels = useMemo(
    () => ({
      allStudents: t("GENERAL_ALL_STUDENTS"),
      "GENERAL_GENDER_MALE": t("GENERAL_GENDER_MALE"),
      "GENERAL_GENDER_FEMALE": t("GENERAL_GENDER_FEMALE"),
    }),
    [t],
  )

  if (!analysis || !item) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Question not found.
      </div>
    )
  }

  const groups = getStudentGroups(analysis)
  const charts = buildItemCharts(item, grouping, groups, labels)
  const itemAnnotations = item.annotations
  const performanceSummary = buildItemPerformanceSummary(
    item,
    analysis.studentCount,
    grouping,
    groups,
    labels,
    charts.percentageCorrect,
    charts.skipped,
  )

  return (
    <div className="space-y-6">
      <ChartCard
        title={t("GRAPH_ITEM_RESPONSE_DISTRIBUTION", { item: item.label })}
        annotations={itemAnnotations}
        plotType="item-responsedistribution-plot"
        grouping={grouping}
        selectedDomain={selectedDomain}
        contentClassName="h-auto"
      >
        <ItemQtiStatsPreview item={item} />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title={t("GRAPH_ITEM_PERFORMANCE_SUMMARY", { item: item.label })}
          annotations={itemAnnotations}
          plotTypes={["item-pvalue-plot", "item-skipped-plot"]}
          grouping={grouping}
          selectedDomain={selectedDomain}
          contentClassName="h-auto"
        >
          <ItemPerformanceSummary rows={performanceSummary} />
        </ChartCard>

        <ChartCard
          title={
            item.itemType === ItemType.MultipleChoice
              ? t("GRAPH_ITEM_DISTRACTOR_PLOT_MC")
              : t("GRAPH_ITEM_DISTRACTOR_PLOT_PRESCORED")
          }
          annotations={itemAnnotations}
          plotType="item-distractor-plot"
          grouping={grouping}
          selectedDomain={selectedDomain}
        >
          <DistractorPlotChart
            series={charts.distractorSeries}
            xAxisLabel={t("GRAPH_ITEM_DISTRACTOR_PLOT_XAXIS")}
            yAxisLabel={t("GRAPH_ITEM_DISTRACTOR_PLOT_YAXIS")}
          />
        </ChartCard>
      </div>
    </div>
  )
}
