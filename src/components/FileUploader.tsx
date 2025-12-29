import { useRef, useState } from 'react'

export interface FileUploaderProps {
  onFileSelect: (file: File) => void
  label?: string
  buttonLabel?: string
  acceptedTypes?: string
}

export function FileUploader({
  onFileSelect,
  label = 'PDF hochladen',
  buttonLabel = 'PDF auswählen',
  acceptedTypes = 'application/pdf'
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      onFileSelect(file)
    } else {
      alert('Bitte nur PDF-Dateien hochladen.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragging ? '#4285f4' : '#ccc'}`,
        borderRadius: '8px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: isDragging ? 'rgba(66, 133, 244, 0.1)' : 'transparent',
        transition: 'all 0.2s',
        cursor: 'pointer',
        margin: '20px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type='file'
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept={acceptedTypes}
        onChange={handleFileChange}
      />
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
      <h3 style={{ margin: '0 0 16px 0' }}>
        {isDragging ? 'PDF hier ablegen' : label}
      </h3>
      <p style={{ margin: '0 0 24px 0', color: '#666' }}>
        Ziehen Sie eine PDF-Datei hierher oder klicken Sie zum Auswählen
      </p>
      <button
        style={{
          padding: '8px 16px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

