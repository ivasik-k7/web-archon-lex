// import { useState, useCallback } from 'react'
// import { House, User, MapPin, Calendar, CurrencyDollar, IdentificationCard } from '@phosphor-icons/react'

// import type { UmowaNajmuData, PelnomocnictwoData } from '../../types/documents'
// import { numberToWords, formatCurrency, formatDatePL, generateContractNumber } from '../../shared/utils'


// const NAJMU_DEFAULT: UmowaNajmuData = {
//   numer_umowy: '', data_zawarcia: new Date().toISOString().split('T')[0], miejsce: 'Gdańsk',
//   wynajmujacy_imie: '', wynajmujacy_adres: '', wynajmujacy_pesel: '',
//   najemca_imie: '', najemca_adres: '', najemca_pesel: '',
//   nieruchomosc_adres: '', nieruchomosc_opis: '',
//   czynsz: '', kaucja: '', data_od: '', data_do: '', okres_wypowiedzenia: '1 miesiąc',
// }

// function FormSection({ icon, title, number, children }: { icon: React.ReactNode; title: string; number: string; children: React.ReactNode }) {
//   return (
//     <div className="space-y-3">
//       <div className="flex items-center gap-2.5">
//         <div className="w-6 h-6 rounded-sm bg-brand/20 border border-brand/30 flex items-center justify-center text-brand shrink-0">{icon}</div>
//         <div><span className="text-xs text-ink-low">§ {number}</span><h3 className="text-sm font-semibold text-ink-high leading-none">{title}</h3></div>
//       </div>
//       <div className="pl-8">{children}</div>
//     </div>
//   )
// }

// interface NajmuProps { data: UmowaNajmuData; onChange: (d: UmowaNajmuData) => void }

// export function UmowaNajmuForm({ data, onChange }: NajmuProps) {
//   const set = useCallback((f: keyof UmowaNajmuData, v: string) => onChange({ ...data, [f]: v }), [data, onChange])
//   const czynsz = parseFloat(data.czynsz.replace(',', '.')) || 0
//   const kaucja = parseFloat(data.kaucja.replace(',', '.')) || 0

//   return (
//     <div className="space-y-6 pb-8">
//       <FormSection icon={<House size={16} weight="fill" />} title="Dane podstawowe" number="1">
//         <div className="grid grid-cols-2 gap-3">
//           <div className="col-span-2">
//             <label className="form-label">Numer umowy</label>
//             <div className="flex gap-2">
//               <input className="form-input flex-1" placeholder="01/02/2026/UN" value={data.numer_umowy} onChange={e => set('numer_umowy', e.target.value)} />
//               <button className="btn-ghost px-3 border border-border-subtle rounded-sm text-xs" onClick={() => set('numer_umowy', generateContractNumber('UN'))}>Auto</button>
//             </div>
//           </div>
//           <div><label className="form-label"><Calendar size={12} className="inline mr-1" />Data zawarcia</label>
//             <input type="date" className="form-input" value={data.data_zawarcia} onChange={e => set('data_zawarcia', e.target.value)} /></div>
//           <div><label className="form-label"><MapPin size={12} className="inline mr-1" />Miejsce</label>
//             <input className="form-input" placeholder="Gdańsk" value={data.miejsce} onChange={e => set('miejsce', e.target.value)} /></div>
//         </div>
//       </FormSection>

//       <FormSection icon={<User size={16} weight="fill" />} title="Wynajmujący" number="2">
//         <div className="space-y-2">
//           <div><label className="form-label">Imię i nazwisko</label><input className="form-input" placeholder="Jan Kowalski" value={data.wynajmujacy_imie} onChange={e => set('wynajmujacy_imie', e.target.value)} /></div>
//           <div><label className="form-label">Adres</label><input className="form-input" placeholder="ul. Przykładowa 1, 00-000 Miasto" value={data.wynajmujacy_adres} onChange={e => set('wynajmujacy_adres', e.target.value)} /></div>
//           <div><label className="form-label"><IdentificationCard size={12} className="inline mr-1" />PESEL</label><input className="form-input" placeholder="00000000000" maxLength={11} value={data.wynajmujacy_pesel} onChange={e => set('wynajmujacy_pesel', e.target.value)} /></div>
//         </div>
//       </FormSection>

