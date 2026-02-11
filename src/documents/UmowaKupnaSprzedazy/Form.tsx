import { useState, useCallback } from 'react'
import {
  Plus, Trash, ArrowCounterClockwise, Buildings, User, Package,
  CurrencyDollar, Gear, IdentificationCard, Phone, EnvelopeSimple,
  Bank, Money, Hash, MapPin, Calendar, Notebook
} from '@phosphor-icons/react'

import type { UmowaKupnaSprzedazyData, Product } from '../../types/documents'
import { validatePesel, validateIBAN, formatIBAN, generateContractNumber, formatCurrency } from '../../shared/utils'

const DEFAULT_DATA: UmowaKupnaSprzedazyData = {
  numer_umowy: '',
  data: new Date().toISOString().split('T')[0],
  miejsce: 'Gdańsk',
  sprzedajacy_imie: '',
  sprzedajacy_adres: '',
  sprzedajacy_pesel: '',
  sprzedajacy_dowod: '',
  sprzedajacy_telefon: '',
  sprzedajacy_email: '',
  products: [{ id: 1, name: '', quantity: '', price: '', value: 0 }],
  platnosc_typ: '',
  numer_konta: '',
  termin_platnosci: '',
  ilosc_rat: '',
  include_rodo: true,
  include_gwarancja: false,
  gwarancja_czas: '12 miesięcy',
  gwarancja_opis: '',
  notes: '',
}

interface Props {
  data: UmowaKupnaSprzedazyData
  onChange: (data: UmowaKupnaSprzedazyData) => void
}

