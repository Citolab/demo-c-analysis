import { fullDomainName } from "@/lib/helpers"
import type { AnalysisSet, Domain } from "@/types/model"

export function buildAnalysisAiContext(
  analysis: AnalysisSet,
  selectedDomain: Domain | null,
) {
  const domainKey = fullDomainName(selectedDomain)
  const items = Object.values(analysis.items)
    .filter((item) => !domainKey || item.domains.includes(domainKey))
    .map((item) => ({
      label: item.label,
      type: item.itemType === 0 ? "multiple_choice" : "prescored",
      pValue: +item.pValue.toFixed(3),
      rit: Number.isFinite(item.rit) ? +item.rit.toFixed(3) : null,
      rir: Number.isFinite(item.rir) ? +item.rir.toFixed(3) : null,
      calamity: item.calamity,
      domains: item.domains,
      maxScore: item.maxScore,
      percentCorrect: +item.percentageCorrect.toFixed(1),
      studentsSkipped: item.skippedItemAnalysis?.all ?? 0,
    }))

  const sortedByDifficulty = [...items].sort((a, b) => a.pValue - b.pValue)
  const sortedByDiscrimination = [...items]
    .filter((item) => item.rit != null)
    .sort((a, b) => (a.rit ?? 0) - (b.rit ?? 0))

  return {
    assessment: {
      name: analysis.name,
      studentCount: analysis.studentCount,
      itemCount: items.length,
      cutOffScore: analysis.cutOffScore,
      passRatePercent: +(analysis.passRate * 100).toFixed(2),
      cronbachsAlpha: +analysis.cronbachsAlpha.toFixed(3),
      meanScore: analysis.meanScore != null ? +analysis.meanScore.toFixed(2) : null,
      studentGroups: analysis.studentGroups,
      domainSets: analysis.domainSets,
      selectedDomain: domainKey,
      perDomainCronbachsAlphas: analysis.perDomainCronbachsAlphas,
      perDomainItemCounts: analysis.perDomainItemCounts,
    },
    items,
    highlights: {
      easiestItems: sortedByDifficulty.slice(-5).map((item) => item.label).reverse(),
      hardestItems: sortedByDifficulty.slice(0, 5).map((item) => item.label),
      lowestDiscriminationItems: sortedByDiscrimination
        .slice(0, 5)
        .map((item) => item.label),
      highestDiscriminationItems: sortedByDiscrimination
        .slice(-5)
        .map((item) => item.label)
        .reverse(),
      calamityItems: items.filter((item) => item.calamity).map((item) => item.label),
    },
  }
}

export function buildAnalysisSystemPrompt(
  analysis: AnalysisSet,
  selectedDomain: Domain | null,
  language: "en" | "nl",
): string {
  const context = buildAnalysisAiContext(analysis, selectedDomain)
  const languageLabel = language === "nl" ? "Dutch" : "English"

  return [
    `You are an educational assessment analyst helping teachers interpret C-Analysis (TIA) results.`,
    `Answer in ${languageLabel}. Be concise, practical, and grounded only in the JSON data below.`,
    `When referring to items, use their labels (for example MK001).`,
    `If the question cannot be answered from the data, say what is missing.`,
    "",
    "Analysis JSON:",
    JSON.stringify(context),
  ].join("\n")
}
