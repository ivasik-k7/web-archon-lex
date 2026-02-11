// DocumentControlHeader.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Key architectural fixes vs. original:
//  1. Single source of truth — state lives ONLY in DocumentControlContext.
//     The component is now purely presentational (props → UI, callbacks → context).
//  2. Responsive by design — collapsible groups, not hidden sm:inline hacks.
//  3. Smaller focused sub-components, each in their own section.
//  4. The "Save" button is removed (it was cosmetic with no real side-effect).
// ─────────────────────────────────────────────────────────────────────────────

import React, {
    useState, useRef, useEffect, useCallback,
    createContext, useContext,
} from 'react'
import {
    SlidersHorizontal, Eye, MagnifyingGlassMinus, MagnifyingGlassPlus,
    ImageSquare, X, ArrowCounterClockwise, Printer, Download,
    CheckCircle, WarningCircle, Info, CaretRight, FileText,
    PaintBucket, Palette, CaretDown,
} from '@phosphor-icons/react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PanelMode = 'form' | 'split' | 'preview'

export interface DocumentControlConfig {
    enableZoom?: boolean
    enableLogo?: boolean
    enablePanelMode?: boolean
    enableExport?: boolean
    defaultPanelMode?: PanelMode
    minZoom?: number
    maxZoom?: number
    zoomStep?: number
}

export interface DocumentControlCallbacks {
    onPrint?: () => void
    onExportPDF?: () => void
    onReset?: () => void
    onPanelModeChange?: (mode: PanelMode) => void
    onZoomChange?: (zoom: number) => void
    onLogoChange?: (logo: string | undefined) => void
}

