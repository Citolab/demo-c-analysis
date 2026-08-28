import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAnalysisStore } from "@/store/analysis-store"
import { useTranslation } from "@/i18n/use-translation"
import type { Domain, GroupingType } from "@/types/model"

function buildDomainOptions(
  domainSets: { name: string; domains: string[] }[],
  allDomainsLabel: string,
) {
  const options: { value: string; label: string; domain: Domain | null; header?: boolean }[] =
    [{ value: "__all__", label: allDomainsLabel, domain: null }]

  for (const set of domainSets) {
    const domains = set.domains.filter((d) => d.toLowerCase() !== "no domain")
    if (domains.length === 0) continue
    options.push({
      value: `header-${set.name}`,
      label: set.name,
      domain: null,
      header: true,
    })
    for (const domain of domains) {
      options.push({
        value: `${set.name}::${domain}`,
        label: domain,
        domain: { parent: set.name, name: domain },
      })
    }
  }

  return options
}

export function AnalysisFilters() {
  const { t } = useTranslation()
  const analysis = useAnalysisStore((s) => s.analysis)
  const selectedGrouping = useAnalysisStore((s) => s.selectedGrouping)
  const selectedDomain = useAnalysisStore((s) => s.selectedDomain)
  const items = useAnalysisStore((s) => s.items)
  const setSelectedGrouping = useAnalysisStore((s) => s.setSelectedGrouping)
  const setSelectedDomain = useAnalysisStore((s) => s.setSelectedDomain)

  const domainOptions = useMemo(
    () =>
      analysis
        ? buildDomainOptions(analysis.domainSets, t("GENERAL_ALL_DOMAINS"))
        : [],
    [analysis, t],
  )

  const filteredItemCount = useMemo(() => {
    if (!analysis) return 0
    const domainKey = selectedDomain
      ? `${selectedDomain.parent}-${selectedDomain.name}`
      : null
    return items.filter((item) =>
      domainKey ? item.domains.includes(domainKey) : true,
    ).length
  }, [analysis, items, selectedDomain])

  if (!analysis) return null

  const selectedDomainValue = selectedDomain
    ? `${selectedDomain.parent}::${selectedDomain.name}`
    : "__all__"

  const selectedDomainLabel =
    domainOptions.find((option) => option.value === selectedDomainValue)?.label ??
    t("GENERAL_ALL_DOMAINS")

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 xl:flex-row xl:items-center xl:gap-3">
      <div className="min-w-0 shrink-0">
        <div className="truncate text-sm font-medium">{analysis.name}</div>
        <div className="text-xs text-muted-foreground">
          {analysis.studentCount} {t("GENERAL_STUDENTS").toLowerCase()} ·{" "}
          {filteredItemCount}/{items.length} {t("GENERAL_ITEMS").toLowerCase()}
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Select
          value={selectedGrouping}
          onValueChange={(value) => setSelectedGrouping(value as GroupingType)}
        >
          <SelectTrigger className="w-full min-w-[9.5rem] sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">{t("GENERAL_ALL_STUDENTS")}</SelectItem>
            <SelectItem value="gender">{t("GENERAL_GENDER_MALE_FEMALE")}</SelectItem>
            <SelectItem value="group">{t("GENERAL_GROUPS")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedDomainValue}
          onValueChange={(value) => {
            const option = domainOptions.find((entry) => entry.value === value)
            setSelectedDomain(option?.domain ?? null)
          }}
        >
          <SelectTrigger className="w-full min-w-[11rem] sm:w-[220px]">
            <SelectValue>{selectedDomainLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {domainOptions.map((option) =>
              option.header ? (
                <SelectGroup key={option.value}>
                  <SelectLabel>{option.label}</SelectLabel>
                </SelectGroup>
              ) : (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedGrouping !== "total" ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2 xl:ml-auto">
          {(selectedGrouping === "gender"
            ? [
                { name: t("GENERAL_GENDER_MALE"), count: analysis.perGenderCounts.Male },
                { name: t("GENERAL_GENDER_FEMALE"), count: analysis.perGenderCounts.Female },
              ]
            : analysis.studentGroups
                .filter((group) => group.toLowerCase() !== "no group")
                .map((group) => ({
                  name: group,
                  count: analysis.perStudentGroupCounts[group],
                }))
          ).map((group) => (
            <Badge key={group.name} variant="secondary">
              {group.name}: {group.count}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}
