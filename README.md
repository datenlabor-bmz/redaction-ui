# @datenlabor-bmz/redaction-ui

A React component library for PDF viewing and redaction.

## Demo

To run the demo:

```bash
cd demo
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Installation

```bash
npm install @datenlabor-bmz/redaction-ui
```

## Components

### PdfRedactorStandalone (Recommended)

Manages its own internal state. Simpler API for basic usage with optional AI integration hooks.

```tsx
import { PdfRedactorStandalone } from '@datenlabor-bmz/redaction-ui';

<PdfRedactorStandalone
  rules={myRules}
  onExport={(blob, redactions) => handleExport(blob, redactions)}
  
  // Optional: AI integration
  aiSuggestions={suggestionsFromAI}
  onPageTextExtracted={(text, pageIndex) => sendToAI(text, pageIndex)}
/>
```

### PdfRedactor (Controlled)

Fully controlled component where all state is passed as props. Use this for advanced integrations where you manage state externally.

```tsx
import { PdfRedactor, Redaction } from '@datenlabor-bmz/redaction-ui';

const [redactions, setRedactions] = useState<Redaction[]>([]);

<PdfRedactor
  file={pdfFile}
  redactions={redactions}
  onRedactionAdd={(r) => setRedactions(prev => [...prev, r])}
  onRedactionRemove={(id) => setRedactions(prev => prev.filter(r => r.id !== id))}
  onRedactionUpdate={(id, updates) => setRedactions(prev => 
    prev.map(r => r.id === id ? { ...r, ...updates } : r)
  )}
  onExport={(blob, applied) => downloadBlob(blob)}
/>
```

## AI Integration

The library provides hooks for AI-powered redaction suggestions:

```tsx
<PdfRedactorStandalone
  rules={rules}
  // Called when page text is extracted - send this to your AI
  onPageTextExtracted={(text, pageIndex) => {
    sendToAI(text, pageIndex).then(suggestions => {
      setAiSuggestions(suggestions)
    })
  }}
  // AI suggestions are merged into the redaction list
  aiSuggestions={aiSuggestions}
/>
```

## Bundler Configuration

This library uses MuPDF which requires specific bundler configuration for WASM and Web Workers.

### Vite

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // Required: exclude mupdf from pre-bundling (loads WASM dynamically)
  optimizeDeps: {
    exclude: ['mupdf']
  },
  // Required: ES module format for workers
  worker: {
    format: 'es'
  },
  // Required: modern target for top-level await support
  build: {
    target: 'esnext'
  }
})
```


## Types

The library exports all TypeScript types:

- `Redaction` - A redaction annotation
- `RedactionPart` - A single rectangular region
- `RedactionRule` - A legal rule/justification for redaction
- `PdfRedactorProps` - Props for controlled component
- `PdfRedactorStandaloneProps` - Props for standalone component

## Defining Rules

Rules provide legal justifications for redactions:

```typescript
import { RedactionRule } from '@datenlabor-bmz/redaction-ui';

const rules: RedactionRule[] = [
  {
    group: 'Personal Data',      // Optional grouping
    title: 'Name',               // Display title
    reference: 'GDPR Art. 4(1)', // Legal reference
    reason: 'Personal identification information',
    full_text: 'Full legal text...',
    url: 'https://...'           // Optional link to law
  }
];
```

## License

AGPL-3.0 - This library is based on [mupdf.js](https://github.com/ArtifexSoftware/mupdf.js) which is licensed under the GNU Affero General Public License.