//       <FormSection icon={<User size={16} weight="fill" />} title="Najemca" number="3">
//         <div className="space-y-2">
//           <div><label className="form-label">Imię i nazwisko</label><input className="form-input" placeholder="Anna Nowak" value={data.najemca_imie} onChange={e => set('najemca_imie', e.target.value)} /></div>
//           <div><label className="form-label">Adres</label><input className="form-input" value={data.najemca_adres} onChange={e => set('najemca_adres', e.target.value)} /></div>
//           <div><label className="form-label"><IdentificationCard size={12} className="inline mr-1" />PESEL</label><input className="form-input" placeholder="00000000000" maxLength={11} value={data.najemca_pesel} onChange={e => set('najemca_pesel', e.target.value)} /></div>
//         </div>
//       </FormSection>

//       <FormSection icon={<House size={16} weight="fill" />} title="Nieruchomość" number="4">
//         <div className="space-y-2">
//           <div><label className="form-label">Adres nieruchomości</label><input className="form-input" placeholder="ul. Najmu 5/10, 00-000 Miasto" value={data.nieruchomosc_adres} onChange={e => set('nieruchomosc_adres', e.target.value)} /></div>
//           <div><label className="form-label">Opis (opcjonalnie)</label><textarea className="form-input resize-none" rows={2} placeholder="Kawalerka, 35m², 3. piętro..." value={data.nieruchomosc_opis} onChange={e => set('nieruchomosc_opis', e.target.value)} /></div>
//           <div className="grid grid-cols-2 gap-2">
//             <div><label className="form-label"><Calendar size={12} className="inline mr-1" />Najem od</label><input type="date" className="form-input" value={data.data_od} onChange={e => set('data_od', e.target.value)} /></div>
//             <div><label className="form-label"><Calendar size={12} className="inline mr-1" />Najem do <span className="text-ink-low normal-case tracking-normal">(opcjonalnie)</span></label><input type="date" className="form-input" value={data.data_do} onChange={e => set('data_do', e.target.value)} /></div>
//           </div>
//           <div><label className="form-label">Okres wypowiedzenia</label>
//             <select className="form-input" value={data.okres_wypowiedzenia} onChange={e => set('okres_wypowiedzenia', e.target.value)}>
//               <option>1 miesiąc</option><option>2 miesiące</option><option>3 miesiące</option>
//             </select></div>
//         </div>
//       </FormSection>

//       <FormSection icon={<CurrencyDollar size={16} weight="fill" />} title="Finansowe" number="5">
//         <div className="grid grid-cols-2 gap-3">
//           <div><label className="form-label">Czynsz miesięczny (PLN)</label>
//             <input className="form-input" placeholder="0.00" value={data.czynsz} onChange={e => set('czynsz', e.target.value)} />
//             {czynsz > 0 && <p className="text-xs text-ink-low mt-1">{numberToWords(czynsz)}</p>}</div>
//           <div><label className="form-label">Kaucja (PLN)</label>
//             <input className="form-input" placeholder="0.00" value={data.kaucja} onChange={e => set('kaucja', e.target.value)} />
//             {kaucja > 0 && <p className="text-xs text-ink-low mt-1">{numberToWords(kaucja)}</p>}</div>
//         </div>
//       </FormSection>
//     </div>
//   )
// }

