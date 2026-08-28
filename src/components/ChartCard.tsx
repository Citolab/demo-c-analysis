import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Annotation, Domain, GroupingType, PlotType } from "@/types/model"
import { getVisibleAnnotations } from "@/lib/chart-data"
import { cn } from "@/lib/utils"

interface ChartCardProps {
  title: ReactNode
  children: ReactNode
  annotations?: Record<string, Annotation[]>
  plotType?: PlotType
  plotTypes?: PlotType[]
  grouping: GroupingType
  selectedDomain: Domain | null
  className?: string
  contentClassName?: string
}

export function ChartCard({
  title,
  children,
  annotations,
  plotType,
  plotTypes,
  grouping,
  selectedDomain,
  className,
  contentClassName = "h-72",
}: ChartCardProps) {
  const visible = annotations
    ? (plotTypes ?? (plotType ? [plotType] : []))
        .flatMap((type) =>
          getVisibleAnnotations(annotations, type, grouping, selectedDomain),
        )
        .filter(
          (annotation, index, list) =>
            list.findIndex((entry) => entry.text === annotation.text) === index,
        )
    : []

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold leading-snug">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((annotation, index) => (
          <Alert key={`${annotation.text}-${index}`} variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{annotation.text}</AlertDescription>
          </Alert>
        ))}
        <div className={cn(contentClassName)}>{children}</div>
      </CardContent>
    </Card>
  )
}
