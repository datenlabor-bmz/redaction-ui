// Main Components
export { PdfRedactor } from './components/PdfRedactor'
export { PdfRedactorStandalone } from './components/PdfRedactorStandalone'

// Sub-components (for advanced customization)
export { FileUploader } from './components/FileUploader'
export { RedactionList } from './components/RedactionList'
export { RedactionOverlay } from './components/RedactionOverlay'
export { PdfPage } from './components/PdfPage'
export { RuleSelector } from './components/RuleSelector'
export { Tooltip } from './components/Tooltip'

// Types
export type {
  // Core types
  Redaction,
  RedactionPart,
  RedactionRule,
  PageData,
  WordData,
  BoundingBox,
  HighlightInProgress,
  ExportOptions,
  
  // Component props
  PdfRedactorProps,
  PdfRedactorStandaloneProps,
} from './types'

// Utilities (for advanced use)
export {
  generateUUID,
  boundingBox,
  quadToPart,
  resultToRedaction,
  finalizeHighlight,
  getRedactionText,
  redactionsToAnnotations,
} from './utils/geometry'

// Hook (for very advanced use cases)
export { useMupdf } from './hooks/useMupdf'
