import * as React from 'react'
import { useState, CSSProperties } from 'react'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({
  content,
  children,
  position = 'top',
}: TooltipProps) {
  const [show, setShow] = useState(false)

  const positions: Record<string, CSSProperties> = {
    top: {
      top: '-0.5rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(-100%)'
    },
    bottom: {
      bottom: '-0.5rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(100%)'
    },
    left: {
      left: '-0.5rem',
      top: '50%',
      transform: 'translateX(-100%) translateY(-50%)'
    },
    right: {
      right: '-0.5rem',
      top: '50%',
      transform: 'translateX(100%) translateY(-50%)'
    },
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          backgroundColor: 'white',
          color: '#333',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          minWidth: '180px',
          maxWidth: '20rem',
          animation: 'fadeIn 0.2s ease-in-out',
          ...positions[position]
        }}>
          {content}
        </div>
      )}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        `}
      </style>
    </div>
  )
}

