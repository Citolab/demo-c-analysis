import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileSpreadsheet, FileJson, BarChart3, Globe, Loader2, AlertTriangle, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAnalysisStore } from "@/store/analysis-store"
import { runTia } from "@/tia"
import { useTranslation } from "@/i18n/use-translation"
import type { AnalysisSet } from "@/types/model"

async function loadSampleData(): Promise<AnalysisSet> {
  const response = await fetch("/data/analysis.json")
  if (!response.ok) throw new Error("Failed to load sample data")
  return response.json()
}

export function UploadPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const language = useAnalysisStore((s) => s.language)
  const setLanguage = useAnalysisStore((s) => s.setLanguage)
  const setAnalysis = useAnalysisStore((s) => s.setAnalysis)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const [importErrors, setImportErrors] = useState<string[]>([])
  const excelInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  const handleAnalysis = (analysis: AnalysisSet, skipWarnings = false) => {
    setImportErrors([])
    setAnalysis(analysis)
    if (!skipWarnings && analysis.importWarnings?.length) {
      setWarnings(analysis.importWarnings)
    } else {
      navigate("/dashboard/assessment")
    }
  }

  const loadDemo = async () => {
    setProcessing(true)
    setError(null)
    try {
      handleAnalysis(runTia(await loadSampleData()), true)
    } catch {
      setError(t("PAGE_UPLOAD_PROCESSING_ERROR"))
    } finally {
      setProcessing(false)
    }
  }

  const loadJsonFile = async (file: File) => {
    setProcessing(true)
    setError(null)
    try {
      const text = await file.text()
      handleAnalysis(runTia(JSON.parse(text) as AnalysisSet))
    } catch {
      setError(t("PAGE_UPLOAD_PROCESSING_ERROR"))
    } finally {
      setProcessing(false)
    }
  }

  const loadExcelFile = async (file: File) => {
    setProcessing(true)
    setError(null)
    setImportErrors([])
    try {
      const { importAndRunTia } = await import("@/tia/import")
      const buffer = await file.arrayBuffer()
      handleAnalysis(await importAndRunTia(buffer, file.name, { locale: language }))
    } catch (caught) {
      if (caught && typeof caught === "object" && "importErrorMessages" in caught) {
        const importError = caught as { message: string; importErrorMessages: string[] }
        setImportErrors(importError.importErrorMessages)
        setError(importError.message)
      } else {
        setError(t("PAGE_UPLOAD_PROCESSING_ERROR"))
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <BarChart3 className="h-5 w-5" />
            <span>{t("PAGE_UPLOAD_HEADER")}</span>
          </div>
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as "en" | "nl")}
          >
            <SelectTrigger className="w-[130px]">
              <Globe className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="nl">Nederlands</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl items-center px-6 py-12">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {t("PAGE_UPLOAD_TITLE")}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                {t("PAGE_UPLOAD_DESCRIPTION_1")}
              </p>
            </div>

            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertTitle>Full browser pipeline</AlertTitle>
              <AlertDescription>
                Upload an Excel testset template to import student results, run the TIA
                calculations, and open the dashboard — all in the browser.
              </AlertDescription>
            </Alert>

            {importErrors.length > 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Import errors</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {importErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}

            {error && importErrors.length === 0 ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {warnings.length > 0 ? (
              <Card className="border-amber-200 bg-amber-50/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    {t("PAGE_UPLOAD_IMPORT_WARNING_TEXT", { count: warnings.length })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" />}>
                      View warnings
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Import warnings</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh] pr-4">
                        <ul className="space-y-2 text-sm">
                          {warnings.map((warning) => (
                            <li key={warning} className="rounded-md border bg-muted/40 p-3">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setWarnings([])
                        setAnalysis(null)
                      }}
                    >
                      {t("PAGE_UPLOAD_BUTTON_BACK")}
                    </Button>
                    <Button onClick={() => navigate("/dashboard/assessment")}>
                      {t("PAGE_UPLOAD_BUTTON_TO_DASHBOARD")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Get started</CardTitle>
              <CardDescription>
                Load the demo math testset, import Excel, or upload analysis JSON.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg" disabled={processing} onClick={loadDemo}>
                {processing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="mr-2 h-4 w-4" />
                )}
                {t("GENERAL_EXAMPLE")}
              </Button>

              <input
                ref={excelInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                disabled={processing}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) void loadExcelFile(file)
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={processing}
                onClick={() => excelInputRef.current?.click()}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {t("PAGE_UPLOAD_BUTTON_SELECT_EXCEL")}
              </Button>

              <input
                ref={jsonInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                disabled={processing}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (file) void loadJsonFile(file)
                }}
              />
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={processing}
                onClick={() => jsonInputRef.current?.click()}
              >
                <FileJson className="mr-2 h-4 w-4" />
                Import analysis JSON
              </Button>

              <div className="flex flex-wrap gap-2">
                <a
                  href="/assets/excel/testset_template_demo_en.xlsx"
                  download
                  className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-sm hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  {t("PAGE_UPLOAD_DOWNLOAD_EXCEL_EXAMPLE_BUTTON")} (EN)
                </a>
                <a
                  href="/assets/excel/testset_template_demo_nl.xlsx"
                  download
                  className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-sm hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  {t("PAGE_UPLOAD_DOWNLOAD_EXCEL_EXAMPLE_BUTTON")} (NL)
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("PAGE_UPLOAD_DOWNLOAD_EXCEL_EXAMPLE")}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
