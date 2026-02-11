// components/Sidebar.tsx
import { useState, useEffect } from 'react'
import {
  ShoppingBag, ClipboardText, House, Signature,
  Scales, CurrencyCircleDollar, Files, Clock,
  CaretRight, CaretDown, Star, MagnifyingGlass,
  X, DotsThree, ArrowLeft, ArrowRight, PushPinIcon,
} from '@phosphor-icons/react'
import {
  DOCUMENTS,
  CATEGORIES,
  CATEGORY_DEFINITIONS,
  getDocumentsByCategoryWithMeta,
  getCategoryDefinition,
  getPinnedDocuments,
  searchDocuments,
  type DocumentMeta
} from '../registry'

// ============================================================================
// ICON MAPPING - Matches registry icon names to Phosphor icons
// ============================================================================

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag,
  ClipboardText,
  House,
  Signature,
  Scales,
  CurrencyCircleDollar,
  Files,
  Clock,
}

// Fallback icon if mapping fails
const FALLBACK_ICON = Files

// ============================================================================
// PROPS
// ============================================================================

interface SidebarProps {
  activeId: string
  onSelect: (id: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// ============================================================================
// BADGE STYLES - Based on registry BadgeVariant type
// ============================================================================

const BADGE_STYLES: Record<string, string> = {
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  new: 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse',
  beta: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

export function Sidebar({
  activeId,
  onSelect,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map(cat => [cat, true]))
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-expand category containing active document
  useEffect(() => {
    const activeDoc = DOCUMENTS.find(doc => doc.id === activeId)
    if (activeDoc && !expandedCategories[activeDoc.category]) {
      setExpandedCategories(prev => ({
        ...prev,
        [activeDoc.category]: true
      }))
    }
  }, [activeId, expandedCategories])

  // --------------------------------------------------------------------------
  // Computed Data
  // --------------------------------------------------------------------------

  // Get all available documents
  const availableDocs = DOCUMENTS.filter(doc => doc.isAvailable)

  // Get pinned documents using registry function
  const pinnedDocs = getPinnedDocuments().map(entry => entry.meta)

  // Filter documents based on search and pinned filter
  const filteredDocs = (searchQuery
    ? searchDocuments(searchQuery).map(entry => entry.meta)
    : availableDocs
  ).filter(doc => {
    const matchesPinned = !showPinnedOnly || doc.isPinned
    return matchesPinned
  })

  // Group documents by category using registry function
  const docsByCategory = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, DocumentMeta[]>)

  // Sort categories by their defined order
  const sortedCategories = Object.keys(docsByCategory).sort((a, b) => {
    const orderA = CATEGORY_DEFINITIONS[a]?.order ?? 999
    const orderB = CATEGORY_DEFINITIONS[b]?.order ?? 999
    return orderA - orderB
  })

  // Get category icon
  const getCategoryIcon = (categoryName: string) => {
    const category = CATEGORY_DEFINITIONS[categoryName]
    const Icon = ICON_MAP[category?.icon ?? 'Files'] ?? FALLBACK_ICON
    return Icon
  }

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setShowPinnedOnly(false)
  }

  // Determine sidebar width based on state
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64'
  const effectiveWidth = isCollapsed && isHovering && !isMobileOpen ? 'w-64' : sidebarWidth

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-6 left-6 z-50 lg:hidden bg-brand text-white p-3.5 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
        aria-label="Otwórz menu"
      >
        <ArrowRight size={20} weight="bold" />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-50 flex flex-col h-full bg-gradient-to-b from-bg-primary to-bg-secondary
          ${effectiveWidth} 
          transition-all duration-300 ease-out
          border-r border-border-subtle shrink-0
          ${isMobileOpen ? 'left-0 shadow-2xl' : '-left-64 lg:left-0'}
          lg:translate-x-0
        `}
        onMouseEnter={() => isCollapsed && setIsHovering(true)}
        onMouseLeave={() => isCollapsed && setIsHovering(false)}
      >
        {/* ================================================================== */}
        {/* HEADER - Logo and collapse toggle */}
        {/* ================================================================== */}

        <div className="px-5 py-5 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Animated logo */}
            <div className="relative w-6 h-6 border border-brand/60 rotate-45 flex items-center justify-center transition-all duration-700 group-hover:rotate-[135deg] hover:border-brand flex-shrink-0">
              <div className="w-1.5 h-1.5 bg-brand" />
            </div>

            {/* Title - hides when collapsed */}
            <div className={`transition-all duration-200 ${isCollapsed && !isHovering ? 'opacity-0 w-0' : 'opacity-100 w-auto'} overflow-hidden`}>
              <p className="text-xs font-semibold text-ink-high leading-none font-display whitespace-nowrap">
                ArchonLex
              </p>
              <p className="text-[10px] text-ink-low mt-0.5 whitespace-nowrap">
                Konstruktor Dokumentów
              </p>
            </div>
          </div>

          {/* Collapse toggle - desktop only */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-bg-tertiary text-ink-low hover:text-ink-high transition-colors"
              aria-label={isCollapsed ? 'Rozwiń' : 'Zwiń'}
            >
              {isCollapsed ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
            </button>
          )}

          {/* Close button - mobile only */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-ink-low hover:text-ink-high p-1"
            aria-label="Zamknij"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================================================================== */}
        {/* SEARCH & FILTERS - Only shown when expanded */}
        {/* ================================================================== */}

        {(!isCollapsed || isHovering) && (
          <div className="px-3 pt-4 space-y-3">
            {/* Search input */}
            <div className="relative group">
              <MagnifyingGlass
                size={14}
                weight="bold"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-low group-focus-within:text-brand transition-colors"
              />
              <input
                type="text"
                placeholder="Szukaj dokumentów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs bg-bg-tertiary/50 border border-border-subtle rounded-lg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 text-ink-high placeholder-ink-low transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-low hover:text-ink-high transition-colors"
                  aria-label="Wyczyść wyszukiwanie"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Pinned documents filter */}
            {pinnedDocs.length > 0 && (
              <button
                onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                className={`
                  flex items-center gap-2 px-2 py-1.5 w-full rounded-lg text-xs transition-all
                  ${showPinnedOnly
                    ? 'bg-brand/10 text-brand border border-brand/20'
                    : 'text-ink-low hover:bg-bg-tertiary hover:text-ink-high border border-transparent'
                  }
                `}
              >
                <PushPinIcon size={14} weight={showPinnedOnly ? 'fill' : 'regular'} />
                <span className="flex-1 text-left">Przypięte dokumenty</span>
                <span className="ml-auto text-[10px] bg-ink-lower/20 px-1.5 py-0.5 rounded-full">
                  {pinnedDocs.length}
                </span>
              </button>
            )}

            {/* Active filters indicator */}
            {(searchQuery || showPinnedOnly) && (
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] text-ink-low">
                  Znaleziono: {filteredDocs.length} dokumentów
                </span>
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-ink-low hover:text-brand transition-colors"
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* NAVIGATION - Document list by category */}
        {/* ================================================================== */}

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin scrollbar-thumb-border-subtle hover:scrollbar-thumb-border-med">
          {searchQuery && filteredDocs.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mb-3">
                <Files size={20} className="text-ink-low" />
              </div>
              <p className="text-sm text-ink-high font-medium mb-1">Brak wyników</p>
              <p className="text-xs text-ink-low">
                Spróbuj innych słów kluczowych
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-xs text-brand hover:text-brand-light transition-colors"
              >
                Wyczyść filtry
              </button>
            </div>
          ) : (
            /* Category list */
            <div className="space-y-5">
              {sortedCategories.map((category) => {
                const categoryDef = getCategoryDefinition(category)!
                const CategoryIcon = getCategoryIcon(category)
                const isExpanded = expandedCategories[category] ?? true
                const docsInCategory = docsByCategory[category].sort(
                  (a, b) => (a.order ?? 999) - (b.order ?? 999)
                )

                return (
                  <div key={category} className="space-y-1">
                    {/* Category header - always visible */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`
                        w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                        text-xs font-medium transition-all
                        hover:bg-bg-tertiary group
                        ${(!isCollapsed || isHovering) ? 'justify-start' : 'justify-center'}
                      `}
                      aria-expanded={isExpanded}
                    >
                      <CategoryIcon
                        size={16}
                        weight={isExpanded ? 'fill' : 'regular'}
                        className="text-ink-med group-hover:text-brand flex-shrink-0 transition-colors"
                      />

                      {(!isCollapsed || isHovering) && (
                        <>
                          <span className="flex-1 text-left truncate">
                            {categoryDef.name}
                          </span>

                          <span className="text-[10px] text-ink-low mr-1">
                            {docsInCategory.length}
                          </span>

                          {isExpanded ? (
                            <CaretDown size={12} weight="bold" className="text-ink-low flex-shrink-0" />
                          ) : (
                            <CaretRight size={12} weight="bold" className="text-ink-low flex-shrink-0" />
                          )}

                          {categoryDef.badge && (
                            <span className={`
                              text-[9px] px-1.5 py-0.5 rounded-full font-medium border flex-shrink-0
                              ${BADGE_STYLES[categoryDef.badge.variant ?? 'info']}
                            `}>
                              {categoryDef.badge.text}
                            </span>
                          )}
                        </>
                      )}
                    </button>

                    {/* Documents in category - collapsible */}
                    {isExpanded && (
                      <div className="space-y-0.5 pl-2 mt-1">
                        {docsInCategory.map((doc) => (
                          <DocNavItem
                            key={doc.id}
                            doc={doc}
                            active={activeId === doc.id}
                            onSelect={(id) => {
                              onSelect(id)
                              setIsMobileOpen(false)
                            }}
                            isCollapsed={isCollapsed && !isHovering}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </nav>

        {/* ================================================================== */}
        {/* FOOTER - Only shown when expanded */}
        {/* ================================================================== */}

        {(!isCollapsed || isHovering) && (
          <div className="px-4 py-4 border-t border-border-subtle bg-gradient-to-t from-bg-primary to-transparent">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] font-mono text-ink-low">
                  Wersja 2.1.0
                </p>
                <p className="text-[9px] text-ink-low/70 mt-0.5">
                  {new Date().toLocaleDateString('pl-PL')}
                </p>
              </div>
              <button
                className="text-ink-low hover:text-ink-high p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
                aria-label="Menu"
              >
                <DotsThree size={16} weight="bold" />
              </button>
            </div>
            <p className="text-[9px] text-ink-low/60 leading-relaxed">
              © 2025 ArchonLex. Wszelkie prawa zastrzeżone.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}

// ============================================================================
// DOCUMENT NAVIGATION ITEM COMPONENT
// ============================================================================

function DocNavItem({
  doc,
  active,
  onSelect,
  isCollapsed
}: {
  doc: DocumentMeta
  active: boolean
  onSelect: (id: string) => void
  isCollapsed: boolean
}) {
  const [isHovering, setIsHovering] = useState(false)
  const Icon = ICON_MAP[doc.icon] ?? FALLBACK_ICON

  // Get badge styles based on variant
  const getBadgeStyles = (variant?: string) => {
    return BADGE_STYLES[variant ?? 'info'] || 'bg-white/5 text-ink-low border-white/10'
  }

  // Don't render if document is not available
  if (!doc.isAvailable) return null

  return (
    <button
      onClick={() => onSelect(doc.id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        w-full relative group flex items-center gap-3 px-2 py-2 rounded-lg
        transition-all duration-200
        ${active
          ? 'bg-brand/10 text-brand border-l-2 border-brand'
          : 'text-ink-med hover:bg-bg-tertiary hover:text-ink-high'
        }
        ${isCollapsed ? 'justify-center' : 'justify-start'}
      `}
      disabled={!doc.isAvailable}
      title={isCollapsed ? doc.title : undefined}
    >
      {/* Icon with status indicator */}
      <div className="relative flex-shrink-0">
        <Icon
          size={18}
          weight={active ? 'fill' : (doc.iconWeight ?? 'regular')}
          className={active ? 'text-brand' : 'text-ink-low group-hover:text-ink-med transition-colors'}
        />
        {doc.status === 'beta' && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
        )}
        {doc.isPinned && (
          <span className="absolute -bottom-1 -right-1">
            <PushPinIcon size={8} weight="fill" className="text-ink-low" />
          </span>
        )}
      </div>

      {/* Content - hidden when collapsed */}
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-sm leading-tight truncate font-medium">
                {doc.label}
              </p>
            </div>
            {doc.titleEn && (
              <p className="text-[9px] text-ink-low/70 leading-none mt-0.5 truncate">
                {doc.titleEn}
              </p>
            )}
          </div>

          {/* Badges and metadata */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {doc.badgeText && (
              <span className={`
                text-[8px] px-1.5 py-0.5 rounded-full font-medium border
                transition-all duration-200
                ${getBadgeStyles(doc.badgeVariant)}
                ${isHovering ? 'opacity-100 scale-105' : 'opacity-80'}
              `}>
                {doc.badgeText}
              </span>
            )}

            {doc.estimatedTime && (
              <div className="flex items-center gap-0.5 text-ink-low">
                <Clock size={9} weight="regular" />
                <span className="text-[8px] font-mono">{doc.estimatedTime}</span>
              </div>
            )}
          </div>

          {/* Tooltip with additional info on hover */}
          {isHovering && doc.description && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 bg-bg-primary border border-border-subtle rounded-lg shadow-xl p-3 min-w-[200px] animate-in fade-in slide-in-from-left-2 duration-200">
              <p className="text-[10px] font-medium text-ink-high mb-1">{doc.title}</p>
              <p className="text-[9px] text-ink-low leading-relaxed">{doc.description}</p>
              {doc.complexity && (
                <div className="mt-2 pt-2 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-[8px] text-ink-low">Poziom skomplikowania</span>
                  <span className={`
                    text-[8px] px-1.5 py-0.5 rounded-full
                    ${doc.complexity === 'simple' ? 'bg-green-500/20 text-green-400' : ''}
                    ${doc.complexity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${doc.complexity === 'complex' ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                    {doc.complexity === 'simple' ? 'Prosty' :
                      doc.complexity === 'medium' ? 'Średni' : 'Złożony'}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </button>
  )
}

// ============================================================================
// EXPORT
// ============================================================================

export default Sidebar