// export function UmowaNajmuPreview({ data }: { data: UmowaNajmuData }) {
//   const czynsz = parseFloat(data.czynsz.replace(',', '.')) || 0
//   const kaucja = parseFloat(data.kaucja.replace(',', '.')) || 0
//   return (
//     <div className="contract-preview bg-white p-[30px] shadow-card" style={{ minHeight: '297mm' }}>
//       <h1>UMOWA NAJMU LOKALU</h1>
//       {data.numer_umowy && <p className="text-center text-xs mb-4" style={{ color: '#7c6a3e', fontWeight: 600 }}>{data.numer_umowy}</p>}
//       <p>Umowa zawarta w dniu <strong>{data.data_zawarcia ? formatDatePL(data.data_zawarcia) : '__.__.____'}</strong> r., w <strong>{data.miejsce || 'miejsce'}</strong>, pomiędzy:</p>
//       <div className="contract-section pl-4">
//         <p><strong>Wynajmującym:</strong> {data.wynajmujacy_imie || '___'}, zam. {data.wynajmujacy_adres || '___'}{data.wynajmujacy_pesel ? `, PESEL: ${data.wynajmujacy_pesel}` : ''}</p>
//         <p style={{ fontStyle: 'italic' }}>zwanym dalej Wynajmującym</p>
//       </div>
//       <div className="contract-section pl-4">
//         <p><strong>Najemcą:</strong> {data.najemca_imie || '___'}, zam. {data.najemca_adres || '___'}{data.najemca_pesel ? `, PESEL: ${data.najemca_pesel}` : ''}</p>
//         <p style={{ fontStyle: 'italic' }}>zwanym dalej Najemcą</p>
//       </div>
//       <div className="contract-section">
//         <h2>§ 1. Przedmiot najmu</h2>
//         <p>Wynajmujący oddaje Najemcy do używania lokal mieszkalny/użytkowy, położony: <strong>{data.nieruchomosc_adres || '___'}</strong>{data.nieruchomosc_opis ? ` (${data.nieruchomosc_opis})` : ''}.</p>
//         {data.data_od && <p style={{ marginTop: 4 }}>Najem zawiera się od dnia <strong>{formatDatePL(data.data_od)}</strong>{data.data_do ? ` do dnia ${formatDatePL(data.data_do)}` : ' na czas nieokreślony'}.</p>}
//       </div>
//       <div className="contract-section">
//         <h2>§ 2. Czynsz i kaucja</h2>
//         {czynsz > 0 && <p>Najemca zobowiązuje się płacić czynsz w wysokości <strong>{formatCurrency(czynsz)} zł</strong> miesięcznie (słownie: {numberToWords(czynsz)}).</p>}
//         {kaucja > 0 && <p style={{ marginTop: 4 }}>Kaucja wynosi <strong>{formatCurrency(kaucja)} zł</strong> (słownie: {numberToWords(kaucja)}) i jest płatna przy podpisaniu umowy.</p>}
//       </div>
//       <div className="contract-section">
//         <h2>§ 3. Wypowiedzenie</h2>
//         <p>Umowa może być wypowiedziana przez każdą ze stron z zachowaniem okresu wypowiedzenia wynoszącego <strong>{data.okres_wypowiedzenia}</strong>.</p>
//       </div>
//       <div className="contract-section">
//         <h2>§ 4. Postanowienia końcowe</h2>
//         <p>W sprawach nieuregulowanych stosuje się przepisy Kodeksu cywilnego i Ustawy o ochronie praw lokatorów. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach.</p>
//       </div>
//       <div className="signatures">
//         <div className="signature-box"><div style={{ height: 40 }}></div><div className="signature-line">Wynajmujący<br />{data.wynajmujacy_imie || '___________________'}</div></div>
//         <div className="signature-box"><div style={{ height: 40 }}></div><div className="signature-line">Najemca<br />{data.najemca_imie || '___________________'}</div></div>
//       </div>
//     </div>
//   )
// }

// export function useUmowaNajmuData() {
//   const [data, setData] = useState<UmowaNajmuData>(NAJMU_DEFAULT)
//   const reset = () => setData(NAJMU_DEFAULT)
//   return { data, setData, reset }
// }

