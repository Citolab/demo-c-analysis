import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowDownWideNarrow, ListOrdered } from "lucide-react"
import { AssessmentAiChat, AssessmentAiChatButton } from "@/components/AssessmentAiChat"
import { ChartCard } from "@/components/ChartCard"
import { AssessmentMetricCard } from "@/components/AssessmentMetricCard"
import {
  PValueChart,
  StudentScoreChart,
} from "@/components/charts/AssessmentCharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  buildPassRateChart,
  buildPValueChart,
  buildStudentScoreChart,
  getCronbachAlpha,
} from "@/lib/chart-data"
import { useAnalysisStore } from "@/store/analysis-store"
import { useTranslation } from "@/i18n/use-translation"

export function AssessmentPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const analysis = useAnalysisStore((s) => s.analysis)
  const grouping = useAnalysisStore((s) => s.selectedGrouping)
  const selectedDomain = useAnalysisStore((s) => s.selectedDomain)
  const setSelectedItem = useAnalysisStore((s) => s.setSelectedItem)
  const [pValueSort, setPValueSort] = useState<"default" | "p-value">("p-value")
  const [aiOpen, setAiOpen] = useState(false)

  const labels = useMemo(
    () => ({
      allStudents: t("GENERAL_ALL_STUDENTS"),
      "GENERAL_GENDER_MALE": t("GENERAL_GENDER_MALE"),
      "GENERAL_GENDER_FEMALE": t("GENERAL_GENDER_FEMALE"),
    }),
    [t],
  )

  if (!analysis) return null

  const pValueData = buildPValueChart(
    analysis,
    grouping,
    selectedDomain,
    pValueSort,
    labels,
  )
  const studentScoreData = buildStudentScoreChart(
    analysis,
    grouping,
    selectedDomain,
    labels,
  )
  const passRateData = buildPassRateChart(analysis, grouping, labels)
  const cronbach = getCronbachAlpha(analysis, selectedDomain)

  const domainLabel = selectedDomain
    ? `${selectedDomain.parent}-${selectedDomain.name}`
    : null

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AssessmentAiChatButton onClick={() => setAiOpen(true)} />
      </div>

      <AssessmentAiChat
        analysis={analysis}
        selectedDomain={selectedDomain}
        open={aiOpen}
        onOpenChange={setAiOpen}
      />

      <ChartCard
        title={
          <div className="space-y-1">
            <div>{t("GRAPH_ASSESSMENT_HEADER_P_VALUE")}</div>
            <p className="text-sm font-normal text-muted-foreground">
              {t("GRAPH_ASSESSMENT_P_VALUE_OPEN_ITEM")}
            </p>
          </div>
        }
        annotations={analysis.annotations}
        plotType="assessment-pvalues-plot"
        grouping={grouping}
        selectedDomain={selectedDomain}
        contentClassName="h-auto"
      >
        <div className="mb-3 flex justify-end gap-2">
          <Button
            size="sm"
            variant={pValueSort === "default" ? "default" : "outline"}
            onClick={() => setPValueSort("default")}
          >
            <ListOrdered className="mr-2 h-4 w-4" />
            {t("GRAPH_ASSESSMENT_P_VALUE_SORT_DEFAULT")}
          </Button>
          <Button
            size="sm"
            variant={pValueSort === "p-value" ? "default" : "outline"}
            onClick={() => setPValueSort("p-value")}
          >
            <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
            {t("GRAPH_ASSESSMENT_P_VALUE_SORT_P_VALUE")}
          </Button>
        </div>
        <div className="h-80">
          <PValueChart
            items={pValueData.items}
            series={pValueData.series}
            averages={pValueData.averages}
            yAxisLabel={t("GRAPH_ASSESSMENT_P_VALUE_LABEL_Y")}
            averageLabel={t("GENERAL_AVERAGE")}
            onItemClick={(label) => {
              setSelectedItem(label)
              navigate(`/dashboard/item/${label}`)
            }}
          />
        </div>
      </ChartCard>

      <ChartCard
        title={
          domainLabel
            ? t("GRAPH_ASSESSMENT_HEADER_STUDENT_SCORE_DOMAIN", { domain: domainLabel })
            : t("GRAPH_ASSESSMENT_HEADER_STUDENT_SCORE")
        }
        annotations={analysis.annotations}
        plotType="assessment-scoredistribution-plot"
        grouping={grouping}
        selectedDomain={selectedDomain}
      >
        <StudentScoreChart
          chartData={studentScoreData.chartData}
          series={studentScoreData.series}
          referenceLines={studentScoreData.referenceLines}
          cutOffScore={studentScoreData.cutOffScore}
          xAxisLabel={t("GRAPH_ASSESSMENT_STUDENT_SCORE_LABEL_X")}
          yAxisLabel={t("GRAPH_ASSESSMENT_STUDENT_SCORE_LABEL_Y")}
          averageLabel={t("GENERAL_AVERAGE")}
          cutOffLabel={t("GENERAL_CUT_OFF_SCORE")}
        />
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {domainLabel
                ? t("GRAPH_ASSESSMENT_HEADER_CRONBACH_DOMAIN", { domain: domainLabel })
                : t("GRAPH_ASSESSMENT_HEADER_CRONBACH")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("GRAPH_ASSESSMENT_CRONBACH")}
            </p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{cronbach}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("GENERAL_ALL_STUDENTS")}
            </p>
          </CardContent>
        </Card>

        <AssessmentMetricCard
          title={t("GRAPH_ASSESSMENT_HEADER_PASS_RATE")}
          annotations={analysis.annotations}
          plotType="assessment-passrate-plot"
          grouping={grouping}
          selectedDomain={selectedDomain}
        >
          {passRateData.length === 1 ? (
            <>
              <p className="text-4xl font-semibold tracking-tight">
                {passRateData[0].value}%
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{passRateData[0].name}</p>
            </>
          ) : (
            <ul className="space-y-3">
              {passRateData.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}
                  </span>
                  <span className="text-2xl font-semibold tracking-tight">{entry.value}%</span>
                </li>
              ))}
            </ul>
          )}
        </AssessmentMetricCard>
      </div>
    </div>
  )
}
