// shared/previewAtoms.tsx
// Primitive building blocks consumed by every document Preview.
// All styles target print-safe CSS (inline styles where Tailwind won't survive @media print).

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreviewWrapperProps {
    logoSrc?: string
    logoOpacity?: number
    children: React.ReactNode
    minHeight?: string
    className?: string
}

export interface FieldValueProps {
    value?: string | number | null
    placeholder?: string
    className?: string
}

export interface SectionProps {
    title?: string
    titleNumber?: string | number
    children: React.ReactNode
    className?: string
}

export interface SignatureBlockProps {
    parties: Array<{ role: string; name?: string }>
}

export interface ContractTableProps {
    columns: Array<{ key: string; label: string; width?: number | string; align?: 'left' | 'center' | 'right' }>
    rows: React.ReactNode[][]
    totals?: React.ReactNode[]
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────
// Every document preview is wrapped in this. Handles logo watermark, shadow, paper bg.

export function PreviewWrapper({
    logoSrc,
    logoOpacity = 0.06,
    children,
    minHeight = '297mm',
    className = '',
}: PreviewWrapperProps) {
    return (
        <div
            className={`contract-preview bg-white relative overflow-hidden ${className}`}
            style={{ padding: '30px 36px', minHeight, boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        >
            {logoSrc && (
                <img
                    src={logoSrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute pointer-events-none select-none"
                    style={{
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        opacity: logoOpacity,
                        width: 240,
                    }}
                />
            )}
            <div className="relative z-10">{children}</div>
        </div>
    )
}

// ─── Document title block ─────────────────────────────────────────────────────

interface DocumentTitleProps {
    title: string
    subtitle?: string
    contractNumber?: string
    accentColor?: string
}

export function DocumentTitle({
    title,
    subtitle,
    contractNumber,
    accentColor = '#7c6a3e',
}: DocumentTitleProps) {
    return (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                margin: '0 0 4px',
                color: '#1a1a1a',
            }}>
                {title}
            </h1>
            {(subtitle || contractNumber) && (
                <p style={{ fontSize: 10, color: accentColor, fontWeight: 600, margin: 0 }}>
                    {subtitle}
                    {contractNumber && (contractNumber)}
                </p>
            )}
        </div>
    )
}

// ─── FieldValue — renders filled value or styled placeholder ──────────────────

export function FieldValue({ value, placeholder = '___________', className = '' }: FieldValueProps) {
    if (value !== undefined && value !== null && value !== '') {
        return <span className={`field-value ${className}`}>{value}</span>
    }
    return <span className={`field-placeholder ${className}`}>{placeholder}</span>
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function PreviewSection({ title, titleNumber, children, className = '' }: SectionProps) {
    return (
        <div className={`contract-section ${className}`}>
            {title && (
                <h2>
                    {titleNumber !== undefined && `§ ${titleNumber}. `}
                    {title}
                </h2>
            )}
            {children}
        </div>
    )
}

// ─── Party block ──────────────────────────────────────────────────────────────

interface PartyBlockProps {
    role: string
    fields: Array<{ label: string; value?: string; placeholder?: string; optional?: boolean }>
    closingLine?: string
}

export function PartyBlock({ role, fields, closingLine }: PartyBlockProps) {
    return (
        <div style={{ paddingLeft: 16, marginBottom: 8 }}>
            <p><strong>{role}:</strong></p>
            {fields
                .filter(f => !f.optional || (f.value && f.value.trim()))
                .map((f, i) => (
                    <p key={i}>
                        {f.label}:{' '}
                        <FieldValue value={f.value} placeholder={f.placeholder ?? `(${f.label})`} />
                    </p>
                ))
            }
            {closingLine && <p style={{ fontStyle: 'italic', marginTop: 4 }}>{closingLine}</p>}
        </div>
    )
}

// ─── Contract Table ───────────────────────────────────────────────────────────

export function ContractTable({ columns, rows, totals }: ContractTableProps) {
    return (
        <table style={{ marginTop: 8, width: '100%' }}>
            <thead>
                <tr>
                    {columns.map(col => (
                        <th
                            key={col.key}
                            style={{
                                width: col.width,
                                textAlign: col.align ?? 'center',
                            }}
                        >
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length > 0 ? (
                    rows.map((cells, ri) => (
                        <tr key={ri}>
                            {cells.map((cell, ci) => (
                                <td key={ci} style={{ textAlign: columns[ci]?.align ?? 'center' }}>
                                    {cell ?? <span style={{ color: '#ccc' }}>—</span>}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length} style={{ color: '#bbb', textAlign: 'center' }}>
                            Brak wpisów
                        </td>
                    </tr>
                )}
                {totals && (
                    <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
                        {totals.map((cell, i) => (
                            <td key={i} style={{ textAlign: columns[i]?.align ?? 'center' }}>{cell}</td>
                        ))}
                    </tr>
                )}
            </tbody>
        </table>
    )
}

// ─── Signatures ───────────────────────────────────────────────────────────────

export function SignatureBlock({ parties }: SignatureBlockProps) {
    return (
        <div className="signatures">
            {parties.map((p, i) => (
                <div key={i} className="signature-box">
                    <div style={{ height: 44 }} />
                    <div className="signature-line">
                        {p.role}
                        {p.name && <><br />{p.name}</>}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Separator ────────────────────────────────────────────────────────────────

export function SectionDivider() {
    return <hr style={{ border: 'none', borderTop: '0.5px solid #e5e5e5', margin: '8px 0' }} />
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Render an inline conditional paragraph — returns null when condition is false */
export function ConditionalParagraph({
    condition,
    children,
}: {
    condition: boolean
    children: React.ReactNode
}) {
    return condition ? <p style={{ marginTop: 4 }}>{children}</p> : null
}