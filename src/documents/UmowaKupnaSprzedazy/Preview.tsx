
import type { UmowaKupnaSprzedazyData } from '../../types/documents'
import { numberToWords, formatCurrency, formatDatePL } from '../../shared/utils'


interface Props {
  data: UmowaKupnaSprzedazyData
  logoSrc?: string
}

const F = ({ value, placeholder }: { value?: string; placeholder: string }) =>
  value
    ? <span className="field-value">{value}</span>
    : <span className="field-placeholder">{placeholder}</span>

export function UmowaKupnaSprzedazyPreview({ data, logoSrc }: Props) {
  const total = data.products.reduce((s, p) => s + p.value, 0)
  const totalWords = numberToWords(total)

  const paymentParagraph = () => {
    if (data.platnosc_typ === 'gotowka')
      return 'Płatność realizowana jest jednorazowo, w całości gotówką, w dniu podpisania niniejszej umowy.'
    if (data.platnosc_typ === 'przelew') {
      let text = 'Płatność realizowana jest przelewem bankowym'
      if (data.numer_konta) text += ` na rachunek: ${data.numer_konta}`
      if (data.termin_platnosci) text += `, w terminie do dnia ${formatDatePL(data.termin_platnosci)}`
      return text + '.'
    }
    if (data.platnosc_typ === 'raty') {
      return `Płatność realizowana jest w ${data.ilosc_rat || '___'} równych ratach${data.numer_konta ? ` na rachunek: ${data.numer_konta}` : ''}.`
    }
    return 'Forma płatności nie została określona.'
  }

  return (
    <div className="contract-preview bg-white p-[30px] shadow-card relative overflow-hidden" style={{ minHeight: '297mm' }}>
      {/* Watermark logo */}
      {logoSrc && (
        <img src={logoSrc} alt="" aria-hidden="true"
          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-[0.06] w-64 pointer-events-none select-none" />
      )}

      <div className="relative z-10">
        <h1>UMOWA KUPNA-SPRZEDAŻY</h1>
        <p className="text-center text-xs mb-4" style={{ color: '#7c6a3e', fontWeight: 600 }}>
          {data.numer_umowy || <F value="" placeholder="Numer umowy" />}
          {data.numer_umowy ? ` ` : ''}
        </p>

        {/* Intro */}
        <div className="contract-section">
          <p>
            Umowa zawarta w dniu{' '}
            <F value={data.data ? formatDatePL(data.data) : ''} placeholder="__.__.____" /> r.,{' '}
            w <F value={data.miejsce} placeholder="miejsce" />, pomiędzy:
          </p>
        </div>

        {/* Sprzedający */}
        <div className="contract-section pl-4">
          <p><strong>Sprzedający:</strong></p>
          <p>Imię i nazwisko: <F value={data.sprzedajacy_imie} placeholder="imię i nazwisko" /></p>
          <p>Adres: <F value={data.sprzedajacy_adres} placeholder="adres zamieszkania" /></p>
          <p>PESEL: <F value={data.sprzedajacy_pesel} placeholder="nr PESEL" /></p>
          {data.sprzedajacy_dowod && <p>Nr dowodu osobistego: <span className="field-value">{data.sprzedajacy_dowod}</span></p>}
          {data.sprzedajacy_telefon && <p>Telefon: <span className="field-value">{data.sprzedajacy_telefon}</span></p>}
          {data.sprzedajacy_email && <p>E-mail: <span className="field-value">{data.sprzedajacy_email}</span></p>}
          <p style={{ fontStyle: 'italic', marginTop: 4 }}>zwanym dalej Sprzedającym</p>
        </div>

        {/* Kupujący */}
        <div className="contract-section pl-4" style={{ marginTop: 8 }}>
          <p><strong>Kupujący:</strong></p>
          <p>
            <strong>MENNICA CASHIFY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</strong>
          </p>
          <p>z siedzibą w Warszawie, ul. Marszałkowska 107, 00-110 Warszawa,</p>
          <p>KRS: 0000723077, NIP: 5342579968, REGON: 369692058, kapitał zakładowy 5 000,00 zł</p>
          <p style={{ fontStyle: 'italic', marginTop: 4 }}>zwaną dalej Kupującym, o następującej treści:</p>
        </div>

        {/* § 1 Products */}
        <div className="contract-section">
          <h2>§ 1. Przedmiot umowy</h2>
          <p>Sprzedający sprzedaje, a Kupujący kupuje następujące rzeczy:</p>
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ width: 30 }}>LP</th>
                <th>Nazwa towaru / usługi</th>
                <th style={{ width: 80 }}>Ilość (j.m.)</th>
                <th style={{ width: 70 }}>Cena (PLN)</th>
                <th style={{ width: 70 }}>Wartość (PLN)</th>
              </tr>
            </thead>
            <tbody>
              {data.products.length > 0 && data.products.some(p => p.name || p.value > 0) ? (
                data.products.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td style={{ textAlign: 'left' }}>{p.name || <span style={{ color: '#ccc' }}>—</span>}</td>
                    <td>{p.quantity || '—'}</td>
                    <td>{p.price ? formatCurrency(parseFloat(p.price.replace(',', '.')) || 0) : '—'}</td>
                    <td>{p.value > 0 ? formatCurrency(p.value) : '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ color: '#bbb', textAlign: 'center' }}>Brak produktów</td>
                </tr>
              )}
              <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
                <td colSpan={3}></td>
                <td>Razem:</td>
                <td>{formatCurrency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* § 2 Price */}
        <div className="contract-section">
          <h2>§ 2. Cena</h2>
          <p>
            Kupujący zapłaci/ł Sprzedającemu cenę w wysokości{' '}
            <strong>{formatCurrency(total)} zł</strong>{' '}
            (słownie: <em>{totalWords}</em>).
          </p>
          <p style={{ marginTop: 6 }}>{paymentParagraph()}</p>
        </div>

        {/* § 3 Delivery */}
        <div className="contract-section">
          <h2>§ 3. Wydanie rzeczy</h2>
          <p>Sprzedający dostarczył rzecz Kupującemu przed zawarciem umowy.</p>
        </div>

        {/* § 4 Warranty (optional) */}
        {data.include_gwarancja && (
          <div className="contract-section">
            <h2>§ 4. Gwarancja i rękojmia</h2>
            <p>
              Sprzedający udziela Kupującemu gwarancji na okres <strong>{data.gwarancja_czas}</strong>{' '}
              od dnia zawarcia niniejszej umowy.
              {data.gwarancja_opis && ` Zakres gwarancji obejmuje: ${data.gwarancja_opis}.`}
            </p>
            <p style={{ marginTop: 4 }}>
              W przypadku wykrycia wady Kupujący zobowiązany jest do pisemnego poinformowania Sprzedającego
              w terminie 14 dni od jej wykrycia.
            </p>
          </div>
        )}

        {/* § 5 Provisions */}
        <div className="contract-section">
          <h2>{data.include_gwarancja ? '§ 5.' : '§ 4.'} Przepisy uzupełniające</h2>
          <p>W sprawach nieuregulowanych niniejszą umową mają zastosowanie przepisy kodeksu cywilnego.</p>
        </div>

        <div className="contract-section">
          <h2>{data.include_gwarancja ? '§ 6.' : '§ 5.'} Forma zmiany umowy</h2>
          <p>Zmiana umowy wymaga formy pisemnej pod rygorem nieważności.</p>
        </div>

        <div className="contract-section">
          <h2>{data.include_gwarancja ? '§ 7.' : '§ 6.'} Egzemplarze umowy</h2>
          <p>Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.</p>
        </div>

        {/* Additional notes */}
        {data.notes && (
          <div className="contract-section">
            <h2>Uwagi dodatkowe</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{data.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="signatures">
          <div className="signature-box">
            <div style={{ height: 40 }}></div>
            <div className="signature-line">Sprzedający<br />{data.sprzedajacy_imie || '___________________'}</div>
          </div>
          <div className="signature-box">
            <div style={{ height: 40 }}></div>
            <div className="signature-line">Kupujący<br />Mennica Cashify Sp. z o.o.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// RODO Appendix
export function RODOAppendix({ sellerName }: { sellerName?: string }) {
  return (
    <div className="contract-preview bg-white p-[30px] shadow-card" style={{ minHeight: '160mm' }}>
      <h2 style={{ marginTop: 0 }}>Załącznik nr 1</h2>
      <h2>KLAUZULA INFORMACYJNA RODO</h2>

      <p>Klauzula informacyjna w sprawie przetwarzania danych osobowych na potrzeby realizacji Umowy Kupna-Sprzedaży.</p>

      <p><strong>Administratorem danych osobowych</strong> jest MENNICA CASHIFY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ (zwana dalej Administratorem).</p>
      <p><strong>Dane kontaktowe:</strong> tel. +48 533 797 767, email: biuro@cashify.gold</p>

      <p>Pani/Pana dane osobowe przetwarzane będą w celu realizacji umowy – na podstawie art. 6 ust. 1 lit. b ogólnego rozporządzenia o ochronie danych osobowych z dnia 27 kwietnia 2016 r.</p>
      <p>Pani/Pana dane osobowe będą mogły być przekazywane wyłącznie podmiotom upoważnionym z mocy prawa.</p>
      <p>Dane będą przetwarzane przez okres wynikający z przepisów archiwalnych.</p>

      <p><strong>Przysługuje Pani/Panu prawo do żądania od Administratora:</strong></p>
      <ul style={{ paddingLeft: 20, lineHeight: 1.7 }}>
        <li>dostępu do swoich danych osobowych, ich sprostowania, usunięcia lub ograniczenia przetwarzania,</li>
        <li>wnoszenia sprzeciwu wobec ich przetwarzania,</li>
        <li>przenoszenia danych,</li>
        <li>cofnięcia zgody na przetwarzanie danych,</li>
        <li>wniesienia skargi do organu nadzorczego (UODO).</li>
      </ul>

      <p>Podanie danych osobowych jest dobrowolne, jednakże konsekwencją ich niepodania jest brak możliwości zawarcia umowy.</p>

      <div style={{ marginTop: 40 }}>
        <p>Podpis Sprzedającego:</p>
        <div style={{ borderTop: '0.5px solid #333', width: 200, marginTop: 30, paddingTop: 4, fontSize: 9, color: '#555' }}>
          {sellerName || '___________________'}
        </div>
      </div>
    </div>
  )
}
