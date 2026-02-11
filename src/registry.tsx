// documentRegistry.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all document types.
// To add a new document: import its pieces and call registerDocument().
// Nothing else in the app needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentComplexity = 'simple' | 'medium' | 'complex'
export type DocumentStatus = 'active' | 'beta' | 'coming-soon' | 'deprecated'
export type UserRole = 'user' | 'premium' | 'admin'
export type BadgeVariant = 'info' | 'warning' | 'success' | 'danger' | 'new' | 'beta'

export interface DocumentPermissions {
  minRole?: UserRole
  requiresAuth?: boolean
  requiresSubscription?: boolean
}

export interface DocumentStats {
  views?: number
  downloads?: number
  lastUsed?: Date
  avgCompletionTime?: number
}

export interface DocumentCategory {
  id: string
  name: string
  nameEn?: string
  description?: string
  icon?: string
  order?: number
  isExpanded?: boolean
  badge?: {
    text: string
    variant?: BadgeVariant
  }
}

export interface DocumentAction {
  label: string
  icon?: string
  handler: string
  shortcut?: string
}

export interface DocumentMeta {
  // Core identifiers
  id: string
  label: string
  title: string
  titleEn?: string

  // Classification
  category: string
  subcategory?: string
  tags?: string[]

  // Availability & status
  isAvailable: boolean
  status: DocumentStatus
  version?: string
  releaseDate?: Date
  lastUpdated?: Date

  // Visuals
  icon: string
  iconWeight?: 'bold' | 'regular' | 'light' | 'thin' | 'duotone' | 'fill'
  color?: string
  gradient?: string

  // Metadata
  description?: string
  descriptionEn?: string
  complexity: DocumentComplexity
  estimatedTime?: number

  // Badges & indicators
  badgeText?: string
  badgeVariant?: BadgeVariant

  // Permissions
  permissions?: DocumentPermissions

  // Statistics
  stats?: DocumentStats

  // Related documents
  relatedDocs?: string[]
  requiredDocs?: string[]

  // UI preferences
  order?: number
  isPinned?: boolean
  isFavorite?: boolean

  // Custom actions
  actions?: DocumentAction[]

  // Keyboard shortcut
  shortcut?: string

  // Analytics
  analyticsId?: string
}

export interface DocumentEntry<TData = any> {
  meta: DocumentMeta
  /**
   * React hook that owns the document's form state.
   * Must return { data, setData, reset }.
   */
  useData: () => { data: TData; setData: (d: TData) => void; reset: () => void }
  /** Renders the left-panel form */
  Form: React.ComponentType<{ data: TData; onChange: (d: TData) => void }>
  /** Renders the right-panel preview */
  Preview: React.ComponentType<{ data: TData; logoSrc?: string }>
  /** Optional: derive validation from data, called on every render */
  validate?: (data: TData) => {
    isValid: boolean
    errorsCount: number
    warningsCount: number
    fields?: Record<string, { isValid: boolean; message?: string }>
  }
}

// ─── Registry singleton ───────────────────────────────────────────────────────

type Registry = Map<string, DocumentEntry>

const registry: Registry = new Map()

export function registerDocument<TData>(entry: DocumentEntry<TData>): void {
  registry.set(entry.meta.id, entry as DocumentEntry)
}

export function getDocument(id: string): DocumentEntry | undefined {
  return registry.get(id)
}

export function getAllDocuments(): DocumentEntry[] {
  return Array.from(registry.values())
}

export function getDocumentsByCategory(): Record<string, DocumentEntry[]> {
  const result: Record<string, DocumentEntry[]> = {}
  for (const entry of registry.values()) {
    const cat = entry.meta.category
    if (!result[cat]) result[cat] = []
    result[cat].push(entry)
  }
  return result
}

export function getPinnedDocuments(): DocumentEntry[] {
  return Array.from(registry.values()).filter(entry => entry.meta.isPinned)
}

