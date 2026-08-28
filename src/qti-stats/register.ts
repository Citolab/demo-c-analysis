import "@citolab/qti-components"
import "./qti-simple-choice-stats"
import "./qti-choice-interaction-stats"
import "./qti-extended-text-interaction-stats"

let registered = false

export function registerQtiStatsComponents() {
  if (registered) return
  registered = true
}
