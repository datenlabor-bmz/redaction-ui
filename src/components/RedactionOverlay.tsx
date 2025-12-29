import type { Redaction, RedactionPart, HighlightInProgress, PageData, WordData } from '../types'
import { finalizeHighlight } from '../utils/geometry'

interface RedactionBoxProps {
  part: RedactionPart
  shouldApply?: boolean
  isIndeterminate?: boolean
}

function RedactionBox({ part, shouldApply = true, isIndeterminate = false }: RedactionBoxProps) {
  let fill: string
  let fillOpacity: number
  let stroke: string

  if (isIndeterminate) {
    fill = 'none'
    fillOpacity = 0
    stroke = '#999'
  } else if (shouldApply) {
    fill = 'black'
    fillOpacity = 0.5
    stroke = 'black'
  } else {
    fill = 'orange'
    fillOpacity = 0.2
    stroke = 'orange'
  }

  return (
    <rect
      x={part.x}
      y={part.y}
      width={part.width}
      height={part.height}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeOpacity={1}
      strokeWidth={0}
      strokeDasharray={isIndeterminate ? '4,4' : 'none'}
      style={{ cursor: 'pointer' }}
    />
  )
}

interface RedactionGroupProps {
  redaction: Redaction
  isSelected: boolean
  onClick: (id: string, e: React.MouseEvent) => void
}

function RedactionGroup({ redaction, isSelected, onClick }: RedactionGroupProps) {
  // Calculate bounding box for selection border
  const xs0 = redaction.parts.map(part => part.x)
  const ys0 = redaction.parts.map(part => part.y)
  const xs1 = redaction.parts.map(part => part.x + part.width)
  const ys1 = redaction.parts.map(part => part.y + part.height)
  const bbox = {
    x0: Math.min(...xs0),
    y0: Math.min(...ys0),
    x1: Math.max(...xs1),
    y1: Math.max(...ys1)
  }

  return (
    <g
      onClick={(e) => onClick(redaction.id, e)}
      data-highlight='true'
      style={{ cursor: 'pointer' }}
    >
      {redaction.parts.map((part, index) => (
        <RedactionBox
          key={`${redaction.id}-${index}`}
          part={part}
          shouldApply={redaction.shouldApply}
          isIndeterminate={redaction.isIndeterminate}
        />
      ))}
      {isSelected && (
        <rect
          x={bbox.x0 - 2}
          y={bbox.y0 - 2}
          width={bbox.x1 - bbox.x0 + 4}
          height={bbox.y1 - bbox.y0 + 4}
          fill='none'
          stroke='#4285f4'
          strokeWidth={2}
          strokeDasharray='4,4'
          pointerEvents='none'
        />
      )}
    </g>
  )
}

export interface RedactionOverlayProps {
  pageIndex: number
  pageWidth: number
  pageHeight: number
  pageData: PageData
  redactions: Redaction[]
  selectedId: string | null
  currentHighlight: HighlightInProgress | null
  onRedactionClick: (id: string, e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent<SVGSVGElement>, pageIndex: number) => void
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
  onMouseUp: () => void
  showWordBoxes?: boolean
}

export function RedactionOverlay({
  pageIndex,
  pageWidth,
  pageHeight,
  pageData,
  redactions,
  selectedId,
  currentHighlight,
  onRedactionClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  showWordBoxes = false
}: RedactionOverlayProps) {
  const pageRedactions = redactions.filter(r => r.pageIndex === pageIndex)

  // Render current highlight being drawn
  const renderCurrentHighlight = () => {
    if (!currentHighlight || currentHighlight.pageIndex !== pageIndex) return null
    const finalized = finalizeHighlight(pageData, currentHighlight)
    return (
      <g>
        {finalized.parts.map((part, index) => (
          <RedactionBox key={`current-${index}`} part={part} shouldApply={true} />
        ))}
      </g>
    )
  }

  return (
    <svg
      width='100%'
      height='100%'
      viewBox={`0 0 ${pageWidth} ${pageHeight}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: 'crosshair'
      }}
      onMouseDown={(e) => onMouseDown(e, pageIndex)}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Optional word boundary visualization */}
      {showWordBoxes && pageData.words.map((word: WordData, index: number) => {
        const { x0, y0, x1, y1 } = word.bbox
        return (
          <rect
            key={`word-${index}`}
            x={x0}
            y={y0}
            width={x1 - x0}
            height={y1 - y0}
            fill='rgba(0, 0, 0, 0)'
            stroke='blue'
            strokeWidth={0}
            style={{ cursor: 'text' }}
          />
        )
      })}

      {/* Render existing redactions */}
      {pageRedactions.map(redaction => (
        <RedactionGroup
          key={redaction.id}
          redaction={redaction}
          isSelected={selectedId === redaction.id}
          onClick={onRedactionClick}
        />
      ))}

      {/* Render highlight being drawn */}
      {renderCurrentHighlight()}
    </svg>
  )
}

