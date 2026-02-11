import {
  ShoppingBag, ClipboardText, House, Signature,
  Scales, CurrencyCircleDollar, Files,
} from '@phosphor-icons/react'
import { DOCUMENTS, CATEGORIES } from '../documents/registry'
import type { DocumentMeta } from '../types/documents'

const ICON_MAP: Record<string, React.FC<{ size?: number; weight?: 'bold' | 'regular' | 'light' | 'thin' | 'duotone' | 'fill'; className?: string }>> = {
  ShoppingBag,
  ClipboardText,
  House,
  Signature,
  Scales,
  CurrencyCircleDollar,
}

interface SidebarProps {
  activeId: string
  onSelect: (id: string) => void
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  return (
    <aside className="flex flex-col h-full w-64 glass-panel border-r border-border-subtle shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="relative w-6 h-6 border border-brand rotate-45 flex items-center justify-center transition-transform group-hover:rotate-[135deg] duration-700">
            <div className="w-1.5 h-1.5 bg-brand" />
          </div>

          <div>
            <p className="text-xs font-semibold text-ink-high leading-none font-display">ArchonLex</p>
            <p className="text-[10px] text-ink-low mt-0.5">Konstruktor Dokumentów</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {CATEGORIES.map(category => {
          const docs = DOCUMENTS.filter(d => d.category === category)
          return (
            <div key={category}>
              <p className="text-[10px] uppercase tracking-widest text-ink-low font-medium px-2 mb-2">
                {category}
              </p>
              <div className="space-y-1">
                {docs.map(doc => (
                  <DocNavItem
                    key={doc.id}
                    doc={doc}
                    active={activeId === doc.id}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border-subtle">
        <p className="text-[10px] text-ink-low leading-relaxed">
          Zgodne z polskim kodeksem cywilnym.<br />
          Zawsze weryfikuj z prawnikiem.
        </p>
      </div>
    </aside>
  )
}

function DocNavItem({ doc, active, onSelect }: { doc: DocumentMeta; active: boolean; onSelect: (id: string) => void }) {
  const Icon = ICON_MAP[doc.icon] ?? ShoppingBag

  return (
    <button
      onClick={() => doc.available && onSelect(doc.id)}
      className={`nav-item w-full text-left relative group ${active ? 'active' : ''} ${!doc.available ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={16} weight={active ? 'fill' : 'regular'} className={active ? 'text-brand' : 'text-ink-low group-hover:text-ink-med'} />
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-tight truncate">{doc.title}</p>
        <p className="text-[10px] text-ink-low leading-none mt-0.5 truncate">{doc.titleEn}</p>
      </div>
      {doc.badgeText && (
        <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-pill font-medium"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#8A94A3' }}>
          {doc.badgeText}
        </span>
      )}
    </button>
  )
}
