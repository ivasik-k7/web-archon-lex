import { useState, useCallback } from 'react'
import { Buildings, User, ClipboardText, CurrencyDollar, Calendar, MapPin, IdentificationCard } from '@phosphor-icons/react'
import type { UmowaZlecenieData } from '../../types/documents'
import { numberToWords, formatCurrency, formatDatePL, generateContractNumber } from '../../shared/utils'

const DEFAULT: UmowaZlecenieData = {
  numer_umowy: '',
  data: new Date().toISOString().split('T')[0],
  miejsce: 'Gdańsk',
  zleceniodawca_nazwa: 'MENNICA CASHIFY SP. Z O.O.',
  zleceniodawca_adres: 'ul. Marszałkowska 107, 00-110 Warszawa',
  zleceniodawca_nip: '5342579968',
  zleceniodawca_regon: '369692058',
  zleceniodawca_repr: '',
  zleceniobiorca_imie: '',
  zleceniobiorca_adres: '',
  zleceniobiorca_pesel: '',
  opis_uslugi: '',
  wynagrodzenie: '',
  data_wykonania: '',
  platnosc_termin: '',
  platnosc_konto: '',
}

interface Props { data: UmowaZlecenieData; onChange: (d: UmowaZlecenieData) => void }

export function UmowaZlecenieForm({ data, onChange }: Props) {
  const set = useCallback((field: keyof UmowaZlecenieData, value: string) => {
    onChange({ ...data, [field]: value })
  }, [data, onChange])

  return (
    <div className="space-y-6 pb-8">
      {/* Basic */}
      <FormSection icon={<ClipboardText size={16} weight="fill" />} title="Dane podstawowe" number="1">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="form-label">Numer umowy</label>
            <div className="flex gap-2">
              <input className="form-input flex-1" placeholder="np. 01/02/2026/UZ" value={data.numer_umowy} onChange={e => set('numer_umowy', e.target.value)} />
              <button className="btn-ghost px-3 border border-border-subtle rounded-sm shrink-0 text-xs" onClick={() => set('numer_umowy', generateContractNumber('UZ'))}>Auto</button>
            </div>
          </div>
          <div>
            <label className="form-label"><Calendar size={12} className="inline mr-1" />Data</label>
            <input type="date" className="form-input" value={data.data} onChange={e => set('data', e.target.value)} />
          </div>
          <div>
            <label className="form-label"><MapPin size={12} className="inline mr-1" />Miejsce</label>
            <input className="form-input" placeholder="Gdańsk" value={data.miejsce} onChange={e => set('miejsce', e.target.value)} />
          </div>
        </div>
      </FormSection>

      {/* Zleceniodawca */}
      <FormSection icon={<Buildings size={16} weight="fill" />} title="Zleceniodawca" number="2">
        <div className="space-y-2">
          <div>
            <label className="form-label">Nazwa / Imię i nazwisko</label>
            <input className="form-input" value={data.zleceniodawca_nazwa} onChange={e => set('zleceniodawca_nazwa', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Adres</label>
            <input className="form-input" value={data.zleceniodawca_adres} onChange={e => set('zleceniodawca_adres', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="form-label">NIP</label>
              <input className="form-input" value={data.zleceniodawca_nip} onChange={e => set('zleceniodawca_nip', e.target.value)} />
            </div>
            <div>
              <label className="form-label">REGON</label>
              <input className="form-input" value={data.zleceniodawca_regon} onChange={e => set('zleceniodawca_regon', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Reprezentowany przez</label>
            <input className="form-input" placeholder="Imię i nazwisko osoby podpisującej" value={data.zleceniodawca_repr} onChange={e => set('zleceniodawca_repr', e.target.value)} />
          </div>
        </div>
      </FormSection>

      {/* Zleceniobiorca */}
      <FormSection icon={<User size={16} weight="fill" />} title="Zleceniobiorca" number="3">
        <div className="space-y-2">
          <div>
            <label className="form-label">Imię i nazwisko</label>
            <input className="form-input" placeholder="Jan Kowalski" value={data.zleceniobiorca_imie} onChange={e => set('zleceniobiorca_imie', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Adres</label>
            <input className="form-input" placeholder="ul. Przykładowa 1, 00-000 Miasto" value={data.zleceniobiorca_adres} onChange={e => set('zleceniobiorca_adres', e.target.value)} />
          </div>
          <div>
            <label className="form-label"><IdentificationCard size={12} className="inline mr-1" />PESEL</label>
            <input className="form-input" placeholder="00000000000" maxLength={11} value={data.zleceniobiorca_pesel} onChange={e => set('zleceniobiorca_pesel', e.target.value)} />
          </div>
        </div>
      </FormSection>

      {/* Service */}
      <FormSection icon={<ClipboardText size={16} weight="fill" />} title="Przedmiot zlecenia" number="4">
        <div className="space-y-2">
          <div>
            <label className="form-label">Opis usługi / czynności</label>
            <textarea className="form-input resize-none" rows={4} placeholder="Szczegółowy opis wykonywanych czynności..." value={data.opis_uslugi} onChange={e => set('opis_uslugi', e.target.value)} />
          </div>
          <div>
            <label className="form-label"><Calendar size={12} className="inline mr-1" />Termin wykonania</label>
            <input type="date" className="form-input" value={data.data_wykonania} onChange={e => set('data_wykonania', e.target.value)} />
          </div>
        </div>
      </FormSection>

      {/* Payment */}
      <FormSection icon={<CurrencyDollar size={16} weight="fill" />} title="Wynagrodzenie" number="5">
        <div className="space-y-2">
          <div>
            <label className="form-label">Wynagrodzenie brutto (PLN)</label>
            <input className="form-input" placeholder="0.00" value={data.wynagrodzenie} onChange={e => set('wynagrodzenie', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Numer konta (IBAN)</label>
            <input className="form-input font-mono" placeholder="PL00 0000 0000..." value={data.platnosc_konto} onChange={e => set('platnosc_konto', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Termin płatności</label>
            <input type="date" className="form-input" value={data.platnosc_termin} onChange={e => set('platnosc_termin', e.target.value)} />
          </div>
        </div>
      </FormSection>
    </div>
  )
}

export function UmowaZleceniePreview({ data }: { data: UmowaZlecenieData }) {
  const wynagrodzenie = parseFloat(data.wynagrodzenie.replace(',', '.')) || 0
  return (
    <div className="contract-preview bg-white p-[30px] shadow-card" style={{ minHeight: '297mm' }}>
      <h1>UMOWA ZLECENIE</h1>
      {data.numer_umowy && <p className="text-center text-xs mb-4" style={{ color: '#7c6a3e', fontWeight: 600 }}>{data.numer_umowy}</p>}

      <p>Umowa zawarta w dniu <strong>{data.data ? formatDatePL(data.data) : '__.__.____'}</strong> r., w <strong>{data.miejsce || 'miejsce'}</strong>, pomiędzy:</p>

      <div className="contract-section pl-4">
        <p><strong>Zleceniodawcą:</strong></p>
        <p>{data.zleceniodawca_nazwa || '___'}, z siedzibą: {data.zleceniodawca_adres || '___'}</p>
        {data.zleceniodawca_nip && <p>NIP: {data.zleceniodawca_nip}{data.zleceniodawca_regon ? `, REGON: ${data.zleceniodawca_regon}` : ''}</p>}
        {data.zleceniodawca_repr && <p>reprezentowanym przez: {data.zleceniodawca_repr}</p>}
        <p style={{ fontStyle: 'italic' }}>zwanym dalej Zleceniodawcą</p>
      </div>

      <div className="contract-section pl-4">
        <p><strong>Zleceniobiorcą:</strong></p>
        <p>{data.zleceniobiorca_imie || '___'}, zam. {data.zleceniobiorca_adres || '___'}</p>
        {data.zleceniobiorca_pesel && <p>PESEL: {data.zleceniobiorca_pesel}</p>}
        <p style={{ fontStyle: 'italic' }}>zwanym dalej Zleceniobiorcą</p>
      </div>

      <div className="contract-section">
        <h2>§ 1. Przedmiot umowy</h2>
        <p>Zleceniodawca zleca Zleceniobiorcy wykonanie następujących czynności:</p>
        <p style={{ marginTop: 6, paddingLeft: 16, borderLeft: '2px solid #ddd' }}>{data.opis_uslugi || '___'}</p>
        {data.data_wykonania && <p style={{ marginTop: 6 }}>Termin wykonania: <strong>{formatDatePL(data.data_wykonania)}</strong></p>}
      </div>

      <div className="contract-section">
        <h2>§ 2. Wynagrodzenie</h2>
        <p>Za wykonanie zlecenia Zleceniodawca wypłaci Zleceniobiorcy wynagrodzenie w kwocie <strong>{formatCurrency(wynagrodzenie)} zł brutto</strong> (słownie: {numberToWords(wynagrodzenie)}).</p>
        {data.platnosc_konto && <p style={{ marginTop: 4 }}>Płatność przelewem na rachunek: {data.platnosc_konto}</p>}
        {data.platnosc_termin && <p>Termin płatności: {formatDatePL(data.platnosc_termin)}</p>}
      </div>

      <div className="contract-section">
        <h2>§ 3. Wykonanie zlecenia</h2>
        <p>Zleceniobiorca zobowiązuje się do osobistego i starannego wykonania zleconych czynności, zgodnie z obowiązującymi przepisami prawa.</p>
      </div>

      <div className="contract-section">
        <h2>§ 4. Postanowienia końcowe</h2>
        <p>W sprawach nieuregulowanych mają zastosowanie przepisy Kodeksu cywilnego. Umowa sporządzona w dwóch jednobrzmiących egzemplarzach.</p>
      </div>

      <div className="signatures">
        <div className="signature-box">
          <div style={{ height: 40 }}></div>
          <div className="signature-line">Zleceniodawca</div>
        </div>
        <div className="signature-box">
          <div style={{ height: 40 }}></div>
          <div className="signature-line">Zleceniobiorca<br />{data.zleceniobiorca_imie || '___________________'}</div>
        </div>
      </div>
    </div>
  )
}

function FormSection({ icon, title, number, children }: { icon: React.ReactNode; title: string; number: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-sm bg-brand/20 border border-brand/30 flex items-center justify-center text-brand shrink-0">{icon}</div>
        <div><span className="text-xs text-ink-low">§ {number}</span><h3 className="text-sm font-semibold text-ink-high leading-none">{title}</h3></div>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  )
}

export function useUmowaZlecenieData() {
  const [data, setData] = useState<UmowaZlecenieData>(DEFAULT)
  const reset = () => setData(DEFAULT)
  return { data, setData, reset }
}
