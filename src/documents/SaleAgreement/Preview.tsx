import {
    PreviewWrapper, DocumentTitle, FieldValue, PreviewSection,
    PartyBlock, ContractTable, SignatureBlock, ConditionalParagraph,
} from '../../shared/previewAtoms'

import {
    numberToWords, formatCurrency, formatDatePL, formatIBAN
} from '../../shared/utils'
import type { SaleAgreementData } from '../../types/saleAgreement'

interface Props {
    data: SaleAgreementData
    logoSrc?: string
}

export function SaleAgreementPreview({ data, logoSrc }: Props) {
    const totalWords = numberToWords(data.totalGross)
    const hasWarranty = data.includeWarranty && data.warranty?.period && data.warranty.period > 0
    const hasInstallments = data.paymentType === 'installments' && data.installments?.count && data.installments.count > 0

    // Dynamic section numbering
    const sn = (base: number) => {
        let offset = 0
        if (hasWarranty) offset++
        if (data.excludeWarranty) offset++
        if (hasInstallments) offset++
        return base + offset
    }

    return (
        <PreviewWrapper logoSrc={logoSrc}>

            {/* ── Tytuł ──────────────────────────────────────────────────────── */}
            <DocumentTitle
                title="UMOWA KUPNA-SPRZEDAŻY"
                subtitle="zawarta na podstawie art. 535 Kodeksu Cywilnego"
                contractNumber={data.contractNumber}
                date={data.contractDate}
                location={data.location}
            />

            {/* ── Preambuła ──────────────────────────────────────────────────── */}
            <PreviewSection>
                <p style={{ textAlign: 'justify' }}>
                    Zawarta w dniu <FieldValue value={formatDatePL(data.contractDate)} placeholder="__________" /> r.
                    w <FieldValue value={data.location} placeholder="__________" /> pomiędzy:
                </p>
            </PreviewSection>

            {/* ── Sprzedający ────────────────────────────────────────────────── */}
            <PreviewSection>
                <PartyBlock
                    role="Sprzedającym"
                    isCompany={data.seller.isCompany}
                    fields={[
                        // Osoba fizyczna
                        ...(!data.seller.isCompany ? [
                            {
                                label: 'Imię i nazwisko',
                                value: `${data.seller.firstName || ''} ${data.seller.lastName || ''}`.trim(),
                                placeholder: 'imię i nazwisko',
                                required: true
                            },
                            {
                                label: 'PESEL',
                                value: data.seller.pesel,
                                placeholder: 'nr PESEL',
                                required: true
                            },
                            {
                                label: 'Dowód osobisty',
                                value: data.seller.idNumber,
                                optional: true
                            },
                        ] : [
                            // Firma
                            {
                                label: 'Firma',
                                value: data.seller.companyName,
                                placeholder: 'nazwa przedsiębiorcy',
                                required: true
                            },
                            {
                                label: 'NIP',
                                value: data.seller.nip,
                                placeholder: 'NIP',
                                required: true
                            },
                            {
                                label: 'REGON',
                                value: data.seller.regon,
                                placeholder: 'REGON'
                            },
                            ...(data.seller.krs ? [{
                                label: 'KRS',
                                value: data.seller.krs,
                                placeholder: 'KRS'
                            }] : []),
                        ]),

                        // Adres - zawsze wymagany
                        {
                            label: 'Adres',
                            value: formatAddress(data.seller),
                            placeholder: 'adres zamieszkania/siedziby',
                            required: true
                        },

                        // Kontakt - opcjonalny
                        ...(data.seller.phone ? [{
                            label: 'Telefon',
                            value: data.seller.phone,
                            optional: true
                        }] : []),

                        ...(data.seller.email ? [{
                            label: 'E-mail',
                            value: data.seller.email,
                            optional: true
                        }] : []),
                    ]}
                    closingLine="zwanym dalej Sprzedającym"
                />
            </PreviewSection>

            {/* ── Kupujący ───────────────────────────────────────────────────── */}
            <PreviewSection>
                <div style={{ marginLeft: 16, marginBottom: 16 }}>
                    <p><strong>a</strong></p>
                    <p style={{ marginTop: 8 }}>
                        <strong>{data.buyer.companyName}</strong>
                    </p>
                    <p>
                        z siedzibą w {data.buyer.city},
                        ul. {data.buyer.street} {data.buyer.houseNumber}
                        {data.buyer.apartmentNumber && `/${data.buyer.apartmentNumber}`},
                        {data.buyer.postalCode} {data.buyer.city}
                    </p>
                    <p>
                        KRS: {data.buyer.krs}, NIP: {data.buyer.nip}, REGON: {data.buyer.regon},
                        kapitał zakładowy: 5.000,00 zł
                    </p>
                    <p style={{ marginTop: 4, fontStyle: 'italic' }}>
                        zwaną dalej <strong>Kupującym</strong>, o następującej treści:
                    </p>
                </div>
            </PreviewSection>

            {/* ── §1 Przedmiot umowy ─────────────────────────────────────────── */}
            <PreviewSection title="PRZEDMIOT UMOWY" titleNumber={1}>
                <p>
                    Sprzedający oświadcza, że jest właścicielem rzeczy oznaczonych co do tożsamości
                    w ust. 2, a Kupujący oświadcza, że rzecz tę oglądał, uznał ją za zgodną z umową
                    i kupuje ją na własność.
                </p>

                <ContractTable
                    title="Wyszczególnienie przedmiotu sprzedaży:"
                    columns={[
                        { key: 'lp', label: 'Lp.', width: 40 },
                        { key: 'name', label: 'Nazwa (rodzaj) przedmiotu', align: 'left' },
                        { key: 'quantity', label: 'Ilość', width: 70 },
                        { key: 'unit', label: 'J.m.', width: 60 },
                        { key: 'price', label: 'Cena jedn. netto', width: 90 },
                        { key: 'vat', label: 'VAT', width: 60 },
                        { key: 'value', label: 'Wartość netto', width: 90 },
                    ]}
                    rows={data.products
                        .filter(p => p.name && p.price > 0)
                        .map((p, i) => [
                            i + 1,
                            p.name,
                            p.quantity,
                            p.unit || 'szt.',
                            `${formatCurrency(p.price)} zł`,
                            `${p.vatRate || 23}%`,
                            `${formatCurrency(p.value)} zł`,
                        ])
                    }
                    footnotes={[
                        'Wszystkie ceny wyrażone są w złotych polskich (PLN).',
                        'Podatek VAT został naliczony zgodnie z obowiązującymi przepisami.'
                    ]}
                />

                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: '60%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                            <span>Wartość netto:</span>
                            <strong>{formatCurrency(data.totalNet)} zł</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                            <span>VAT 23%:</span>
                            <strong>{formatCurrency(data.totalVat)} zł</strong>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0 4px',
                            borderTop: '1px solid #333',
                            fontWeight: 'bold',
                            fontSize: '1.1em'
                        }}>
                            <span>WARTOŚĆ BRUTTO - CENA:</span>
                            <span>{formatCurrency(data.totalGross)} zł</span>
                        </div>
                    </div>
                </div>
            </PreviewSection>

            {/* ── §2 Cena i warunki płatności ────────────────────────────────── */}
            <PreviewSection title="CENA I WARUNKI PŁATNOŚCI" titleNumber={2}>
                <p>
                    Strony ustalają cenę sprzedaży na kwotę{' '}
                    <strong>{formatCurrency(data.totalGross)} zł</strong>{' '}
                    (słownie: <em>{totalWords}</em>).
                </p>

                {renderPaymentSection(data)}

                {data.seller.isVatPayer && (
                    <ConditionalParagraph condition>
                        Sprzedający oświadcza, że jest czynnym podatnikiem podatku VAT, a sprzedaż
                        jest dokumentowana fakturą VAT, którą Sprzedający zobowiązuje się dostarczyć
                        Kupującemu nie później niż w terminie 7 dni od dnia zawarcia niniejszej umowy.
                    </ConditionalParagraph>
                )}
            </PreviewSection>

            {/* ── §3 Wydanie rzeczy i przejście ryzyka ───────────────────────── */}
            <PreviewSection title="WYDANIE RZECZY I PRZEJŚCIE RYZYKA" titleNumber={3}>
                <p>
                    Wydanie przedmiotu umowy nastąpi w dniu{' '}
                    <FieldValue
                        value={data.delivery.date ? formatDatePL(data.delivery.date) : null}
                        placeholder="__________"
                    /> r.
                    {renderDeliveryMethod(data.delivery)}
                </p>

                <ConditionalParagraph condition={data.riskTransferMoment === 'signing'}>
                    Z chwilą zawarcia niniejszej umowy na Kupującego przechodzą korzyści i ciężary
                    związane z przedmiotem umowy oraz niebezpieczeństwo jego przypadkowej utraty
                    lub uszkodzenia.
                </ConditionalParagraph>

                <ConditionalParagraph condition={data.riskTransferMoment === 'handover'}>
                    Z chwilą wydania przedmiotu umowy na Kupującego przechodzą korzyści i ciężary
                    związane z przedmiotem umowy oraz niebezpieczeństwo jego przypadkowej utraty
                    lub uszkodzenia.
                </ConditionalParagraph>

                <p style={{ marginTop: 8, fontSize: '0.9em', fontStyle: 'italic' }}>
                    (Art. 548 § 1 Kodeksu cywilnego)
                </p>
            </PreviewSection>

            {/* ── §4 Przeniesienie własności ─────────────────────────────────── */}
            <PreviewSection title="PRZENIESIENIE WŁASNOŚCI" titleNumber={4}>
                <p>
                    Sprzedający przenosi na Kupującego własność rzeczy określonych w § 1,
                    a Kupujący własność tę przyjmuje.
                </p>

                {data.reservationOfTitle && (
                    <ConditionalParagraph condition>
                        Strony zastrzegają, że przeniesienie własności przedmiotu sprzedaży
                        następuje pod warunkiem zawieszającym zapłaty ceny w całości.
                        Do czasu zapłaty ceny rzecz pozostaje własnością Sprzedającego.
                        <span style={{ display: 'block', marginTop: 4, fontSize: '0.9em', fontStyle: 'italic' }}>
                            (Art. 589 Kodeksu cywilnego)
                        </span>
                    </ConditionalParagraph>
                )}
            </PreviewSection>

            {/* ── §5 Rękojmia ────────────────────────────────────────────────── */}
            <PreviewSection title="RĘKOJMIA ZA WADY" titleNumber={5}>
                {!data.excludeWarranty ? (
                    <>
                        <p>
                            Sprzedający jest odpowiedzialny względem Kupującego za wady fizyczne
                            i prawne przedmiotu sprzedaży na zasadach określonych w Kodeksie cywilnym
                            (Art. 556-576).
                        </p>
                        <p style={{ marginTop: 8 }}>
                            Kupujący traci uprawnienia z tytułu rękojmi, jeżeli przed zawarciem umowy
                            wiedział o wadzie lub rzecz oglądał i nie zgłosił zastrzeżeń.
                        </p>
                    </>
                ) : (
                    <>
                        <p>
                            Strony wyłączają odpowiedzialność Sprzedającego z tytułu rękojmi za wady
                            fizyczne i prawne przedmiotu sprzedaży.
                        </p>
                        {data.warrantyExclusionScope && (
                            <p style={{ marginTop: 8 }}>
                                <strong>Zakres wyłączenia:</strong> {data.warrantyExclusionScope}
                            </p>
                        )}
                        <p style={{ marginTop: 8, fontSize: '0.9em', fontStyle: 'italic' }}>
                            (Art. 558 § 1 Kodeksu cywilnego)
                        </p>
                    </>
                )}
            </PreviewSection>

            {/* ── §6 Gwarancja (opcjonalnie) ─────────────────────────────────── */}
            {hasWarranty && (
                <PreviewSection title="GWARANCJA" titleNumber={6}>
                    <p>
                        Sprzedający udziela Kupującemu gwarancji na przedmiot sprzedaży na okres{' '}
                        <strong>{data.warranty?.period} {data.warranty?.periodUnit === 'years' ? 'lat' : 'miesięcy'}</strong>{' '}
                        od dnia wydania rzeczy.
                    </p>

                    {data.warranty?.scope && (
                        <p style={{ marginTop: 8 }}>
                            <strong>Zakres gwarancji:</strong> {data.warranty.scope}
                        </p>
                    )}

                    {data.warranty?.exclusions && data.warranty.exclusions.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                            <p><strong>Wyłączenia odpowiedzialności:</strong></p>
                            <ul style={{ paddingLeft: 20 }}>
                                {data.warranty.exclusions.map((exc, idx) => (
                                    <li key={idx}>{exc}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <p style={{ marginTop: 8 }}>
                        W okresie gwarancji Sprzedający zobowiązuje się do usunięcia wad fizycznych
                        rzeczy w terminie 14 dni od dnia zgłosienia. W przypadku niemożności usunięcia
                        wady, Sprzedający wymieni rzecz na wolną od wad.
                    </p>

                    <p style={{ marginTop: 8, fontSize: '0.9em', fontStyle: 'italic' }}>
                        (Art. 577-581 Kodeksu cywilnego)
                    </p>
                </PreviewSection>
            )}

            {/* ── §7 Odstąpienie od umowy ────────────────────────────────────── */}
            {data.withdrawalRight && (
                <PreviewSection title="ODSTĄPIENIE OD UMOWY" titleNumber={sn(6)}>
                    <p>
                        Stronom przysługuje prawo odstąpienia od niniejszej umowy w terminie{' '}
                        <strong>{data.withdrawalDeadline || 14} dni</strong> od dnia jej zawarcia.
                    </p>
                    {data.withdrawalCost ? (
                        <p>
                            W przypadku odstąpienia od umowy, strona odstępująca zobowiązana jest
                            do zapłaty kary umownej w wysokości {formatCurrency(data.withdrawalCost)} zł.
                        </p>
                    ) : (
                        <p>
                            Odstąpienie od umowy następuje bez ponoszenia dodatkowych kosztów.
                        </p>
                    )}
                </PreviewSection>
            )}

            {/* ── §8 Kary umowne ─────────────────────────────────────────────── */}
            {(data.penaltyForDelay || data.penaltyForWithdrawal) && (
                <PreviewSection title="KARY UMOWNE" titleNumber={sn(7)}>
                    {data.penaltyForDelay && (
                        <p>
                            W przypadku opóźnienia w wydaniu przedmiotu sprzedaży, Sprzedający
                            zapłaci Kupującemu karę umowną w wysokości{' '}
                            <strong>{formatCurrency(data.penaltyForDelay)} zł</strong> za każdy
                            dzień opóźnienia.
                        </p>
                    )}

                    {data.penaltyForWithdrawal && (
                        <p style={{ marginTop: 8 }}>
                            W przypadku odstąpienia od umowy z przyczyn leżących po stronie
                            Sprzedającego, zapłaci on Kupującemu karę umowną w wysokości{' '}
                            <strong>{formatCurrency(data.penaltyForWithdrawal)} zł</strong>.
                        </p>
                    )}

                    {data.maxPenalty && (
                        <p style={{ marginTop: 8 }}>
                            Łączna wysokość kar umownych nie może przekroczyć{' '}
                            <strong>{data.maxPenalty}%</strong> wartości przedmiotu sprzedaży.
                        </p>
                    )}

                    <p style={{ marginTop: 8, fontSize: '0.9em', fontStyle: 'italic' }}>
                        (Art. 483-484 Kodeksu cywilnego)
                    </p>
                </PreviewSection>
            )}

            {/* ── §9 Postanowienia końcowe ───────────────────────────────────── */}
            <PreviewSection title="POSTANOWIENIA KOŃCOWE" titleNumber={sn(8)}>
                <p>1. W sprawach nieuregulowanych niniejszą umową mają zastosowanie przepisy Kodeksu cywilnego oraz inne właściwe przepisy prawa polskiego.</p>
                <p>2. Wszelkie zmiany umowy wymagają formy pisemnej pod rygorem nieważności.</p>
                <p>3. Spory mogące wyniknąć z niniejszej umowy strony poddają rozstrzygnięciu sądu powszechnego właściwego dla siedziby Kupującego.</p>
                <p>4. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.</p>
            </PreviewSection>

            {/* ── Uwagi dodatkowe ────────────────────────────────────────────── */}
            {data.notes && (
                <PreviewSection title="UWAGI DODATKOWE">
                    <p style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{data.notes}</p>
                </PreviewSection>
            )}

            {/* ── Podpisy ────────────────────────────────────────────────────── */}
            <SignatureBlock
                location={data.location}
                date={data.contractDate}
                parties={[
                    {
                        role: 'Sprzedający',
                        name: data.seller.isCompany
                            ? data.seller.companyName
                            : `${data.seller.firstName || ''} ${data.seller.lastName || ''}`.trim(),
                        identity: !data.seller.isCompany ? `PESEL: ${data.seller.pesel}` : undefined
                    },
                    {
                        role: 'Kupujący',
                        name: 'Mennica Cashify Sp. z o.o.',
                        identity: `NIP: ${data.buyer.nip}`
                    },
                ]}
            />

            {/* ── Załączniki ─────────────────────────────────────────────────── */}
            {data.includeRodo && (
                <div style={{ marginTop: 32, pageBreakBefore: 'always' }}>
                    <SaleAgreementRodoAppendix sellerName={data.seller.isCompany
                        ? data.seller.companyName
                        : `${data.seller.firstName || ''} ${data.seller.lastName || ''}`.trim()
                    } />
                </div>
            )}
        </PreviewWrapper>
    )
}

// ─── RODO Appendix ────────────────────────────────────────────────────────
export function SaleAgreementRodoAppendix({ sellerName }: { sellerName?: string }) {
    return (
        <div style={{ marginTop: 40 }}>
            <h3 style={{ textAlign: 'center', marginBottom: 24 }}>
                Załącznik nr 1 do Umowy Sprzedaży<br />
                KLAUZULA INFORMACYJNA RODO
            </h3>

            <p style={{ marginBottom: 12 }}>
                Zgodnie z art. 13 ust. 1 i ust. 2 ogólnego rozporządzenia o ochronie danych
                osobowych z dnia 27 kwietnia 2016 r. (RODO), informujemy, że:
            </p>

            <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
                <li>
                    <strong>Administratorem</strong> Pani/Pana danych osobowych jest
                    MENNICA CASHIFY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ z siedzibą w Warszawie
                    (00-110), ul. Marszałkowska 107, KRS: 0000723077, NIP: 5342579968, REGON: 369692058.
                </li>
                <li>
                    Kontakt z Inspektorem Ochrony Danych jest możliwy pod adresem e-mail: iod@cashify.gold.
                </li>
                <li>
                    Pani/Pana dane osobowe przetwarzane będą w celu zawarcia i wykonania umowy sprzedaży
                    (art. 6 ust. 1 lit. b RODO), a także w celu wypełnienia obowiązków prawnych ciążących
                    na Administratorze (art. 6 ust. 1 lit. c RODO), w szczególności obowiązków podatkowych
                    i archiwalnych.
                </li>
                <li>
                    Odbiorcami Pani/Pana danych osobowych mogą być podmioty upoważnione do ich przetwarzania
                    na podstawie przepisów prawa, a także podmioty przetwarzające na zlecenie Administratora,
                    w szczególności dostawcy usług IT, kancelarie prawne, biura rachunkowe.
                </li>
                <li>
                    Pani/Pana dane osobowe będą przechowywane przez okres niezbędny do realizacji umowy,
                    a po jej zakończeniu przez okres wymagany przepisami prawa (w szczególności przepisami
                    podatkowymi i ustawy o rachunkowości).
                </li>
                <li>
                    Posiada Pani/Pan prawo dostępu do treści swoich danych oraz prawo ich sprostowania,
                    usunięcia, ograniczenia przetwarzania, prawo do przenoszenia danych oraz wniesienia
                    sprzeciwu wobec przetwarzania.
                </li>
                <li>
                    Ma Pani/Pan prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych,
                    gdy uzna Pani/Pan, iż przetwarzanie danych osobowych narusza przepisy RODO.
                </li>
                <li>
                    Podanie danych osobowych jest dobrowolne, ale niezbędne do zawarcia i realizacji
                    umowy sprzedaży. Konsekwencją niepodania danych będzie brak możliwości zawarcia umowy.
                </li>
            </ol>

            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <p>................................</p>
                    <p style={{ fontSize: 10 }}>(podpis Sprzedającego)</p>
                    <p style={{ marginTop: 8 }}>{sellerName || '___________________'}</p>
                </div>
                <div>
                    <p>................................</p>
                    <p style={{ fontSize: 10 }}>(podpis Kupującego)</p>
                    <p style={{ marginTop: 8 }}>Mennica Cashify Sp. z o.o.</p>
                </div>
            </div>
        </div>
    )
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatAddress(seller: SellerData): string {
    const parts = [
        `ul. ${seller.street || ''} ${seller.houseNumber || ''}`,
        seller.apartmentNumber && `/${seller.apartmentNumber}`,
        `, ${seller.postalCode || ''} ${seller.city || ''}`,
        seller.country !== 'Polska' && `, ${seller.country}`
    ].filter(Boolean)

    return parts.join('')
}

function renderPaymentSection(data: SaleAgreementData): JSX.Element {
    switch (data.paymentType) {
        case 'cash':
            return (
                <p style={{ marginTop: 8 }}>
                    Płatność nastąpi w całości gotówką w dniu zawarcia niniejszej umowy.
                </p>
            )

        case 'transfer':
            return (
                <div style={{ marginTop: 8 }}>
                    <p>
                        Płatność nastąpi przelewem bankowym na rachunek Sprzedającego:
                    </p>
                    <p style={{ fontFamily: 'monospace', marginLeft: 16 }}>
                        {data.bankAccount || formatIBAN(data.seller.bankAccount) || '_________________________'}
                    </p>
                    {data.paymentDeadline && (
                        <p style={{ marginTop: 4 }}>
                            w terminie do dnia <strong>{formatDatePL(data.paymentDeadline)}</strong> r.
                        </p>
                    )}
                </div>
            )

        case 'installments':
            return (
                <div style={{ marginTop: 8 }}>
                    <p>
                        Płatność nastąpi w <strong>{data.installments?.count || '___'}</strong> równych ratach
                        miesięcznych po <strong>{formatCurrency(data.installments?.monthlyAmount || 0)} zł</strong>,
                        przelewem bankowym na rachunek Sprzedającego:
                    </p>
                    <p style={{ fontFamily: 'monospace', marginLeft: 16 }}>
                        {data.bankAccount || formatIBAN(data.seller.bankAccount) || '_________________________'}
                    </p>
                    {data.installments?.firstPaymentDate && (
                        <p style={{ marginTop: 4 }}>
                            Pierwsza rata płatna do dnia {formatDatePL(data.installments.firstPaymentDate)} r.,
                            kolejne raty płatne do 10. dnia każdego następnego miesiąca.
                        </p>
                    )}
                    {data.installments?.interestRate ? (
                        <p style={{ marginTop: 4 }}>
                            Całkowita kwota do zapłaty wynosi {formatCurrency(data.installments.totalAmount || 0)} zł,
                            w tym odsetki {formatCurrency(data.installments.totalInterest || 0)} zł
                            (oprocentowanie {data.installments.interestRate}% w skali roku).
                        </p>
                    ) : (
                        <p style={{ marginTop: 4 }}>
                            Płatność ratalna nieoprocentowana.
                        </p>
                    )}
                </div>
            )

        default:
            return (
                <p style={{ marginTop: 8, color: '#999' }}>
                    Forma płatności nie została określona.
                </p>
            )
    }
}

function renderDeliveryMethod(delivery: DeliveryData): string {
    switch (delivery.method) {
        case 'personal':
            return ' poprzez odbiór osobisty przez Kupującego.'
        case 'courier':
            return ` za pośrednictwem firmy kurierskiej ${delivery.carrier || '______________'} (nr przesyłki: ${delivery.trackingNumber || '______________'}).`
        case 'post':
            return ' za pośrednictwem Poczty Polskiej.'
        case 'transport':
            return ' transportem własnym Kupującego.'
        default:
            return '.'
    }
}