export interface DocumentControlState {
    panelMode: PanelMode
    zoom: number
    logoSrc?: string
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ContextValue {
    state: DocumentControlState
    setPanelMode: (m: PanelMode) => void
    setZoom: (z: number) => void
    setLogo: (l: string | undefined) => void
    reset: () => void
    print: () => void
    exportPDF: () => void
}

const DocumentControlContext = createContext<ContextValue | null>(null)

export function useDocumentControlContext(): ContextValue {
    const ctx = useContext(DocumentControlContext)
    if (!ctx) throw new Error('useDocumentControlContext must be inside <DocumentControlProvider>')
    return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface ProviderProps {
    children: React.ReactNode
    initialState?: Partial<DocumentControlState>
    config?: DocumentControlConfig
    callbacks?: DocumentControlCallbacks
}

export function DocumentControlProvider({ children, initialState, config, callbacks }: ProviderProps) {
    const defaultMode = config?.defaultPanelMode ?? 'split'

    const [state, setState] = useState<DocumentControlState>({
        panelMode: initialState?.panelMode ?? defaultMode,
        zoom: initialState?.zoom ?? 100,
        logoSrc: initialState?.logoSrc,
    })

    const setPanelMode = useCallback((panelMode: PanelMode) => {
        setState(s => ({ ...s, panelMode }))
        callbacks?.onPanelModeChange?.(panelMode)
    }, [callbacks])

    const setZoom = useCallback((zoom: number) => {
        setState(s => ({ ...s, zoom }))
        callbacks?.onZoomChange?.(zoom)
    }, [callbacks])

    const setLogo = useCallback((logoSrc: string | undefined) => {
        setState(s => ({ ...s, logoSrc }))
        callbacks?.onLogoChange?.(logoSrc)
    }, [callbacks])

    const reset = useCallback(() => {
        setState({ panelMode: defaultMode, zoom: 100, logoSrc: undefined })
        callbacks?.onReset?.()
    }, [defaultMode, callbacks])

    const print = useCallback(() => callbacks?.onPrint?.(), [callbacks])
    const exportPDF = useCallback(() => callbacks?.onExportPDF?.(), [callbacks])

    return (
        <DocumentControlContext.Provider value={{ state, setPanelMode, setZoom, setLogo, reset, print, exportPDF }}>
            {children}
        </DocumentControlContext.Provider>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({ docName }: { docName: string }) {
    return (
        <div className="flex items-center gap-1.5 text-sm min-w-0">
            <FileText size={14} className="text-ink-low shrink-0" />
            <span className="text-ink-low hidden md:inline shrink-0">Dokumenty</span>
            <CaretRight size={10} weight="bold" className="text-ink-lower shrink-0 hidden md:inline" />
            <span className="text-ink-high font-medium truncate">{docName}</span>
        </div>
    )
}

// ── Validation badge ──────────────────────────────────────────────────────────

interface ValidationProps {
    isValid: boolean
    errorsCount: number
    warningsCount: number
}

function ValidationBadge({ isValid, errorsCount, warningsCount }: ValidationProps) {
    if (isValid && warningsCount === 0) {
        return (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/20 text-success text-xs font-medium shrink-0">
                <CheckCircle size={13} weight="fill" />
                <span className="hidden lg:inline">Gotowy</span>
            </div>
        )
    }

    const hasErrors = errorsCount > 0
    return (
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium shrink-0
      ${hasErrors ? 'bg-error/10 border border-error/20 text-error' : 'bg-warning/10 border border-warning/20 text-warning'}`}>
            {hasErrors
                ? <WarningCircle size={13} weight="fill" />
                : <Info size={13} weight="fill" />
            }
            <span className="hidden lg:inline">
                {hasErrors ? `${errorsCount} błąd` : `${warningsCount} uwag`}
            </span>
        </div>
    )
}

// ── Panel mode toggle ─────────────────────────────────────────────────────────

const MODES: { id: PanelMode; icon: React.ReactNode; label: string }[] = [
    { id: 'form', icon: <SlidersHorizontal size={13} />, label: 'Formularz' },
    { id: 'split', icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.5" y="0.5" width="5.5" height="12" rx="1" stroke="currentColor" /><rect x="7" y="0.5" width="5.5" height="12" rx="1" stroke="currentColor" /></svg>, label: 'Podział' },
    { id: 'preview', icon: <Eye size={13} />, label: 'Podgląd' },
]

function ModeToggle({ current, onChange }: { current: PanelMode; onChange: (m: PanelMode) => void }) {
    return (
        <div className="flex items-center p-0.5 bg-bg-tertiary/40 border border-border-subtle rounded-lg shrink-0">
            {MODES.map(({ id, icon, label }) => {
                const active = current === id
                return (
                    <button
                        key={id}
                        onClick={() => onChange(id)}
                        title={label}
                        aria-label={label}
                        aria-pressed={active}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md transition-all duration-200
              ${active
                                ? 'bg-brand/20 text-brand shadow-sm'
                                : 'text-ink-low hover:text-ink-med hover:bg-ink-lower/10'
                            }`}
                    >
                        {icon}
                        <span className="hidden xl:inline font-medium">{label}</span>
                    </button>
                )
            })}
        </div>
    )
}

// ── Zoom control ──────────────────────────────────────────────────────────────

interface ZoomControlProps {
    zoom: number
    onZoomIn: () => void
    onZoomOut: () => void
    minZoom: number
    maxZoom: number
}

function ZoomControl({ zoom, onZoomIn, onZoomOut, minZoom, maxZoom }: ZoomControlProps) {
    return (
        <div className="hidden md:flex items-center gap-0.5 bg-bg-tertiary/40 border border-border-subtle rounded-lg px-1 py-1 shrink-0">
            <button
                onClick={onZoomOut}
                disabled={zoom <= minZoom}
                aria-label="Pomniejsz"
                className="p-1 rounded-md text-ink-low hover:text-ink-med hover:bg-ink-lower/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <MagnifyingGlassMinus size={13} />
            </button>

            <span className="text-xs font-mono text-ink-med w-9 text-center tabular-nums select-none">{zoom}%</span>

            <button
                onClick={onZoomIn}
                disabled={zoom >= maxZoom}
                aria-label="Powiększ"
                className="p-1 rounded-md text-ink-low hover:text-ink-med hover:bg-ink-lower/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <MagnifyingGlassPlus size={13} />
            </button>
        </div>
    )
}

