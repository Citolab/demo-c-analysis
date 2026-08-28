import { useAnalysisStore } from "@/store/analysis-store"
import en from "./en.json"
import nl from "./nl.json"

const dictionaries = { en, nl } as const

type Dictionary = typeof en

export function useTranslation() {
  const language = useAnalysisStore((s) => s.language)
  const dict = dictionaries[language]

  const t = (key: keyof Dictionary, params?: Record<string, string | number>) => {
    let text = dict[key] ?? String(key)
    if (!params) return text

    return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, name: string) => {
      const value = params[name]
      return value === undefined ? match : String(value)
    })
  }

  return { t, language }
}
