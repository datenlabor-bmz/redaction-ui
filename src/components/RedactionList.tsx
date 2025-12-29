import { useRef, useState } from 'react'
import type { Redaction, RedactionRule, PageData } from '../types'
import { boundingBox, getRedactionText } from '../utils/geometry'
import { RuleSelector } from './RuleSelector'

export interface RedactionListProps {
  redactions: Redaction[]
  pages: PageData[]
  rules: RedactionRule[]
  selectedId: string | null
  onSelectionChange: (id: string | null) => void
  onRedactionUpdate: (id: string, updates: Partial<Redaction>) => void
  onScrollToPage: (pageIndex: number) => void
  isLoading?: boolean
}

export function RedactionList({
  redactions,
  pages,
  rules,
  selectedId,
  onSelectionChange,
  onRedactionUpdate,
  onScrollToPage,
  isLoading = false
}: RedactionListProps) {
  const [showRuleSelector, setShowRuleSelector] = useState(false)
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 })
  const ruleSelectorRef = useRef<HTMLDivElement>(null)

  const handleToggleShouldApply = (id: string) => {
    const redaction = redactions.find(r => r.id === id)
    if (redaction) {
      onRedactionUpdate(id, { shouldApply: !redaction.shouldApply })
    }
  }

  const handleRuleSelect = (rule?: RedactionRule) => {
    if (selectedId) {
      onRedactionUpdate(selectedId, { rule })
      setShowRuleSelector(false)
    }
  }

  const handleRowClick = (redaction: Redaction) => {
    if (selectedId === redaction.id) {
      onSelectionChange(null)
      setShowRuleSelector(false)
    } else {
      onSelectionChange(redaction.id)
      setShowRuleSelector(false)
      onScrollToPage(redaction.pageIndex)
    }
  }

  const handleRuleSelectorClick = (e: React.MouseEvent, redaction: Redaction) => {
    e.stopPropagation()
    if (selectedId === redaction.id && showRuleSelector) {
      setShowRuleSelector(false)
      onSelectionChange(null)
    } else {
      onSelectionChange(redaction.id)
      setShowRuleSelector(true)
      const rect = e.currentTarget.getBoundingClientRect()
      setSelectorPosition({ x: rect.left, y: rect.bottom + 5 })
    }
  }

  // Group redactions by page
  const groupedRedactions = redactions.reduce((acc, redaction) => {
    const pageNum = redaction.pageIndex + 1
    if (!acc[pageNum]) acc[pageNum] = []
    acc[pageNum].push(redaction)
    return acc
  }, {} as Record<number, Redaction[]>)

  const getHighlightText = (redaction: Redaction): string => {
    if (!pages[redaction.pageIndex]) return ''
    return getRedactionText(redaction, pages[redaction.pageIndex])
  }

  return (
    <div
      style={{
        width: '100%',
        padding: '16px',
        overflowY: 'auto',
        direction: 'rtl',
        opacity: isLoading ? 0.6 : 1,
        transition: 'opacity 0.3s ease'
      }}
    >
      <style>
        {`
          .ai-badge-container:hover .tooltip {
            opacity: 1 !important;
            visibility: visible !important;
          }
          .checkbox-container:hover .checkbox-tooltip {
            opacity: 1 !important;
            visibility: visible !important;
          }
          .tooltip, .checkbox-tooltip {
            visibility: hidden;
          }
          .custom-checkbox {
            appearance: none;
            width: 14px;
            height: 14px;
            border: 2px solid #d1d5db;
            border-radius: 2px;
            background-color: white;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease;
          }
          .custom-checkbox:checked {
            background-color: #000;
            border-color: #000;
          }
          .custom-checkbox:hover {
            border-color: #4285f4;
            box-shadow: 0 0 0 1px rgba(66, 133, 244, 0.2);
          }
        `}
      </style>

      <div style={{ direction: 'ltr', position: 'relative' }}>
        {/* Rule Selector Popup */}
        {showRuleSelector && selectedId && (
          <div
            ref={ruleSelectorRef}
            style={{
              position: 'fixed',
              top: `${selectorPosition.y}px`,
              left: `${selectorPosition.x}px`,
              zIndex: 1000
            }}
          >
            <RuleSelector
              rules={rules}
              onRuleSelect={handleRuleSelect}
              selectedRule={redactions.find(r => r.id === selectedId)?.rule}
            />
          </div>
        )}

        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Sensible Daten ({redactions.length})
        </h3>

        {redactions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            padding: '20px 0'
          }}>
            Keine sensiblen Daten gefunden
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(groupedRedactions)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([pageNum, pageRedactions]) => (
                <div key={`page-${pageNum}`} style={{ marginBottom: '8px' }}>
                  {/* Page header */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#495057',
                    borderRadius: '6px 6px 0 0',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    Seite {pageNum} ({pageRedactions.length})
                  </div>

                  {/* Redactions table */}
                  <div style={{
                    border: '1px solid #e0e0e0',
                    borderTop: 'none',
                    borderRadius: '0 0 6px 6px',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    {pageRedactions.map((redaction, index) => {
                      const redactedText = getHighlightText(redaction)
                      return (
                        <div
                          key={redaction.id}
                          data-highlight-id={redaction.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '11px',
                            backgroundColor: selectedId === redaction.id ? '#e8f4fd' : 'white',
                            borderBottom: index < pageRedactions.length - 1 ? '1px solid #f0f0f0' : 'none',
                            cursor: 'pointer',
                            minHeight: '32px',
                            padding: '6px 10px',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleRowClick(redaction)}
                          onMouseEnter={e => {
                            if (selectedId !== redaction.id) {
                              e.currentTarget.style.backgroundColor = '#f8f9fa'
                            }
                          }}
                          onMouseLeave={e => {
                            if (selectedId !== redaction.id) {
                              e.currentTarget.style.backgroundColor = 'white'
                            }
                          }}
                        >
                          {/* Checkbox */}
                          <div className="checkbox-container" style={{ position: 'relative', flexShrink: 0 }}>
                            <input
                              type="checkbox"
                              className="custom-checkbox"
                              checked={redaction.isIndeterminate ? false : (redaction.shouldApply ?? true)}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleToggleShouldApply(redaction.id)
                              }}
                            />
                            <div
                              className="checkbox-tooltip"
                              style={{
                                position: 'absolute',
                                bottom: '50%',
                                left: '100%',
                                transform: 'translateY(50%)',
                                backgroundColor: '#333',
                                color: 'white',
                                padding: '6px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                whiteSpace: 'nowrap',
                                zIndex: 1000,
                                opacity: 0,
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s, visibility 0.2s',
                                marginLeft: '8px',
                                visibility: 'hidden'
                              }}
                            >
                              Zum Schwärzen markieren
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '-4px',
                                transform: 'translateY(-50%)',
                                width: 0,
                                height: 0,
                                borderTop: '4px solid transparent',
                                borderBottom: '4px solid transparent',
                                borderRight: '4px solid #333'
                              }} />
                            </div>
                          </div>

                          {/* AI Status Badge */}
                          {redaction.isAutoGenerated ? (
                            <div className="ai-badge-container" style={{ position: 'relative', flexShrink: 0 }}>
                              <div
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: redaction.isIndeterminate
                                    ? '#6c757d'
                                    : (redaction.shouldApply ? '#10b981' : '#f59e0b'),
                                  cursor: 'help'
                                }}
                              />
                              {/* Tooltip for AI reason */}
                              {!redaction.isIndeterminate && redaction.reason && (
                                <div
                                  className="tooltip"
                                  style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '100%',
                                    transform: 'translateY(-50%)',
                                    backgroundColor: 'white',
                                    color: '#333',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    minWidth: '200px',
                                    maxWidth: '280px',
                                    whiteSpace: 'normal',
                                    zIndex: 1000,
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    transition: 'opacity 0.2s, visibility 0.2s',
                                    marginLeft: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    border: '1px solid #e0e0e0',
                                    visibility: 'hidden'
                                  }}
                                >
                                  <div style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px', fontWeight: '500' }}>
                                      KI-Empfehlung:
                                    </div>
                                    <span
                                      style={{
                                        backgroundColor: redaction.shouldApply ? '#10b981' : '#f59e0b',
                                        color: 'white',
                                        padding: '3px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                      }}
                                    >
                                      {redaction.shouldApply ? 'Schwärzen' : 'Nicht schwärzen'}
                                    </span>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px', fontWeight: '500' }}>
                                      Begründung:
                                    </div>
                                    <div style={{ lineHeight: '1.4' }}>
                                      {redaction.reason}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: '#6b7280',
                                flexShrink: 0
                              }}
                            />
                          )}

                          {/* Text content */}
                          <div style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#374151',
                            fontWeight: '500',
                            minWidth: 0
                          }}>
                            {redactedText || 'Kein Text gefunden'}
                          </div>

                          {/* Rule selector button */}
                          <div style={{ width: '130px', flexShrink: 0 }}>
                            <button
                              onClick={(e) => handleRuleSelectorClick(e, redaction)}
                              style={{
                                width: '100%',
                                fontSize: '9px',
                                padding: '3px 5px',
                                border: '1px solid #d1d5db',
                                borderRadius: '3px',
                                backgroundColor: 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: redaction.rule ? '#374151' : '#9ca3af',
                                fontWeight: redaction.rule ? '500' : '400',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#4285f4'
                                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(66, 133, 244, 0.1)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#d1d5db'
                                e.currentTarget.style.boxShadow = 'none'
                              }}
                            >
                              {redaction.rule?.title || 'Regel wählen...'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

