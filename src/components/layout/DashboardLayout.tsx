import { useState } from "react"
import { ArrowLeft, BarChart3, Globe, Menu } from "lucide-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { AnalysisFilters } from "@/components/AnalysisFilters"
import { ItemNavigator } from "@/components/ItemNavigator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAnalysisStore } from "@/store/analysis-store"
import { useTranslation } from "@/i18n/use-translation"

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const language = useAnalysisStore((s) => s.language)
  const setLanguage = useAnalysisStore((s) => s.setLanguage)
  const analysis = useAnalysisStore((s) => s.analysis)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const closeMobileNav = () => setMobileNavOpen(false)

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-center border-b px-4">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <BarChart3 className="h-5 w-5" />
          <span>C-Analysis</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <ItemNavigator onNavigate={closeMobileNav} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:bg-card">
        {sidebar}
      </div>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" className="lg:hidden" />
                }
              >
                <Menu className="h-4 w-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                {sidebar}
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1 basis-full sm:basis-0">
              <AnalysisFilters />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value as "en" | "nl")}
              >
                <SelectTrigger className="w-[110px]">
                  <Globe className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="nl">Nederlands</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => navigate("/upload")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("GENERAL_BUTTON_UPLOAD")}
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          {analysis ? (
            <div className="mb-4 text-sm text-muted-foreground">
              {analysis.name}
              {location.pathname.includes("/item/") ? (
                <>
                  {" "}
                  · <Link to="/dashboard/assessment">{t("GENERAL_ASSESSMENT")}</Link>
                </>
              ) : null}
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
