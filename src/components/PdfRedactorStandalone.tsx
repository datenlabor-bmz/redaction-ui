import { useCallback, useEffect, useState } from 'react'
import type { PdfRedactorStandaloneProps, Redaction } from '../types'
import { PdfRedactor } from './PdfRedactor'
import { FileUploader } from './FileUploader'

export function PdfRedactorStandalone({
  file: fileProp,
  rules = [],
  initialRedactions = [],
  aiSuggestions,
  onPageTextExtracted,
  onRedactionsChange,
  onExport,
  onFileSelect,
  uploadLabel = 'PDF hochladen',
  uploadButtonLabel = 'PDF auswählen'
}: PdfRedactorStandaloneProps) {
  const [file, setFile] = useState<File | null>(fileProp || null)
  const [redactions, setRedactions] = useState<Redaction[]>(initialRedactions)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  // Update file when prop changes
  useEffect(() => {
    if (fileProp) {
      setFile(fileProp)
    }
  }, [fileProp])

  // Merge AI suggestions into redactions
  useEffect(() => {
    if (aiSuggestions && aiSuggestions.length > 0) {
      setRedactions(prev => {
        // Find suggestions that aren't already in redactions (by ID)
        const existingIds = new Set(prev.map(r => r.id))
        const newSuggestions = aiSuggestions.filter(s => !existingIds.has(s.id))
        
        if (newSuggestions.length > 0) {
          const updated = [...prev, ...newSuggestions]
          onRedactionsChange?.(updated)
          return updated
        }
        return prev
      })
    }
  }, [aiSuggestions, onRedactionsChange])

  // Notify when redactions change
  const updateRedactions = useCallback((updater: (prev: Redaction[]) => Redaction[]) => {
    setRedactions(prev => {
      const updated = updater(prev)
      onRedactionsChange?.(updated)
      return updated
    })
  }, [onRedactionsChange])

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    setRedactions([])
    onFileSelect?.(selectedFile)
  }, [onFileSelect])

  const handleRedactionAdd = useCallback((redaction: Redaction) => {
    updateRedactions(prev => [...prev, redaction])
  }, [updateRedactions])

  const handleRedactionRemove = useCallback((id: string) => {
    updateRedactions(prev => prev.filter(r => r.id !== id))
  }, [updateRedactions])

  const handleRedactionUpdate = useCallback((id: string, updates: Partial<Redaction>) => {
    updateRedactions(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [updateRedactions])

  const handleExport = useCallback((blob: Blob, _applied: boolean) => {
    if (onExport) {
      onExport(blob, redactions.filter(r => r.shouldApply !== false))
    } else {
      // Default behavior: download the file
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file?.name || 'document.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [onExport, redactions, file])

  const handleSelectionChange = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
  }, [])

  // Show file uploader if no file
  if (!file) {
    return (
      <FileUploader
        onFileSelect={handleFileSelect}
        label={uploadLabel}
        buttonLabel={uploadButtonLabel}
      />
    )
  }

  return (
    <PdfRedactor
      file={file}
      redactions={redactions}
      rules={rules}
      selectedId={selectedId}
      zoom={zoom}
      onRedactionAdd={handleRedactionAdd}
      onRedactionRemove={handleRedactionRemove}
      onRedactionUpdate={handleRedactionUpdate}
      onExport={handleExport}
      onSelectionChange={handleSelectionChange}
      onZoomChange={handleZoomChange}
      onPageTextExtracted={onPageTextExtracted}
    />
  )
}

