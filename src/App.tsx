import { useEffect, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AssessmentPage } from "@/pages/AssessmentPage"
import { ItemPage } from "@/pages/ItemPage"
import { UploadPage } from "@/pages/UploadPage"
import { useAnalysisStore } from "@/store/analysis-store"

function RequireAnalysis({ children }: { children: React.ReactNode }) {
  const analysis = useAnalysisStore((s) => s.analysis)
  const [hydrated, setHydrated] = useState(() => useAnalysisStore.persist.hasHydrated())

  useEffect(() => {
    if (useAnalysisStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }

    return useAnalysisStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
  }, [])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!analysis) return <Navigate to="/upload" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAnalysis>
            <DashboardLayout />
          </RequireAnalysis>
        }
      >
        <Route index element={<Navigate to="assessment" replace />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="item/:id" element={<ItemPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/upload" replace />} />
    </Routes>
  )
}
