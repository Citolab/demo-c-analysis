import { annotateAnalysis } from "./annotator"
import { runCalculations } from "./calculator"
import { prepareAnalysis } from "./prepare-analysis"
import type { AnalysisSet } from "../types/model"

export interface RunTiaOptions {
  /** Run warning annotation after calculations. Default: true */
  annotate?: boolean
  /** Locale used for list formatting in annotations. Default: "en" */
  locale?: "en" | "nl"
}

/**
 * Prepares raw student results, runs the full TIA calculation pipeline, and
 * optionally annotates the analysis with warnings.
 *
 * Portable: no browser or Node-specific APIs — safe to import from a backend.
 */
export function runTia(analysis: AnalysisSet, options: RunTiaOptions = {}): AnalysisSet {
  const { annotate = true, locale = "en" } = options

  prepareAnalysis(analysis)
  runCalculations(analysis)

  if (annotate) {
    annotateAnalysis(analysis, undefined, locale)
  }

  return analysis
}

export { prepareAnalysis } from "./prepare-analysis"
export { runCalculations } from "./calculator"
export { annotateAnalysis } from "./annotator"
export {
  importExcelTia,
  importAndRunTia,
  ImportException,
} from "./import"
export * from "./stats"
export * from "./constants"
export * from "./helpers"