// // ========== PEŁNOMOCNICTWO ==========
// const PELN_DEFAULT: PelnomocnictwoData = {
//   numer: '', data: new Date().toISOString().split('T')[0], miejsce: 'Gdańsk',
//   mocodawca_imie: '', mocodawca_adres: '', mocodawca_pesel: '',
//   pelnomocnik_imie: '', pelnomocnik_adres: '', pelnomocnik_pesel: '',
//   zakres: '', rodzaj: 'szczegolne', notarialne: false,
// }

// interface PelnProps { data: PelnomocnictwoData; onChange: (d: PelnomocnictwoData) => void }

// export function PelnomocnictwoForm({ data, onChange }: PelnProps) {
//   const set = useCallback((f: keyof PelnomocnictwoData, v: unknown) => onChange({ ...data, [f]: v }), [data, onChange])
//   return (
//     <div className="space-y-6 pb-8">
//       <FormSection icon={<User size={16} weight="fill" />} title="Dane podstawowe" number="1">
//         <div className="grid grid-cols-2 gap-3">
//           <div className="col-span-2">
//             <label className="form-label">Numer / sygnatura</label>
//             <input className="form-input" placeholder="np. P/01/2026" value={data.numer} onChange={e => set('numer', e.target.value)} />
//           </div>
//           <div><label className="form-label"><Calendar size={12} className="inline mr-1" />Data</label><input type="date" className="form-input" value={data.data} onChange={e => set('data', e.target.value)} /></div>
//           <div><label className="form-label"><MapPin size={12} className="inline mr-1" />Miejsce</label><input className="form-input" placeholder="Gdańsk" value={data.miejsce} onChange={e => set('miejsce', e.target.value)} /></div>
//         </div>
//         <div className="mt-3">
//           <label className="form-label">Rodzaj pełnomocnictwa</label>
//           <div className="grid grid-cols-3 gap-2">
//             {[{ id: 'ogolne', label: 'Ogólne' }, { id: 'szczegolne', label: 'Szczególne' }, { id: 'rodzajowe', label: 'Rodzajowe' }].map(opt => (
//               <button key={opt.id} onClick={() => set('rodzaj', opt.id)}
//                 className={`py-2 rounded-md border text-xs font-medium transition-all ${data.rodzaj === opt.id ? 'border-brand/50 text-brand bg-brand/10' : 'border-border-subtle text-ink-low hover:border-border-med'}`}>
//                 {opt.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </FormSection>

//       <FormSection icon={<User size={16} weight="fill" />} title="Mocodawca" number="2">
//         <div className="space-y-2">
//           <div><label className="form-label">Imię i nazwisko</label><input className="form-input" placeholder="Jan Kowalski" value={data.mocodawca_imie} onChange={e => set('mocodawca_imie', e.target.value)} /></div>
//           <div><label className="form-label">Adres</label><input className="form-input" value={data.mocodawca_adres} onChange={e => set('mocodawca_adres', e.target.value)} /></div>
//           <div><label className="form-label"><IdentificationCard size={12} className="inline mr-1" />PESEL</label><input className="form-input" placeholder="00000000000" maxLength={11} value={data.mocodawca_pesel} onChange={e => set('mocodawca_pesel', e.target.value)} /></div>
//         </div>
//       </FormSection>

//       <FormSection icon={<User size={16} weight="fill" />} title="Pełnomocnik" number="3">
//         <div className="space-y-2">
//           <div><label className="form-label">Imię i nazwisko</label><input className="form-input" placeholder="Anna Nowak" value={data.pelnomocnik_imie} onChange={e => set('pelnomocnik_imie', e.target.value)} /></div>
//           <div><label className="form-label">Adres</label><input className="form-input" value={data.pelnomocnik_adres} onChange={e => set('pelnomocnik_adres', e.target.value)} /></div>
//           <div><label className="form-label"><IdentificationCard size={12} className="inline mr-1" />PESEL</label><input className="form-input" placeholder="00000000000" maxLength={11} value={data.pelnomocnik_pesel} onChange={e => set('pelnomocnik_pesel', e.target.value)} /></div>
//         </div>
//       </FormSection>

