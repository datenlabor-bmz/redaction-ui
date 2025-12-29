import type { Redaction, HighlightInProgress, PageData } from '../types'
import { RedactionOverlay } from './RedactionOverlay'

export interface PdfPageProps {
  pageIndex: number
  pageData: PageData
  zoom: number
  redactions: Redaction[]
  selectedId: string | null
  currentHighlight: HighlightInProgress | null
  onRedactionClick: (id: string, e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent<SVGSVGElement>, pageIndex: number) => void
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
  onMouseUp: () => void
}

export function PdfPage({
  pageIndex,
  pageData,
  zoom,
  redactions,
  selectedId,
  currentHighlight,
  onRedactionClick,
  onMouseDown,
  onMouseMove,
  onMouseUp
}: PdfPageProps) {
  const [, , pw, ph] = pageData.bounds

  return (
    <div>
      <div
        data-page-index={pageIndex}
        style={{
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
          margin: '10px',
          borderRadius: '2px',
          position: 'relative',
          width: `${(pw * zoom) / 100}px`,
          height: `${(ph * zoom) / 100}px`
        }}
      >
        <img
          src={pageData.image}
          style={{
            width: '100%',
            height: '100%'
          }}
          alt={`Page ${pageIndex + 1}`}
        />
        <RedactionOverlay
          pageIndex={pageIndex}
          pageWidth={pw}
          pageHeight={ph}
          pageData={pageData}
          redactions={redactions}
          selectedId={selectedId}
          currentHighlight={currentHighlight}
          onRedactionClick={onRedactionClick}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
      </div>

      {/* Page number */}
      <div style={{
        textAlign: 'center',
        color: '#666',
        fontSize: '12px',
        margin: '8px 0 16px 0',
        fontWeight: '500'
      }}>
        Seite {pageIndex + 1}
      </div>
    </div>
  )
}

