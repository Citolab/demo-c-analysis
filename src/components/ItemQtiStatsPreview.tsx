import { useEffect, useMemo, useRef } from "react"
import { applyReviewStats } from "@/qti-stats/applyReviewStats"
import { registerQtiStatsComponents } from "@/qti-stats/register"
import {
  buildItemStatsQtiHtml,
  fragmentFromQtiHtml,
  getItemStatsApplyOptions,
} from "@/lib/qti-item-stats"
import type { ItemMetaData } from "@/types/model"
import { cn } from "@/lib/utils"

interface ItemQtiStatsPreviewProps {
  item: ItemMetaData
  compact?: boolean
  className?: string
}

export function ItemQtiStatsPreview({
  item,
  compact = false,
  className,
}: ItemQtiStatsPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const statsKey = useMemo(
    () =>
      JSON.stringify({
        label: item.label,
        distribution: item.responseDistribution.all,
        key: item.key,
      }),
    [item],
  )

  useEffect(() => {
    registerQtiStatsComponents()
    const host = hostRef.current
    if (!host) return

    host.replaceChildren()
    const fragment = fragmentFromQtiHtml(buildItemStatsQtiHtml(item))
    host.append(fragment)

    if (compact) {
      host
        .querySelectorAll("qti-extended-text-interaction-stats")
        .forEach((element) => element.setAttribute("stats-only", ""))
    }

    requestAnimationFrame(() => {
      applyReviewStats(host, getItemStatsApplyOptions(item))
    })
  }, [item, statsKey, compact])

  return (
    <div
      ref={hostRef}
      className={cn(
        "qti-stats-preview",
        compact && "qti-stats-preview--compact",
        className,
      )}
    />
  )
}