export function getDocumentsByStatus(status: DocumentStatus): DocumentEntry[] {
  return Array.from(registry.values()).filter(entry => entry.meta.status === status)
}

export function searchDocuments(query: string): DocumentEntry[] {
  const lowercaseQuery = query.toLowerCase()
  return Array.from(registry.values()).filter(entry => {
    const meta = entry.meta
    return (
      meta.title.toLowerCase().includes(lowercaseQuery) ||
      meta.titleEn?.toLowerCase().includes(lowercaseQuery) ||
      meta.description?.toLowerCase().includes(lowercaseQuery) ||
      meta.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  })
}

// ─── Default validation (always valid) ───────────────────────────────────────

export const noValidation = () => ({
  isValid: true,
  errorsCount: 0,
  warningsCount: 0,
  fields: {}
})

// ─── Category Definitions ────────────────────────────────────────────────────

export const CATEGORY_DEFINITIONS: Record<string, DocumentCategory> = {
  'Sprzedaż': {
    id: 'sprzedaz',
    name: 'Sprzedaż',
    nameEn: 'Sales',
    description: 'Umowy kupna-sprzedaży i pokrewne',
    icon: 'ShoppingBag',
    order: 1,
    isExpanded: true,
    badge: {
      text: '4 dokumenty',
      variant: 'info'
    }
  },
  'Praca': {
    id: 'praca',
    name: 'Praca',
    nameEn: 'Employment',
    description: 'Umowy o pracę i zlecenia',
    icon: 'ClipboardText',
    order: 2,
    isExpanded: true,
    badge: {
      text: '2 dokumenty',
      variant: 'info'
    }
  },
  'Najem': {
    id: 'najem',
    name: 'Najem',
    nameEn: 'Rental',
    description: 'Umowy najmu lokali i nieruchomości',
    icon: 'House',
    order: 3,
    isExpanded: false,
  },
  'Pełnomocnictwa': {
    id: 'pelnomocnictwa',
    name: 'Pełnomocnictwa',
    nameEn: 'Power of Attorney',
    description: 'Pełnomocnictwa i upoważnienia',
    icon: 'Signature',
    order: 4,
    isExpanded: false,
    badge: {
      text: 'Nowość',
      variant: 'new'
    }
  },
  'Spadki': {
    id: 'spadki',
    name: 'Spadki',
    nameEn: 'Inheritance',
    description: 'Testamenty i oświadczenia spadkowe',
    icon: 'Files',
    order: 5,
    isExpanded: false,
  },
  'Umowy Handlowe': {
    id: 'handlowe',
    name: 'Umowy Handlowe',
    nameEn: 'Commercial Agreements',
    description: 'Umowy między przedsiębiorcami',
    icon: 'CurrencyCircleDollar',
    order: 6,
    isExpanded: false,
  },
  'Pozostałe': {
    id: 'pozostale',
    name: 'Pozostałe',
    nameEn: 'Other',
    description: 'Pozostałe dokumenty prawne',
    icon: 'Files',
    order: 99,
    isExpanded: false,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRATIONS
// Import and register every document type here.
// ─────────────────────────────────────────────────────────────────────────────

// Sale Agreement (Umowa Kupna-Sprzedaży)
import { SaleAgreementForm, useSaleAgreementData } from './documents/SaleAgreement/Form'
import { SaleAgreementPreview } from './documents/SaleAgreement/Preview'
import { createDocumentHook } from './hooks/useDocumentForm'
import { DEFAULT_SALE_AGREEMENT } from './types/saleAgreement'

registerDocument({
  meta: {
    // Core identifiers
    id: 'umowa-kupna-sprzedazy',
    label: 'UKS',
    title: 'Umowa Kupna-Sprzedaży',
    titleEn: 'Sale Agreement',

    // Classification
    category: 'Sprzedaż',
    subcategory: 'Ruchomości',
    tags: ['sprzedaż', 'kupno'],

    // Availability & status
    isAvailable: true,
    status: 'active',
    version: '2.1.0',
    releaseDate: new Date('2025-01-15'),
    lastUpdated: new Date('2025-02-01'),

    // Visuals
    icon: 'Scales',
    iconWeight: 'duotone',
    color: '#F59E0B',
    gradient: 'from-amber-500/20 to-orange-500/20',

    // Metadata
    description: 'Kompleksowa umowa kupna-sprzedaży rzeczy ruchomych',
    descriptionEn: 'Comprehensive sales agreement for movable property',
    complexity: 'medium',
    estimatedTime: 8,

    // Badges & indicators
    badgeText: 'Kupno',
    badgeVariant: 'success',

    // Permissions
    permissions: {
      minRole: 'user',
      requiresAuth: true,
      requiresSubscription: false,
    },

    // Statistics
    stats: {
      views: 1234,
      downloads: 567,
      lastUsed: new Date('2025-02-10'),
      avgCompletionTime: 6,
    },

    // UI preferences
    order: 1,
    isPinned: true,
    isFavorite: false,

    // Keyboard shortcut
    shortcut: 'Alt+S',

    // Analytics
    analyticsId: 'doc_sale_001',
  },
  useData: createDocumentHook(DEFAULT_SALE_AGREEMENT),
  Form: ({ data, onChange }) => <SaleAgreementForm data={data} onChange={onChange} />,
  Preview: ({ data, logoSrc }) => <SaleAgreementPreview data={data} logoSrc={logoSrc} />,
  validate: (data) => {
    const errors = []
    const warnings = []
    const fields: Record<string, { isValid: boolean; message?: string }> = {}

    console.log(data)

    // Required fields validation
    // if (!data.sellerName) {
    //   errors.push('sellerName')
    //   fields.sellerName = { isValid: false, message: 'Imię i nazwisko sprzedawcy jest wymagane' }
    // } else {
    //   fields.sellerName = { isValid: true }
    // }

    // if (!data.sellerAddress) {
    //   errors.push('sellerAddress')
    //   fields.sellerAddress = { isValid: false, message: 'Adres sprzedawcy jest wymagany' }
    // } else {
    //   fields.sellerAddress = { isValid: true }
    // }

    // if (!data.sellerPesel) {
    //   errors.push('sellerPesel')
    //   fields.sellerPesel = { isValid: false, message: 'PESEL sprzedawcy jest wymagany' }
    // } else if (!/^\d{11}$/.test(data.sellerPesel)) {
    //   errors.push('sellerPesel')
    //   fields.sellerPesel = { isValid: false, message: 'PESEL musi zawierać 11 cyfr' }
    // } else {
    //   fields.sellerPesel = { isValid: true }
    // }

    // if (!data.buyerName) {
    //   errors.push('buyerName')
    //   fields.buyerName = { isValid: false, message: 'Imię i nazwisko kupującego jest wymagane' }
    // } else {
    //   fields.buyerName = { isValid: true }
    // }

    // if (!data.price) {
    //   errors.push('price')
    //   fields.price = { isValid: false, message: 'Cena jest wymagana' }
    // } else if (data.price <= 0) {
    //   errors.push('price')
    //   fields.price = { isValid: false, message: 'Cena musi być większa od 0' }
    // } else {
    //   fields.price = { isValid: true }
    // }

    // // Warnings
    // if (data.price > 1000000) {
    //   warnings.push('price')
    //   fields.price = {
    //     isValid: true,
    //     message: 'Wysoka wartość przedmiotu - rozważ formę aktu notarialnego'
    //   }
    // }

    return {
      isValid: errors.length === 0,
      errorsCount: errors.length,
      warningsCount: warnings.length,
      fields
    }
  },
})

// Umowa Zlecenie (Contract of Mandate) - Coming Soon
// import { UmowaZlecenieForm, useUmowaZlecenieData } from './documents/UmowaZlecenie/Form'
// import { UmowaZleceniePreview } from './documents/UmowaZlecenie/Preview'

// registerDocument({
//   meta: {
//     id: 'umowa-zlecenie',
//     label: 'UZ',
//     title: 'Umowa Zlecenie',
//     titleEn: 'Contract of Mandate',
//     category: 'Praca',
//     subcategory: 'Cywilnoprawne',
//     tags: ['zlecenie', 'praca', 'wynagrodzenie'],
//     isAvailable: false,
//     status: 'coming-soon',
//     version: '1.0.0',
//     releaseDate: new Date('2025-03-01'),
//     icon: 'ClipboardText',
//     iconWeight: 'regular',
//     color: '#3B82F6',
//     gradient: 'from-blue-500/20 to-cyan-500/20',
//     description: 'Umowa zlecenie - elastyczna forma zatrudnienia',
//     descriptionEn: 'Contract of mandate - flexible employment form',
//     complexity: 'simple',
//     estimatedTime: 5,
//     badgeText: 'Wkrótce',
//     badgeVariant: 'new',
//     permissions: {
//       minRole: 'user',
//       requiresAuth: true,
//       requiresSubscription: false,
//     },
//     order: 1,
//     isPinned: false,
//     shortcut: 'Alt+Z',
//     analyticsId: 'doc_mandate_001',
//   },
//   useData: useUmowaZlecenieData,
//   Form: ({ data, onChange }) => <UmowaZlecenieForm data={data} onChange={onChange} />,
//   Preview: ({ data, logoSrc }) => <UmowaZleceniePreview data={data} logoSrc={logoSrc} />,
// })

// Pełnomocnictwo (Power of Attorney)
// import { PowerOfAttorneyForm, usePowerOfAttorneyData } from './documents/PowerOfAttorney/PowerOfAttorneyForm'
// import { PowerOfAttorneyPreview } from './documents/PowerOfAttorney/PowerOfAttorneyPreview'

// registerDocument({
//   meta: {
//     id: 'pelnomocnictwo',
//     label: 'POW',
//     title: 'Pełnomocnictwo',
//     titleEn: 'Power of Attorney',
//     category: 'Pełnomocnictwa',
//     subcategory: 'Ogólne',
//     tags: ['pełnomocnictwo', 'reprezentacja', 'upoważnienie'],
//     isAvailable: true,
//     status: 'beta',
//     version: '0.9.0',
//     releaseDate: new Date('2025-02-15'),
//     lastUpdated: new Date('2025-02-20'),
//     icon: 'Signature',
//     iconWeight: 'duotone',
//     color: '#8B5CF6',
//     gradient: 'from-violet-500/20 to-purple-500/20',
//     description: 'Pełnomocnictwo do reprezentacji przed urzędami i instytucjami',
//     descriptionEn: 'Power of attorney for representation before offices',
//     complexity: 'simple',
//     estimatedTime: 4,
//     badgeText: 'Beta',
//     badgeVariant: 'beta',
//     permissions: {
//       minRole: 'user',
//       requiresAuth: true,
//       requiresSubscription: false,
//     },
//     stats: {
//       views: 345,
//       downloads: 89,
//       lastUsed: new Date('2025-02-18'),
//       avgCompletionTime: 3.5,
//     },
//     order: 1,
//     isPinned: true,
//     shortcut: 'Alt+P',
//     analyticsId: 'doc_poa_001',
//   },
//   useData: usePowerOfAttorneyData,
//   Form: ({ data, onChange }) => <PowerOfAttorneyForm data={data} onChange={onChange} />,
//   Preview: ({ data, logoSrc }) => <PowerOfAttorneyPreview data={data} logoSrc={logoSrc} />,
// })

// // Umowa Najmu (Rental Agreement)
// import { RentalAgreementForm, useRentalAgreementData } from './documents/RentalAgreement/Form'
// import { RentalAgreementPreview } from './documents/RentalAgreement/Preview'

// registerDocument({
//   meta: {
//     id: 'umowa-najmu',
//     label: 'UN',
//     title: 'Umowa Najmu',
//     titleEn: 'Rental Agreement',
//     category: 'Najem',
//     subcategory: 'Lokale mieszkalne',
//     tags: ['najem', 'wynajem', 'mieszkanie', 'lokal'],
//     isAvailable: true,
//     status: 'active',
//     version: '1.2.0',
//     releaseDate: new Date('2025-01-10'),
//     lastUpdated: new Date('2025-01-25'),
//     icon: 'House',
//     iconWeight: 'duotone',
//     color: '#10B981',
//     gradient: 'from-emerald-500/20 to-teal-500/20',
//     description: 'Umowa najmu lokalu mieszkalnego',
//     descriptionEn: 'Residential rental agreement',
//     complexity: 'medium',
//     estimatedTime: 10,
//     badgeText: 'Najem',
//     badgeVariant: 'success',
//     permissions: {
//       minRole: 'user',
//       requiresAuth: true,
//       requiresSubscription: false,
//     },
//     stats: {
//       views: 892,
//       downloads: 234,
//       lastUsed: new Date('2025-02-09'),
//       avgCompletionTime: 8,
//     },
//     order: 1,
//     isPinned: false,
//     shortcut: 'Alt+N',
//     analyticsId: 'doc_rental_001',
//   },
//   useData: useRentalAgreementData,
//   Form: ({ data, onChange }) => <RentalAgreementForm data={data} onChange={onChange} />,
//   Preview: ({ data, logoSrc }) => <RentalAgreementPreview data={data} logoSrc={logoSrc} />,
//   validate: (data) => {
//     const errors = []
//     if (!data.landlordName) errors.push('landlordName')
//     if (!data.tenantName) errors.push('tenantName')
//     if (!data.propertyAddress) errors.push('propertyAddress')
//     if (!data.rentAmount || data.rentAmount <= 0) errors.push('rentAmount')

//     return {
//       isValid: errors.length === 0,
//       errorsCount: errors.length,
//       warningsCount: 0,
//     }
//   }
// })

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

// Document metadata arrays for sidebar
export const DOCUMENTS = getAllDocuments()
  .map(entry => entry.meta)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

// Unique categories
export const CATEGORIES = Array.from(new Set(DOCUMENTS.map(doc => doc.category)))
  .sort((a, b) => {
    const orderA = CATEGORY_DEFINITIONS[a]?.order ?? 999
    const orderB = CATEGORY_DEFINITIONS[b]?.order ?? 999
    return orderA - orderB
  })

// Utility functions
export function getDocumentsByCategoryWithMeta(): Record<string, DocumentMeta[]> {
  const result: Record<string, DocumentMeta[]> = {}
  for (const doc of DOCUMENTS) {
    if (!result[doc.category]) result[doc.category] = []
    result[doc.category].push(doc)
  }
  // Sort documents within each category by order
  Object.keys(result).forEach(cat => {
    result[cat].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  })
  return result
}

export function getCategoryDefinition(categoryName: string): DocumentCategory | undefined {
  return CATEGORY_DEFINITIONS[categoryName]
}

export function getDocumentById(id: string): DocumentMeta | undefined {
  return DOCUMENTS.find(doc => doc.id === id)
}

export function getRelatedDocuments(docId: string): DocumentMeta[] {
  const doc = getDocumentById(docId)
  if (!doc?.relatedDocs) return []
  return DOCUMENTS.filter(d => doc.relatedDocs?.includes(d.id))
}

export const REGISTRY_VERSION = '2.0.0'
export const LAST_UPDATED = new Date('2025-02-11')
export const TOTAL_DOCUMENTS = DOCUMENTS.length
export const AVAILABLE_DOCUMENTS = DOCUMENTS.filter(d => d.isAvailable).length