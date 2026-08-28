export class ImportException extends Error {
  readonly importErrorMessages: string[]

  constructor(importErrorMessages: string[], message = "") {
    super(message || importErrorMessages.join("\n"))
    this.name = "ImportException"
    this.importErrorMessages = importErrorMessages
  }
}