export function UmowaKupnaSprzedazyForm({ data, onChange }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = useCallback((field: keyof UmowaKupnaSprzedazyData, value: unknown) => {
    onChange({ ...data, [field]: value })
  }, [data, onChange])

  const setProduct = (id: number, field: keyof Product, value: string) => {
    const updated = data.products.map(p => {
      if (p.id !== id) return p
      const next = { ...p, [field]: value }
      const qty = parseFloat(next.quantity.replace(',', '.')) || 0
      const price = parseFloat(next.price.replace(',', '.')) || 0
      next.value = qty * price
      return next
    })
    set('products', updated)
  }

  const addProduct = () => {
    const newId = Math.max(...data.products.map(p => p.id), 0) + 1
    set('products', [...data.products, { id: newId, name: '', quantity: '', price: '', value: 0 }])
  }

  const removeProduct = (id: number) => {
    if (data.products.length <= 1) return
    set('products', data.products.filter(p => p.id !== id))
  }

  const total = data.products.reduce((s, p) => s + p.value, 0)

  const validateField = (field: string, value: string) => {
    const errs = { ...errors }
    if (field === 'pesel') {
      if (value && !validatePesel(value)) errs.pesel = 'Nieprawidłowy numer PESEL'
      else delete errs.pesel
    }
    if (field === 'iban') {
      if (value && !validateIBAN(value)) errs.iban = 'Format: PL + 26 cyfr'
      else delete errs.iban
    }
    setErrors(errs)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Section: Basic Info */}
      <FormSection icon={<Gear size={16} weight="fill" />} title="Dane podstawowe" number="1">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="form-label">Numer umowy</label>
            <div className="flex gap-2">
              <input className="form-input flex-1" placeholder="np. 01/02/2026/UKS"
                value={data.numer_umowy}
                onChange={e => set('numer_umowy', e.target.value)} />
              <button className="btn-ghost px-3 border border-border-subtle rounded-sm shrink-0 text-xs"
                onClick={() => set('numer_umowy', generateContractNumber('UKS'))}
                title="Generuj numer">
                <Hash size={14} />
                Auto
              </button>
            </div>
          </div>
          <div>
            <label className="form-label"><Calendar size={12} className="inline mr-1" />Data zawarcia</label>
            <input type="date" className="form-input"
              value={data.data}
              onChange={e => set('data', e.target.value)} />
          </div>
          <div>
            <label className="form-label"><MapPin size={12} className="inline mr-1" />Miejsce</label>
            <input className="form-input" placeholder="Gdańsk"
              value={data.miejsce}
              onChange={e => set('miejsce', e.target.value)} />
          </div>
        </div>
      </FormSection>

      {/* Section: Seller */}
      <FormSection icon={<User size={16} weight="fill" />} title="Dane Sprzedającego" number="2">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="form-label"><User size={12} className="inline mr-1" />Imię i nazwisko</label>
            <input className="form-input" placeholder="Jan Kowalski"
              value={data.sprzedajacy_imie}
              onChange={e => set('sprzedajacy_imie', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="form-label"><MapPin size={12} className="inline mr-1" />Adres zamieszkania</label>
            <input className="form-input" placeholder="ul. Przykładowa 1, 00-000 Warszawa"
              value={data.sprzedajacy_adres}
              onChange={e => set('sprzedajacy_adres', e.target.value)} />
          </div>
          <div>
            <label className="form-label"><IdentificationCard size={12} className="inline mr-1" />PESEL</label>
            <input className="form-input" placeholder="00000000000" maxLength={11}
              value={data.sprzedajacy_pesel}
              onChange={e => { set('sprzedajacy_pesel', e.target.value); validateField('pesel', e.target.value) }} />
            {errors.pesel && <p className="text-red-400 text-xs mt-1">{errors.pesel}</p>}
          </div>
          <div>
            <label className="form-label"><IdentificationCard size={12} className="inline mr-1" />Nr dowodu <span className="text-ink-low normal-case tracking-normal">(opcjonalnie)</span></label>
            <input className="form-input" placeholder="ABC123456" maxLength={9}
              value={data.sprzedajacy_dowod}
              onChange={e => set('sprzedajacy_dowod', e.target.value)} />
          </div>
          <div>
            <label className="form-label"><Phone size={12} className="inline mr-1" />Telefon <span className="text-ink-low normal-case tracking-normal">(opcjonalnie)</span></label>
            <input className="form-input" placeholder="+48 600 000 000"
              value={data.sprzedajacy_telefon}
              onChange={e => set('sprzedajacy_telefon', e.target.value)} />
          </div>
          <div>
            <label className="form-label"><EnvelopeSimple size={12} className="inline mr-1" />Email <span className="text-ink-low normal-case tracking-normal">(opcjonalnie)</span></label>
            <input className="form-input" type="email" placeholder="email@example.com"
              value={data.sprzedajacy_email}
              onChange={e => set('sprzedajacy_email', e.target.value)} />
          </div>
        </div>
      </FormSection>

      {/* Seller: Kupujący is fixed - Cashify */}
      <div className="rounded-md px-4 py-3 border border-brand-outline/30" style={{ background: 'rgba(245,182,100,0.05)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Buildings size={14} className="text-brand" />
          <span className="text-xs font-semibold text-brand uppercase tracking-wider">Kupujący (stały)</span>
        </div>
        <p className="text-xs text-ink-med leading-relaxed">
          <strong className="text-ink-high">MENNICA CASHIFY SP. Z O.O.</strong><br />
          ul. Marszałkowska 107, 00-110 Warszawa<br />
          KRS: 0000723077 · NIP: 5342579968 · REGON: 369692058
        </p>
      </div>

      {/* Section: Products */}
      <FormSection icon={<Package size={16} weight="fill" />} title="Przedmiot umowy" number="3">
        <div className="space-y-3">
          {data.products.map((product, idx) => (
            <div key={product.id}
              className="rounded-md p-3 border border-border-subtle"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-brand">Produkt #{idx + 1}</span>
                {data.products.length > 1 && (
                  <button onClick={() => removeProduct(product.id)}
                    className="text-ink-low hover:text-red-400 transition-colors p-1">
                    <Trash size={14} />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="form-label">Nazwa towaru / usługi</label>
                  <textarea className="form-input resize-none" rows={2} placeholder="Opis produktu lub usługi..."
                    value={product.name}
                    onChange={e => setProduct(product.id, 'name', e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="form-label">Ilość (j.m.)</label>
                    <input className="form-input" placeholder="1 szt."
                      value={product.quantity}
                      onChange={e => setProduct(product.id, 'quantity', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Cena (PLN)</label>
                    <input className="form-input" placeholder="0.00"
                      value={product.price}
                      onChange={e => setProduct(product.id, 'price', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Wartość</label>
                    <div className="form-input bg-surface-accent text-brand font-semibold">
                      {product.value > 0 ? `${formatCurrency(product.value)} zł` : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addProduct}
            className="w-full py-2.5 rounded-md border border-dashed border-border-med text-ink-low text-sm 
                       hover:border-brand/40 hover:text-brand transition-all duration-200 flex items-center justify-center gap-2">
            <Plus size={14} />
            Dodaj produkt
          </button>

          {/* Total */}
          <div className="rounded-md p-4 border border-brand-outline/40" style={{ background: 'rgba(245,182,100,0.08)' }}>
            <div className="flex justify-between items-center">
              <span className="text-xs text-ink-med uppercase tracking-wider">Łączna wartość</span>
              <div className="text-right">
                <div className="text-xl font-bold text-brand">{formatCurrency(total)} zł</div>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section: Payment */}
      <FormSection icon={<CurrencyDollar size={16} weight="fill" />} title="Forma płatności" number="4">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'gotowka', label: 'Gotówka', icon: <Money size={16} /> },
              { id: 'przelew', label: 'Przelew', icon: <Bank size={16} /> },
              { id: 'raty', label: 'Raty', icon: <CurrencyDollar size={16} /> },
            ].map(opt => (
              <button key={opt.id}
                onClick={() => set('platnosc_typ', data.platnosc_typ === opt.id ? '' : opt.id as 'gotowka' | 'przelew' | 'raty')}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-md border text-xs font-medium transition-all duration-200
                  ${data.platnosc_typ === opt.id
                    ? 'border-brand/50 text-brand bg-brand/10'
                    : 'border-border-subtle text-ink-low hover:border-border-med hover:text-ink-med'}`}>
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>

          {data.platnosc_typ === 'przelew' && (
            <div className="animate-fade-in">
              <label className="form-label">Numer konta IBAN</label>
              <input className={`form-input font-mono ${errors.iban ? 'border-red-500/50' : ''}`}
                placeholder="PL00 0000 0000 0000 0000 0000 0000"
                value={data.numer_konta}
                onChange={e => {
                  const formatted = formatIBAN(e.target.value)
                  set('numer_konta', formatted)
                  validateField('iban', formatted)
                }} />
              {errors.iban && <p className="text-red-400 text-xs mt-1">{errors.iban}</p>}

              <label className="form-label mt-3">Termin płatności</label>
              <input type="date" className="form-input"
                value={data.termin_platnosci}
                onChange={e => set('termin_platnosci', e.target.value)} />
            </div>
          )}

          {data.platnosc_typ === 'raty' && (
            <div className="animate-fade-in grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Liczba rat</label>
                <input className="form-input" placeholder="np. 3"
                  value={data.ilosc_rat}
                  onChange={e => set('ilosc_rat', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Numer konta IBAN</label>
                <input className="form-input font-mono text-xs" placeholder="PL..."
                  value={data.numer_konta}
                  onChange={e => set('numer_konta', formatIBAN(e.target.value))} />
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Section: Options */}
      <FormSection icon={<Gear size={16} weight="fill" />} title="Opcje dokumentu" number="5">
        <div className="space-y-3">
          <ToggleOption
            label="Klauzula RODO"
            description="Załącznik z informacją o przetwarzaniu danych osobowych"
            checked={data.include_rodo}
            onChange={v => set('include_rodo', v)} />

          <ToggleOption
            label="Gwarancja / rękojmia"
            description="Dodaj klauzulę gwarancyjną do umowy"
            checked={data.include_gwarancja}
            onChange={v => set('include_gwarancja', v)} />

          {data.include_gwarancja && (
            <div className="pl-3 border-l border-border-subtle space-y-2 animate-fade-in">
              <div>
                <label className="form-label">Okres gwarancji</label>
                <select className="form-input"
                  value={data.gwarancja_czas}
                  onChange={e => set('gwarancja_czas', e.target.value)}>
                  <option>6 miesięcy</option>
                  <option>12 miesięcy</option>
                  <option>24 miesiące</option>
                  <option>36 miesięcy</option>
                </select>
              </div>
              <div>
                <label className="form-label">Opis zakresu gwarancji</label>
                <textarea className="form-input resize-none" rows={2}
                  placeholder="Np. wady ukryte, sprawność mechaniczna..."
                  value={data.gwarancja_opis}
                  onChange={e => set('gwarancja_opis', e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label className="form-label"><Notebook size={12} className="inline mr-1" />Dodatkowe uwagi <span className="text-ink-low normal-case tracking-normal">(opcjonalnie)</span></label>
            <textarea className="form-input resize-none" rows={3}
              placeholder="Uwagi do umowy, dodatkowe ustalenia stron..."
              value={data.notes}
              onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
      </FormSection>
    </div>
  )
}

function FormSection({ icon, title, number, children }: {
  icon: React.ReactNode; title: string; number: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-sm bg-brand/20 border border-brand/30 flex items-center justify-center text-brand shrink-0">
          {icon}
        </div>
        <div>
          <span className="text-xs text-ink-low">§ {number}</span>
          <h3 className="text-sm font-semibold text-ink-high leading-none">{title}</h3>
        </div>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  )
}

function ToggleOption({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 px-3 py-3 rounded-md border cursor-pointer transition-all duration-200
        ${checked ? 'border-brand/40 bg-brand/5' : 'border-border-subtle hover:border-border-med'}`}>
      <div className={`w-9 h-5 rounded-pill relative transition-all duration-200 shrink-0
        ${checked ? 'bg-brand' : 'bg-surface-accent border border-border-med'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200
          ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-high">{label}</p>
        <p className="text-xs text-ink-low truncate">{description}</p>
      </div>
    </div>
  )
}

export function useUmowaKupnaSprzedazyData() {
  const [data, setData] = useState<UmowaKupnaSprzedazyData>(DEFAULT_DATA)
  const reset = () => setData(DEFAULT_DATA)
  return { data, setData, reset }
}