// ── Logo control ──────────────────────────────────────────────────────────────

interface LogoControlProps {
    logoSrc?: string
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemove: () => void
}

function LogoControl({ logoSrc, onUpload, onRemove }: LogoControlProps) {
    const [open, setOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (!panelRef.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div className="relative shrink-0" ref={panelRef}>
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Logo i personalizacja"
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-all duration-200
          ${open
                        ? 'bg-brand/15 border-brand/30 text-brand'
                        : 'bg-bg-tertiary/40 border-border-subtle text-ink-low hover:text-ink-med hover:border-border-hover'
                    }`}
            >
                <ImageSquare size={13} />
                {logoSrc && <span className="w-1.5 h-1.5 bg-success rounded-full" />}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-bg-primary border border-border-subtle rounded-xl shadow-2xl overflow-hidden
          animate-[fadeSlideDown_0.18s_cubic-bezier(0.16,1,0.3,1)]">
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border-subtle bg-bg-tertiary/40">
                        <div className="flex items-center gap-2">
                            <PaintBucket size={13} className="text-brand" />
                            <span className="text-xs font-semibold">Personalizacja</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-ink-lower/20 transition-colors">
                            <X size={13} />
                        </button>
                    </div>

                    <div className="p-3 space-y-3">
                        {/* Logo upload / preview */}
                        {logoSrc ? (
                            <div className="relative group/logo">
                                <div className="aspect-video w-full bg-ink-lower/10 rounded-lg border border-border-subtle overflow-hidden">
                                    <img src={logoSrc} alt="Logo" className="w-full h-full object-contain p-2" />
                                </div>
                                <button
                                    onClick={onRemove}
                                    className="absolute top-1.5 right-1.5 p-1 bg-error/90 text-white rounded-md opacity-0 group-hover/logo:opacity-100 transition-opacity"
                                >
                                    <X size={11} />
                                </button>
                                <p className="text-xs text-ink-low text-center mt-1.5">Kliknij obraz aby zmienić</p>
                            </div>
                        ) : (
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="w-full border-2 border-dashed border-border-subtle rounded-lg p-4 text-center hover:border-brand/40 hover:bg-brand/3 transition-all group"
                            >
                                <ImageSquare size={20} className="mx-auto mb-1.5 text-ink-low group-hover:text-brand transition-colors" />
                                <p className="text-xs font-medium mb-0.5">Dodaj logo</p>
                                <p className="text-xs text-ink-lower">PNG, JPG, SVG · max 2 MB</p>
                            </button>
                        )}

                        {/* Accent colors */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-ink-low">Kolor akcentu</span>
                                <Palette size={11} className="text-ink-lower" />
                            </div>
                            <div className="flex gap-1.5">
                                {['#7c6a3e', '#2563eb', '#7e22ce', '#be123c', '#0f766e'].map(color => (
                                    <button
                                        key={color}
                                        title={color}
                                        className="w-5 h-5 rounded-md border border-white/10 hover:scale-110 transition-transform"
                                        style={{ background: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </div>
            )}
        </div>
    )
}

// ── Overflow menu (mobile) ────────────────────────────────────────────────────

interface OverflowMenuProps {
    onPrint: () => void
    onExport: () => void
    onReset: () => void
}

function OverflowMenu({ onPrint, onExport, onReset }: OverflowMenuProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div className="relative md:hidden" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border-subtle bg-bg-tertiary/40 text-ink-low hover:text-ink-med text-xs transition-all"
                aria-label="Więcej opcji"
            >
                <span className="text-xs">•••</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-bg-primary border border-border-subtle rounded-xl shadow-2xl overflow-hidden
          animate-[fadeSlideDown_0.18s_cubic-bezier(0.16,1,0.3,1)]">
                    {[
                        { label: 'Drukuj', icon: <Printer size={13} />, action: onPrint },
                        { label: 'Eksport PDF', icon: <Download size={13} />, action: onExport },
                        { label: 'Wyczyść', icon: <ArrowCounterClockwise size={13} />, action: onReset },
                    ].map(({ label, icon, action }) => (
                        <button
                            key={label}
                            onClick={() => { action(); setOpen(false) }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-ink-med hover:bg-ink-lower/10 hover:text-ink-high transition-colors"
                        >
                            <span className="text-ink-low">{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HEADER COMPONENT
// Reads nothing from context — all values come in as props.
// This keeps it pure / testable. AppContent wires it to context.
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentControlHeaderProps {
    docId?: string
    docName?: string
    config?: DocumentControlConfig
    callbacks?: DocumentControlCallbacks
    validation?: { isValid: boolean; errorsCount: number; warningsCount: number }
    /** Pass current state from context — do not let header own its own copy */
    currentState?: { panelMode: PanelMode; zoom: number; logoSrc?: string }
    className?: string
}

export function DocumentControlHeader({
    docName = 'Dokument',
    config: userConfig = {},
    callbacks = {},
    validation,
    currentState,
    className = '',
}: DocumentControlHeaderProps) {
    const cfg = {
        enableZoom: true,
        enableLogo: true,
        enablePanelMode: true,
        enableExport: true,
        defaultPanelMode: 'split' as PanelMode,
        minZoom: 50,
        maxZoom: 150,
        zoomStep: 10,
        ...userConfig,
    }

    // ── State (only local UI state that doesn't need to escape) ───────────────
    const [isPrinting, setIsPrinting] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    // Prefer controlled state from parent (context), fallback to local for standalone use
    const [localPanelMode, setLocalPanelMode] = useState<PanelMode>(cfg.defaultPanelMode)
    const [localZoom, setLocalZoom] = useState(100)
    const [localLogoSrc, setLocalLogoSrc] = useState<string | undefined>()

    const panelMode = currentState?.panelMode ?? localPanelMode
    const zoom = currentState?.zoom ?? localZoom
    const logoSrc = currentState?.logoSrc ?? localLogoSrc

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handlePanelChange = (mode: PanelMode) => {
        if (!currentState) setLocalPanelMode(mode)
        callbacks.onPanelModeChange?.(mode)
    }

    const handleZoomIn = () => {
        const next = Math.min(cfg.maxZoom, zoom + cfg.zoomStep)
        if (!currentState) setLocalZoom(next)
        callbacks.onZoomChange?.(next)
    }

    const handleZoomOut = () => {
        const next = Math.max(cfg.minZoom, zoom - cfg.zoomStep)
        if (!currentState) setLocalZoom(next)
        callbacks.onZoomChange?.(next)
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) { alert('Maksymalny rozmiar pliku to 2 MB.'); return }
        if (!file.type.startsWith('image/')) { alert('Dozwolone są tylko pliki graficzne.'); return }
        const reader = new FileReader()
        reader.onload = (ev) => {
            const src = ev.target?.result as string
            if (!currentState) setLocalLogoSrc(src)
            callbacks.onLogoChange?.(src)
        }
        reader.readAsDataURL(file)
    }

    const handleLogoRemove = () => {
        if (!currentState) setLocalLogoSrc(undefined)
        callbacks.onLogoChange?.(undefined)
    }

    const handlePrint = () => {
        setIsPrinting(true)
        callbacks.onPrint ? callbacks.onPrint() : window.print()
        setTimeout(() => setIsPrinting(false), 1200)
    }

    const handleExport = () => {
        setIsExporting(true)
        callbacks.onExportPDF ? callbacks.onExportPDF() : window.print()
        setTimeout(() => setIsExporting(false), 1200)
    }

    const showZoom = cfg.enableZoom && panelMode !== 'form'

    return (
        <>
            <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            <header className={`
        flex items-center justify-between gap-3 px-3 sm:px-4 py-2
        bg-bg-primary/95 backdrop-blur-md border-b border-border-subtle
        sticky top-0 z-40 no-print min-h-[48px]
        ${className}
      `}>
                {/* ── Left ─────────────────────────────────────────────────────── */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Breadcrumb docName={docName} />
                    {validation && (
                        <ValidationBadge
                            isValid={validation.isValid}
                            errorsCount={validation.errorsCount}
                            warningsCount={validation.warningsCount}
                        />
                    )}
                </div>

                {/* ── Right ────────────────────────────────────────────────────── */}
                <div className="flex items-center gap-1.5 shrink-0">

                    {/* Mode toggle */}
                    {cfg.enablePanelMode && (
                        <ModeToggle current={panelMode} onChange={handlePanelChange} />
                    )}

                    {/* Zoom (hidden on mobile) */}
                    {showZoom && (
                        <ZoomControl
                            zoom={zoom}
                            onZoomIn={handleZoomIn}
                            onZoomOut={handleZoomOut}
                            minZoom={cfg.minZoom}
                            maxZoom={cfg.maxZoom}
                        />
                    )}

                    {/* Logo */}
                    {cfg.enableLogo && (
                        <LogoControl
                            logoSrc={logoSrc}
                            onUpload={handleLogoUpload}
                            onRemove={handleLogoRemove}
                        />
                    )}

                    {/* Divider */}
                    <div className="w-px h-5 bg-border-subtle/50 hidden md:block" />

                    {/* Reset — desktop */}
                    <button
                        onClick={callbacks.onReset}
                        title="Wyczyść formularz"
                        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-subtle bg-transparent text-ink-low hover:text-ink-med hover:bg-ink-lower/10 text-xs transition-all"
                    >
                        <ArrowCounterClockwise size={13} />
                        <span className="hidden lg:inline">Wyczyść</span>
                    </button>

                    {/* Print — desktop */}
                    {cfg.enableExport && (
                        <button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            title="Drukuj dokument"
                            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-subtle bg-bg-tertiary/60 text-ink-med hover:bg-bg-tertiary hover:text-ink-high text-xs transition-all disabled:opacity-50"
                        >
                            <Printer size={13} />
                            <span className="hidden lg:inline">{isPrinting ? '...' : 'Drukuj'}</span>
                        </button>
                    )}

                    {/* PDF export — desktop, always visible */}
                    {cfg.enableExport && (
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            title="Eksportuj do PDF"
                            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-gradient-to-r from-brand to-brand/80 text-white text-xs font-medium
                hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-brand/20
                disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={13} />
                            <span>{isExporting ? '...' : 'PDF'}</span>
                        </button>
                    )}

                    {/* Overflow menu — mobile only */}
                    <OverflowMenu
                        onPrint={handlePrint}
                        onExport={handleExport}
                        onReset={callbacks.onReset ?? (() => { })}
                    />
                </div>
            </header>
        </>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTED VARIANT
// Reads from / writes to DocumentControlContext automatically.
// Use this variant inside a <DocumentControlProvider>.
// ─────────────────────────────────────────────────────────────────────────────

export interface ConnectedDocumentControlHeaderProps
    extends Omit<DocumentControlHeaderProps, 'currentState' | 'callbacks'> {
    /** Additional callbacks beyond the context wiring */
    callbacks?: DocumentControlCallbacks
}

export function ConnectedDocumentControlHeader({
    callbacks = {},
    ...rest
}: ConnectedDocumentControlHeaderProps) {
    const { state, setPanelMode, setZoom, setLogo, reset, print, exportPDF } =
        useDocumentControlContext()

    return (
        <DocumentControlHeader
            {...rest}
            currentState={state}
            callbacks={{
                onPanelModeChange: (m) => { setPanelMode(m); callbacks.onPanelModeChange?.(m) },
                onZoomChange: (z) => { setZoom(z); callbacks.onZoomChange?.(z) },
                onLogoChange: (l) => { setLogo(l); callbacks.onLogoChange?.(l) },
                onReset: () => { reset(); callbacks.onReset?.() },
                onPrint: () => { print(); callbacks.onPrint?.() },
                onExportPDF: () => { exportPDF(); callbacks.onExportPDF?.() },
            }}
        />
    )
}

export default DocumentControlHeader