// App.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Pure composition — no switch statements, no document-specific imports.
// All doc types live in documentRegistry.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react'
import { Warning } from '@phosphor-icons/react'

import { Sidebar } from './components/Sidebar'
import DocumentControlHeader, { DocumentControlProvider, useDocumentControlContext } from './components/DocumentControlHeader'
import { getDocument, getAllDocuments, noValidation } from './registry'

import './registry'
import { DocumentStoreProvider } from './context/DocumentStoreContext'

// ─── Root (provides context) ──────────────────────────────────────────────────

export default function App() {
  return (
    <DocumentStoreProvider>
      <DocumentControlProvider initialState={{ panelMode: 'split', zoom: 90 }}>
        <AppContent />
      </DocumentControlProvider>
    </DocumentStoreProvider>
  )
}

// ─── App shell ────────────────────────────────────────────────────────────────

function AppContent() {
  const [activeDocId, setActiveDocId] = useState(() => getAllDocuments()[0]?.meta.id ?? '')
  const previewRef = useRef<HTMLDivElement>(null)

  const {
    state: { panelMode, zoom, logoSrc },
    setPanelMode,
    setZoom,
    setLogo,
    reset,
  } = useDocumentControlContext()

  // ─── Active document ──────────────────────────────────────────────────────

  const docEntry = getDocument(activeDocId)

  // ─── Per-document data (uses the registered hook) ─────────────────────────
  // Each document's data lives in its own hook; we render a tiny wrapper
  // component so the hook can be called unconditionally per doc type.

  const handleDocSelect = useCallback((id: string) => {
    setActiveDocId(id)
    setPanelMode('split')
  }, [setPanelMode])

  const handleReset = useCallback((docId: string) => {
    if (window.confirm('Czy na pewno chcesz wyczyścić wszystkie dane formularza?')) {
      // Get the document entry to access its default data
      reset()
      // const docEntry = getDocument(docId)
      // if (docEntry) {
      //   // Call the reset method from the store
      //   const { reset } = docEntry.useData(docId)
      //   reset()
      // }
    }
  }, [])
  const showForm = panelMode !== 'preview'
  const showPreview = panelMode !== 'form'

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      {docEntry ? (
        <DocAwareHeader
          docEntry={docEntry}
          panelMode={panelMode}
          zoom={zoom}
          logoSrc={logoSrc}
          onReset={handleReset}
          onPanelModeChange={setPanelMode}
          onZoomChange={setZoom}
          onLogoChange={setLogo}
        />
      ) : null}

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        <div className="no-print">
          <Sidebar
            activeId={activeDocId}
            onSelect={handleDocSelect}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {showForm && (
            <div
              className={`flex flex-col overflow-hidden border-r border-border-subtle no-print
                ${panelMode === 'form' ? 'flex-1' : 'w-[420px] shrink-0'}`}
              style={{ background: '#0a0c10' }}
            >
              <div className="flex-1 overflow-y-auto px-5 pt-5">
                {docEntry
                  ? <DocForm docEntry={docEntry} />
                  : <ComingSoon />
                }
              </div>
            </div>
          )}

          {showPreview && (
            <div
              className="flex flex-col overflow-hidden flex-1"
              style={{ background: '#1a1a1a' }}
            >
              <div className="flex-1 overflow-y-auto p-8" ref={previewRef}>
                <div
                  style={{
                    transformOrigin: 'top center',
                    transform: `scale(${zoom / 100})`,
                    marginBottom: zoom < 100 ? `${(100 - zoom) * -2}%` : 0,
                  }}
                >
                  {docEntry
                    ? <DocPreview docEntry={docEntry} logoSrc={logoSrc} />
                    : <ComingSoon />
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DocAwareHeader — wraps the registered data hook so validation is live
// ─────────────────────────────────────────────────────────────────────────────

interface DocAwareHeaderProps {
  docEntry: ReturnType<typeof getDocument> & {}
  panelMode: string
  zoom: number
  logoSrc?: string
  onReset: () => void
  onPanelModeChange: (m: any) => void
  onZoomChange: (z: number) => void
  onLogoChange: (l: string | undefined) => void
}

function DocAwareHeader({
  docEntry,
  panelMode,
  zoom,
  logoSrc,
  onReset,
  onPanelModeChange,
  onZoomChange,
  onLogoChange,
}: DocAwareHeaderProps) {
  // Same document ID = same store instance
  const { data } = docEntry.useData(docEntry.meta.id)
  const validation = (docEntry.validate ?? noValidation)(data)

  return (
    <DocumentControlHeader
      docId={docEntry.meta.id}
      docName={docEntry.meta.title}
      validation={validation}
      config={{
        enableZoom: true,
        enableLogo: true,
        enablePanelMode: true,
        enableExport: true,
        minZoom: 50,
        maxZoom: 130,
        zoomStep: 10,
      }}
      callbacks={{
        onReset,
        onPrint: () => window.print(),
        onExportPDF: () => window.print(),
        onPanelModeChange,
        onZoomChange,
        onLogoChange,
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DocForm / DocPreview — thin wrappers that own the data hook per doc
// ─────────────────────────────────────────────────────────────────────────────

function DocForm({ docEntry }: { docEntry: NonNullable<ReturnType<typeof getDocument>> }) {
  // IMPORTANT: Pass the document ID to ensure all components share the same store
  const { data, setData } = docEntry.useData(docEntry.meta.id)

  if (!docEntry.meta.isAvailable) return <ComingSoon />
  return <docEntry.Form data={data} onChange={setData} />
}

function DocPreview({
  docEntry,
  logoSrc,
}: {
  docEntry: NonNullable<ReturnType<typeof getDocument>>
  logoSrc?: string
}) {
  const { data } = docEntry.useData(docEntry.meta.id)

  if (!docEntry.meta.isAvailable) return <ComingSoon />
  return <docEntry.Preview data={data} logoSrc={logoSrc} />
}

// ─── Coming soon placeholder ──────────────────────────────────────────────────

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-8">
      <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
        <Warning size={24} className="text-brand" />
      </div>
      <h3 className="text-lg font-semibold text-ink-high mb-2">Wkrótce dostępne</h3>
      <p className="text-sm text-ink-low max-w-xs">
        Ten typ dokumentu jest aktualnie w przygotowaniu. Wróć wkrótce.
      </p>
    </div>
  )
}