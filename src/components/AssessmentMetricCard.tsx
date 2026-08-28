import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Annotation, Domain, GroupingType, PlotType } from "@/types/model"
import { getVisibleAnnotations } from "@/lib/chart-data"

interface AssessmentMetricCardProps {
  title: ReactNode
  subtitle?: ReactNode
  annotations?: Record<string, Annotation[]>
  plotType?: PlotType
  grouping: GroupingType
  selectedDomain: Domain | null
  children: ReactNode
}

export function AssessmentMetricCard({
  title,
  subtitle,
  annotations,
  plotType,
  grouping,
  selectedDomain,
  children,
}: AssessmentMetricCardProps) {
  const visible = annotations && plotType
    ? getVisibleAnnotations(annotations, plotType, grouping, selectedDomain)
    : []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold leading-snug">{title}</CardTitle>
        {subtitle ? (
          <p className="text-sm font-normal text-muted-foreground">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((annotation, index) => (
          <Alert key={`${annotation.text}-${index}`} variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{annotation.text}</AlertDescription>
          </Alert>
        ))}
        {children}
      </CardContent>
    </Card>
  )
}
