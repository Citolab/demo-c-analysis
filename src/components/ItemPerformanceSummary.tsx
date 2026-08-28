import { chartColors } from "@/lib/colors"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/i18n/use-translation"

export interface ItemPerformanceRow {
  name: string
  color: string
  correct: number
  partiallyCorrect: number
  incorrect: number
  skipped: number
  prescored: boolean
}

interface ItemPerformanceSummaryProps {
  rows: ItemPerformanceRow[]
  className?: string
}

const partialColor = "hsl(217 91% 60%)"

function PerformanceTile({ row }: { row: ItemPerformanceRow }) {
  const { t } = useTranslation()

  const segments = row.prescored
    ? [
        { key: "correct", value: row.correct, className: "bg-[var(--qti-correct,#16a34a)]" },
        { key: "partial", value: row.partiallyCorrect, className: "", style: { backgroundColor: partialColor } },
        { key: "incorrect", value: row.incorrect, className: "", style: { backgroundColor: chartColors.incorrect } },
        { key: "skipped", value: row.skipped, className: "bg-amber-400/90" },
      ]
    : [
        { key: "correct", value: row.correct, className: "bg-[var(--qti-correct,#16a34a)]" },
        { key: "incorrect", value: row.incorrect, className: "", style: { backgroundColor: chartColors.incorrect } },
        { key: "skipped", value: row.skipped, className: "bg-amber-400/90" },
      ]

  const stats = row.prescored
    ? [
        { label: t("GRAPH_ITEM_PERFORMANCE_LABEL_CORRECT"), value: row.correct },
        {
          label: t("GRAPH_ITEM_PERFORMANCE_LABEL_PARTIALLY_CORRECT"),
          value: row.partiallyCorrect,
        },
        { label: t("GRAPH_ITEM_PERFORMANCE_LABEL_INCORRECT"), value: row.incorrect },
        { label: t("GRAPH_ITEM_SKIPPED_LABEL_MISSING"), value: row.skipped },
      ]
    : [
        { label: t("GRAPH_ITEM_PERFORMANCE_LABEL_CORRECT"), value: row.correct },
        { label: t("GRAPH_ITEM_PERFORMANCE_LABEL_INCORRECT"), value: row.incorrect },
        { label: t("GRAPH_ITEM_SKIPPED_LABEL_MISSING"), value: row.skipped },
      ]

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div
        className="mb-3 text-sm font-semibold"
        style={{ color: row.color }}
      >
        {row.name}
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={cn("h-full", segment.className)}
            style={{ width: `${segment.value}%`, ...segment.style }}
          />
        ))}
      </div>

      <dl
        className={cn(
          "mt-3 grid gap-x-4 gap-y-2 text-sm",
          row.prescored ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3",
        )}
      >
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-muted-foreground">{stat.label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{stat.value}%</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function ItemPerformanceSummary({
  rows,
  className,
}: ItemPerformanceSummaryProps) {
  const { t } = useTranslation()
  const showPartial = rows.some((row) => row.prescored)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[var(--qti-correct,#16a34a)]" />
          {t("GRAPH_ITEM_PERFORMANCE_LABEL_CORRECT")}
        </span>
        {showPartial ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: partialColor }}
            />
            {t("GRAPH_ITEM_PERFORMANCE_LABEL_PARTIALLY_CORRECT")}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: chartColors.incorrect }}
          />
          {t("GRAPH_ITEM_PERFORMANCE_LABEL_INCORRECT")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-amber-400/90" />
          {t("GRAPH_ITEM_SKIPPED_LABEL_MISSING")}
        </span>
      </div>

      <div
        className={cn(
          "grid gap-3",
          rows.length > 1 ? "sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {rows.map((row) => (
          <PerformanceTile key={row.name} row={row} />
        ))}
      </div>
    </div>
  )
}
