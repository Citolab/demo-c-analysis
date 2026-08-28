import { calculateCronbachsAlpha } from "./cronbachs-alpha"
import { calculateRar, calculateRir, calculateRit } from "./correlations"
import { calculateDistractorPlotData } from "./distractor-plot"
import { calculatePassRates } from "./pass-rates"
import { calculatePercentageCorrectPerItem } from "./percentage-correct"
import { calculatePValues } from "./p-values"
import { calculateResponseDistribution } from "./response-distribution"
import {
  calculateScoreDistribution,
  calculateScoreDistributionsByDomain,
} from "./score-distribution"
import {
  calculateSkippedItemAnalysisPerItem,
  calculateSkippedItemCountAnalysis,
  calculateSkippedItemCountAnalysesByDomain,
} from "./skipped-items"
import type { AnalysisSet } from "../../types/model"

/** Runs the full TIA calculation pipeline (ported from C# TiaCalculator.DoCalculations). */
export function runCalculations(analysis: AnalysisSet): void {
  calculatePValues(analysis)
  calculateSkippedItemAnalysisPerItem(analysis)
  calculatePassRates(analysis)
  calculateCronbachsAlpha(analysis)
  calculateScoreDistribution(analysis)
  calculateSkippedItemCountAnalysis(analysis)
  calculateScoreDistributionsByDomain(analysis)
  calculateSkippedItemCountAnalysesByDomain(analysis)
  calculateRit(analysis)
  calculateRir(analysis)
  calculateRar(analysis)
  calculateResponseDistribution(analysis)
  calculatePercentageCorrectPerItem(analysis)
  calculateDistractorPlotData(analysis)
}
