import { PdfRedactorStandalone, RedactionRule, Redaction } from '@datenlabor-bmz/redaction-ui'

// Sample redaction rules for the demo
const sampleRules: RedactionRule[] = [
  {
    group: 'Personal Data',
    title: 'Name',
    reference: 'GDPR Art. 4(1)',
    reason: 'Personal identification information',
    full_text: 'Any information relating to an identified or identifiable natural person.',
    url: 'https://gdpr-info.eu/art-4-gdpr/'
  },
  {
    group: 'Personal Data',
    title: 'Address',
    reference: 'GDPR Art. 4(1)',
    reason: 'Location data that can identify a person',
    full_text: 'Address information that can be used to identify a natural person.',
    url: 'https://gdpr-info.eu/art-4-gdpr/'
  },
  {
    group: 'Personal Data',
    title: 'Phone Number',
    reference: 'GDPR Art. 4(1)',
    reason: 'Contact information',
    full_text: 'Phone numbers that can be used to contact or identify a person.'
  },
  {
    group: 'Personal Data',
    title: 'Email',
    reference: 'GDPR Art. 4(1)',
    reason: 'Electronic contact information',
    full_text: 'Email addresses that can identify a natural person.'
  },
  {
    group: 'Financial',
    title: 'Bank Account',
    reference: 'GDPR Art. 9',
    reason: 'Financial data',
    full_text: 'Bank account numbers and financial identifiers.'
  },
  {
    group: 'Financial',
    title: 'Salary Information',
    reference: 'GDPR Art. 9',
    reason: 'Sensitive financial data',
    full_text: 'Salary and compensation information.'
  },
  {
    group: 'Official',
    title: 'Internal Reference',
    reference: 'Internal Policy',
    reason: 'Internal document references',
    full_text: 'Internal file numbers, case references, and tracking IDs.'
  }
]

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        padding: '12px 24px',
        backgroundColor: '#1a1a2e',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ fontSize: '24px' }}>📝</div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
            Redaction UI Demo
          </h1>
          <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>
            PDF redaction component library
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <PdfRedactorStandalone
          rules={sampleRules}
          uploadLabel="Upload a PDF to redact"
          uploadButtonLabel="Select PDF"
          onRedactionsChange={(redactions: Redaction[]) => {
            console.log('Redactions changed:', redactions.length, 'items')
          }}
          onExport={(blob: Blob, redactions: Redaction[]) => {
            console.log('Exporting PDF with', redactions.length, 'redactions')
            // Download the file
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'redacted-document.pdf'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}
          onPageTextExtracted={(text: string, pageIndex: number) => {
            console.log(`Page ${pageIndex + 1}: extracted ${text.length} characters`)
          }}
        />
      </main>
    </div>
  )
}

export default App