//       <FormSection icon={<User size={16} weight="fill" />} title="Zakres umocowania" number="4">
//         <div className="space-y-2">
//           <div><label className="form-label">Opis zakresu</label><textarea className="form-input resize-none" rows={4} placeholder="Np. do zawarcia umów kupna-sprzedaży, podpisywania dokumentów w imieniu mocodawcy..." value={data.zakres} onChange={e => set('zakres', e.target.value)} /></div>
//           <div className="flex items-center gap-3 p-3 rounded-md border border-border-subtle cursor-pointer hover:border-border-med transition-all" onClick={() => set('notarialne', !data.notarialne)}>
//             <div className={`w-9 h-5 rounded-pill relative transition-all shrink-0 ${data.notarialne ? 'bg-brand' : 'bg-surface-accent border border-border-med'}`}>
//               <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${data.notarialne ? 'left-[18px]' : 'left-0.5'}`} />
//             </div>
//             <div><p className="text-sm font-medium text-ink-high">Pełnomocnictwo notarialne</p><p className="text-xs text-ink-low">Wymaga poświadczenia notariusza</p></div>
//           </div>
//         </div>
//       </FormSection>
//     </div>
//   )
// }

// export function PelnomocnictwoPreview({ data }: { data: PelnomocnictwoData }) {
//   const rodzajLabel = { ogolne: 'ogólne', szczegolne: 'szczególne', rodzajowe: 'rodzajowe' }[data.rodzaj] ?? ''
//   return (
//     <div className="contract-preview bg-white p-[30px] shadow-card" style={{ minHeight: '297mm' }}>
//       <h1>PEŁNOMOCNICTWO {rodzajLabel.toUpperCase()}</h1>
//       {data.numer && <p className="text-center text-xs mb-4" style={{ color: '#7c6a3e', fontWeight: 600 }}>{data.numer}</p>}
//       <p>Sporządzone w dniu <strong>{data.data ? formatDatePL(data.data) : '__.__.____'}</strong> r., w <strong>{data.miejsce || 'miejsce'}</strong>.</p>
//       <div className="contract-section">
//         <p>Ja, niżej podpisany/a <strong>{data.mocodawca_imie || '___'}</strong>, zamieszkały/a: {data.mocodawca_adres || '___'}{data.mocodawca_pesel ? `, PESEL: ${data.mocodawca_pesel}` : ''},</p>
//         <p style={{ marginTop: 8 }}>niniejszym udzielam pełnomocnictwa {rodzajLabel}</p>
//         <p style={{ marginTop: 8 }}><strong>{data.pelnomocnik_imie || '___'}</strong>, zamieszkały/a: {data.pelnomocnik_adres || '___'}{data.pelnomocnik_pesel ? `, PESEL: ${data.pelnomocnik_pesel}` : ''}</p>
//       </div>
//       <div className="contract-section">
//         <h2>Zakres umocowania</h2>
//         <p style={{ paddingLeft: 16, borderLeft: '2px solid #ddd' }}>{data.zakres || '___'}</p>
//       </div>
//       {data.notarialne && (
//         <div className="contract-section" style={{ border: '1px solid #ddd', padding: 12, marginTop: 16 }}>
//           <p style={{ textAlign: 'center', fontWeight: 600 }}>MIEJSCE NA POŚWIADCZENIE NOTARIALNE</p>
//           <div style={{ height: 60, borderTop: '1px dashed #ccc', marginTop: 12 }}></div>
//         </div>
//       )}
//       <div className="signatures">
//         <div className="signature-box"><div style={{ height: 40 }}></div><div className="signature-line">Mocodawca<br />{data.mocodawca_imie || '___________________'}</div></div>
//       </div>
//     </div>
//   )
// }

// export function usePelnomocnictwoData() {
//   const [data, setData] = useState<PelnomocnictwoData>(PELN_DEFAULT)
//   const reset = () => setData(PELN_DEFAULT)
//   return { data, setData, reset }
// }
