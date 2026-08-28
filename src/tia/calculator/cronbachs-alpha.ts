import { domainName } from "../helpers"
import { variance } from "../stats"
import type { AnalysisSet } from "../../types/model"

export function calculateCronbachsAlpha(analysis: AnalysisSet): void {
  const itemLabels = Object.keys(analysis.items)
  let summedItemScoreVariances = 0

  for (const itemLabel of itemLabels) {
    const scores = Object.values(analysis.studentResults).map(
      (result) => result.itemResults[itemLabel].score,
    )
    summedItemScoreVariances += variance(scores.map(Number))
  }

  const numberOfItems = itemLabels.length
  analysis.cronbachsAlpha =
    (numberOfItems / (numberOfItems - 1)) *
    (1 - summedItemScoreVariances / (analysis.testScoreVariance ?? 0))

  analysis.perDomainCronbachsAlphas = {}

  for (const domainSet of analysis.domainSets) {
    for (const domain of domainSet.domains) {
      const key = domainName(domainSet.name, domain)
      const domainItems = Object.entries(analysis.items).filter(([, item]) =>
        item.domains.includes(key),
      )

      let domainVarianceSum = 0
      for (const [, item] of domainItems) {
        const scores = Object.values(analysis.studentResults).map(
          (result) => result.itemResults[item.label].score,
        )
        domainVarianceSum += variance(scores.map(Number))
      }

      const domainItemCount = domainItems.length
      const domainTestScoreVariance = variance(
        Object.values(analysis.studentResults).map((result) =>
          Object.entries(result.itemResults)
            .filter(([label]) => domainItems.some(([itemLabel]) => itemLabel === label))
            .reduce((sum, [, itemResult]) => sum + itemResult.score, 0),
        ),
      )

      analysis.perDomainCronbachsAlphas[key] =
        (domainItemCount / (domainItemCount - 1)) *
        (1 - domainVarianceSum / domainTestScoreVariance)
    }
  }
}
