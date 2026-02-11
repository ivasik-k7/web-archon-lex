import { useState, useRef, useCallback } from 'react'
import {
  Printer, Download, Eye, EyeSlash, ArrowCounterClockwise,
  SlidersHorizontal, MagnifyingGlassPlus, MagnifyingGlassMinus,
  Image as ImageIcon, X, Seal, Warning
} from '@phosphor-icons/react'

import { Sidebar } from './components/Sidebar'

// Document forms + previews
import { UmowaKupnaSprzedazyForm, useUmowaKupnaSprzedazyData } from './documents/UmowaKupnaSprzedazy/Form'
import { UmowaKupnaSprzedazyPreview, RODOAppendix } from './documents/UmowaKupnaSprzedazy/Preview'
import { UmowaZlecenieForm, UmowaZleceniePreview, useUmowaZlecenieData } from './documents/UmowaZlecenie/index'
import { UmowaNajmuForm, UmowaNajmuPreview, useUmowaNajmuData, PelnomocnictwoForm, PelnomocnictwoPreview, usePelnomocnictwoData } from './documents/UmowaNajmu/index'

type PanelMode = 'split' | 'form' | 'preview'

export default function App() {
  const [activeDoc, setActiveDoc] = useState('umowa-kupna-sprzedazy')
  const [panelMode, setPanelMode] = useState<PanelMode>('split')
  const [zoom, setZoom] = useState(90)
  const [logoSrc, setLogoSrc] = useState<string | undefined>(undefined)
  const [showLogoPanel, setShowLogoPanel] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Document data hooks
  const uksData = useUmowaKupnaSprzedazyData()
  const uzData = useUmowaZlecenieData()
  const unData = useUmowaNajmuData()
  const pelnData = usePelnomocnictwoData()

  const handleDocSelect = useCallback((id: string) => {
    setActiveDoc(id)
  }, [])

  const handlePrint = () => window.print()

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => setLogoSrc(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
    setShowLogoPanel(false)
  }

  const handleReset = () => {
    if (confirm('Wyczyścić wszystkie dane?')) {
      if (activeDoc === 'umowa-kupna-sprzedazy') uksData.reset()
      else if (activeDoc === 'umowa-zlecenie') uzData.reset()
      else if (activeDoc === 'umowa-najmu') unData.reset()
      else if (activeDoc === 'pelnomocnictwo') pelnData.reset()
    }
  }

  const renderForm = () => {
    switch (activeDoc) {
      case 'umowa-kupna-sprzedazy':
        return <UmowaKupnaSprzedazyForm data={uksData.data} onChange={uksData.setData} />
      case 'umowa-zlecenie':
        return <UmowaZlecenieForm data={uzData.data} onChange={uzData.setData} />
      case 'umowa-najmu':
        return <UmowaNajmuForm data={unData.data} onChange={unData.setData} />
      case 'pelnomocnictwo':
        return <PelnomocnictwoForm data={pelnData.data} onChange={pelnData.setData} />
      default:
        return <ComingSoon />
    }
  }

  const renderPreview = () => {
    switch (activeDoc) {
      case 'umowa-kupna-sprzedazy':
        return (
          <>
            <UmowaKupnaSprzedazyPreview data={uksData.data} logoSrc={logoSrc} />
            {uksData.data.include_rodo && (
              <div style={{ marginTop: 24 }}>
                <RODOAppendix sellerName={uksData.data.sprzedajacy_imie} />
              </div>
            )}
          </>
        )
      case 'umowa-zlecenie':
        return <UmowaZleceniePreview data={uzData.data} />
      case 'umowa-najmu':
        return <UmowaNajmuPreview data={unData.data} />
      case 'pelnomocnictwo':
        return <PelnomocnictwoPreview data={pelnData.data} />
      default:
        return <ComingSoon />
    }
  }

  const showForm = panelMode !== 'preview'
  const showPreview = panelMode !== 'form'

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle no-print"
        style={{ background: 'rgba(5,6,8,0.95)', backdropFilter: 'blur(18px)', minHeight: 52 }}>
        <div className="flex items-center gap-3">
          <DocBreadcrumb docId={activeDoc} />
        </div>
        <div className="flex items-center gap-2">
          {/* Panel mode toggle */}
          <div className="flex items-center rounded-sm border border-border-subtle overflow-hidden">
            {([
              { mode: 'form' as PanelMode, icon: <SlidersHorizontal size={14} />, label: 'Formularz' },
              { mode: 'split' as PanelMode, icon: <Seal size={14} />, label: 'Podział' },
              { mode: 'preview' as PanelMode, icon: <Eye size={14} />, label: 'Podgląd' },
            ]).map(item => (
              <button key={item.mode}
                onClick={() => setPanelMode(item.mode)}
                title={item.label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200
                  ${panelMode === item.mode ? 'bg-brand/15 text-brand' : 'text-ink-low hover:text-ink-med'}`}>
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Zoom (preview only) */}
          {showPreview && (
            <div className="flex items-center gap-1 border border-border-subtle rounded-sm px-1">
              <button className="btn-ghost p-1.5" onClick={() => setZoom(z => Math.max(50, z - 10))}><MagnifyingGlassMinus size={14} /></button>
              <span className="text-xs text-ink-low w-10 text-center">{zoom}%</span>
              <button className="btn-ghost p-1.5" onClick={() => setZoom(z => Math.min(130, z + 10))}><MagnifyingGlassPlus size={14} /></button>
            </div>
          )}

          {/* Logo */}
          <div className="relative">
            <button className="btn-ghost p-1.5 border border-border-subtle rounded-sm"
              onClick={() => setShowLogoPanel(!showLogoPanel)} title="Logo / watermark">
              <ImageIcon size={14} />
            </button>
            {showLogoPanel && (
              <div className="absolute right-0 top-full mt-2 z-50 glass-panel rounded-md p-3 w-52 space-y-2 animate-scale-in">
                <p className="text-xs text-ink-low font-medium">Watermark logo</p>
                <button className="btn-secondary text-xs py-1.5 px-3 w-full justify-center"
                  onClick={() => logoInputRef.current?.click()}>
                  <ImageIcon size={12} /> Wgraj logo
                </button>
                {logoSrc && (
                  <button className="btn-ghost text-xs py-1.5 w-full justify-center text-red-400 hover:text-red-300"
                    onClick={() => { setLogoSrc(undefined); setShowLogoPanel(false) }}>
                    <X size={12} /> Usuń logo
                  </button>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-border-subtle" />

          <button className="btn-ghost p-1.5 border border-border-subtle rounded-sm" onClick={handleReset} title="Wyczyść">
            <ArrowCounterClockwise size={14} />
          </button>

          <button className="btn-secondary py-1.5 px-3 text-xs" onClick={handlePrint}>
            <Printer size={14} />
            Drukuj
          </button>

          <button className="btn-primary py-1.5 px-3 text-xs" onClick={handlePrint}>
            <Download size={14} />
            Zapisz PDF
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="no-print">
          <Sidebar activeId={activeDoc} onSelect={handleDocSelect} />
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Form panel */}
          {showForm && (
            <div className={`flex flex-col overflow-hidden border-r border-border-subtle no-print
              ${panelMode === 'form' ? 'flex-1' : 'w-[420px] shrink-0'}`}
              style={{ background: '#0a0c10' }}>
              <div className="flex-1 overflow-y-auto px-5 pt-5">
                {renderForm()}
              </div>
            </div>
          )}

          {/* Preview panel */}
          {showPreview && (
            <div className={`flex flex-col overflow-hidden ${panelMode === 'preview' ? 'flex-1' : 'flex-1'}`}
              style={{ background: '#1a1a1a' }}>
              <div className="flex-1 overflow-y-auto p-8" ref={previewRef}>
                <div
                  style={{
                    transformOrigin: 'top center',
                    transform: `scale(${zoom / 100})`,
                    marginBottom: zoom < 100 ? `${(100 - zoom) * -2}%` : 0
                  }}>
                  {renderPreview()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Breadcrumb showing current document
function DocBreadcrumb({ docId }: { docId: string }) {
  const labels: Record<string, { name: string; category: string }> = {
    'umowa-kupna-sprzedazy': { name: 'Umowa Kupna-Sprzedaży', category: 'Sprzedaż' },
    'umowa-zlecenie': { name: 'Umowa Zlecenie', category: 'Usługi' },
    'umowa-najmu': { name: 'Umowa Najmu', category: 'Nieruchomości' },
    'pelnomocnictwo': { name: 'Pełnomocnictwo', category: 'Prawo' },
  }
  const doc = labels[docId]
  if (!doc) return null
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-low">{doc.category}</span>
      <span className="text-ink-low">/</span>
      <span className="text-sm font-medium text-ink-high">{doc.name}</span>
    </div>
  )
}

// Placeholder for unavailable docs
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
