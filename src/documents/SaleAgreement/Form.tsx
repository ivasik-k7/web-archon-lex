// documents/SaleAgreement/Form.tsx

import { useState, useCallback, useEffect } from 'react'
import {
    Plus, Trash, Buildings, User, Package, CurrencyDollar, Gear,
    IdentificationCard, Phone, EnvelopeSimple, Bank, Money, Hash,
    MapPin, Calendar, Notebook, Coins, Shield, Gavel,
    Truck, House, FileText, WarningCircle, CheckCircle, Info,
    ArrowRight, Building, AddressBook, IdentificationBadge,
    Clock, HandCoins, Receipt, Stamp, Signature, Copy,
    CreditCard,
    QrCode,
    CaretDown
} from '@phosphor-icons/react'

import {
    FormSection, FormField, TextInput, TextArea, InputRow,
    ToggleField, PaymentToggleGroup, ReadonlyValue,
    FieldGrid, FullWidth, Select, InfoBox, CurrencyInput,
    PeselInput, IbanInput, ContractNumberInput,
    RadioGroup
} from '../../shared/formAtoms'

import { createDocumentHook } from '../../hooks/useDocumentForm'
import {
    validatePesel, validateNIP, validateREGON, validateIBAN,
    formatIBAN, generateContractNumber, formatCurrency,
    calculateVAT, validateIdCard,
    formatDatePL
    //  calculateInstallments, validatePolishId
} from '../../shared/utils'
import type { SaleAgreementData, SaleProduct, SellerData, InstallmentData } from '../../types/saleAgreement'
import { DEFAULT_SALE_AGREEMENT } from '../../types/saleAgreement'

export const useSaleAgreementData = createDocumentHook(DEFAULT_SALE_AGREEMENT)

interface Props {
    data: SaleAgreementData
    onChange: (data: SaleAgreementData) => void
}

export function SaleAgreementForm({ data, onChange }: Props) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [showLegalInfo, setShowLegalInfo] = useState(true)

    const set = useCallback(<K extends keyof SaleAgreementData>(field: K, value: SaleAgreementData[K]) => {
        onChange({ ...data, [field]: value })
    }, [data, onChange])

    const setSeller = useCallback(<K extends keyof SellerData>(field: K, value: SellerData[K]) => {
        onChange({
            ...data,
            seller: { ...data.seller, [field]: value }
        })
    }, [data, onChange])

    // ── Product helpers ────────────────────────────────────────────────────────
    const setProduct = (id: number, field: keyof SaleProduct, value: any) => {
        onChange({
            ...data,
            products: data.products.map(p => {
                if (p.id !== id) return p
                const next = { ...p, [field]: value }

                // Recalculate value
                if (field === 'quantity' || field === 'price') {
                    const qty = parseFloat(next.quantity?.toString() || '0')
                    const price = parseFloat(next.price?.toString() || '0')
                    next.value = qty * price
                    next.vat = next.value * ((next.vatRate || 23) / 100)
                }

                return next
            }),
        })
    }

    const addProduct = () => {
        const nextId = Math.max(...data.products.map(p => p.id), 0) + 1
        set('products', [...data.products, {
            id: nextId,
            name: '',
            quantity: 1,
            unit: 'szt.',
            price: 0,
            value: 0,
            vat: 0,
            vatRate: 23,
            condition: 'new'
        }])
    }

    const removeProduct = (id: number) => {
        if (data.products.length <= 1) {
            // Reset instead of remove
            set('products', [{
                id: 1,
                name: '',
                quantity: 1,
                unit: 'szt.',
                price: 0,
                value: 0,
                vat: 0,
                vatRate: 23
            }])
            return
        }
        set('products', data.products.filter(p => p.id !== id))
    }

    // Calculate totals
    useEffect(() => {
        const totalNet = data.products.reduce((sum, p) => sum + (p.value || 0), 0)
        const totalVat = data.products.reduce((sum, p) => sum + (p.vat || 0), 0)
        const totalGross = totalNet + totalVat

        onChange({
            ...data,
            totalNet,
            totalVat,
            totalGross
        })
    }, [data.products])

    // ── Validation (Polish Civil Code Art. 535-602) ──────────────────────────
    const validateField = (field: string, value: any): string | undefined => {
        switch (field) {
            // Sprzedawca - Art. 535 KC
            case 'seller.firstName':
                return !value ? 'Imię sprzedawcy jest wymagane' : undefined
            case 'seller.lastName':
                return !value ? 'Nazwisko sprzedawcy jest wymagane' : undefined
            case 'seller.pesel':
                if (!value) return 'PESEL sprzedawcy jest wymagany'
                return validatePesel(value) ? undefined : 'Nieprawidłowy numer PESEL'
            case 'seller.nip':
                if (value && !validateNIP(value)) return 'Nieprawidłowy numer NIP'
                return undefined
            case 'seller.regon':
                if (value && !validateREGON(value)) return 'Nieprawidłowy numer REGON'
                return undefined
            case 'seller.idNumber':
                if (value && !validateIdCard(value)) return 'Nieprawidłowy numer dowodu'
                return undefined

            // Adres - wymagany do identyfikacji stron
            case 'seller.street':
                return !value ? 'Ulica jest wymagana' : undefined
            case 'seller.houseNumber':
                return !value ? 'Numer domu jest wymagany' : undefined
            case 'seller.postalCode':
                return !value ? 'Kod pocztowy jest wymagany' : undefined
            case 'seller.city':
                return !value ? 'Miejscowość jest wymagana' : undefined

            // Umowa - Art. 535 KC
            case 'contractDate':
                if (!value) return 'Data zawarcia umowy jest wymagana'
                const contractDate = new Date(value)
                const today = new Date()
                if (contractDate > today) return 'Data nie może być przyszła'
                return undefined
            case 'location':
                return !value ? 'Miejsce zawarcia umowy jest wymagane' : undefined

            // Przedmiot umowy - Art. 535 KC
            case 'products':
                if (!data.products.some(p => p.name && p.price > 0)) {
                    return 'Przedmiot umowy musi być określony'
                }
                return undefined

            // Cena - Art. 536 KC
            case 'totalGross':
                if (data.totalGross <= 0) return 'Cena musi być większa od 0'
                return undefined

            // Płatność
            case 'bankAccount':
                if (data.paymentType === 'transfer' || data.paymentType === 'installments') {
                    if (!value) return 'Numer konta jest wymagany'
                    return validateIBAN(value) ? undefined : 'Nieprawidłowy format IBAN (PL + 26 cyfr)'
                }
                return undefined

            default:
                return undefined
        }
    }

    // ── Legal references ─────────────────────────────────────────────────────
    const legalBasis = [
        { art: 'Art. 535 KC', desc: 'Przez umowę sprzedaży sprzedawca zobowiązuje się przenieść na kupującego własność rzeczy i wydać mu rzecz, a kupujący zobowiązuje się rzecz odebrać i zapłacić cenę' },
        { art: 'Art. 536 KC', desc: 'Cena może być oznaczona przez wskazanie podstaw do jej ustalenia' },
        { art: 'Art. 546 KC', desc: 'Sprzedawca obowiązany jest wydać rzecz kupującemu' },
        { art: 'Art. 547 KC', desc: 'Kupujący obowiązany jest zapłacić cenę w chwili wydania rzeczy' },
        { art: 'Art. 548 KC', desc: 'Z chwilą wydania rzeczy przechodzą na kupującego korzyści i ciężary związane z rzeczą oraz niebezpieczeństwo jej przypadkowej utraty lub uszkodzenia' },
        { art: 'Art. 556 KC', desc: 'Sprzedawca jest odpowiedzialny względem kupującego, jeżeli rzecz sprzedana ma wadę fizyczną lub prawną' },
        { art: 'Art. 558 KC', desc: 'Strony mogą odpowiedzialność z tytułu rękojmi rozszerzyć, ograniczyć lub wyłączyć' },
    ]

    return (
        <div className="space-y-7 pb-8">

            {/* ── Banner prawny ──────────────────────────────────────────────── */}
            {showLegalInfo && (
                <InfoBox
                    icon={<Gavel size={16} weight="fill" />}
                    title="Podstawa prawna - Kodeks Cywilny"
                    variant="brand"
                    dismissible
                    onDismiss={() => setShowLegalInfo(false)}
                >
                    <div className="space-y-1.5">
                        {legalBasis.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[10px]">
                                <span className="text-brand mt-0.5">•</span>
                                <span><strong>{item.art}</strong> - {item.desc}</span>
                            </div>
                        ))}
                        <button
                            onClick={() => setShowLegalInfo(true)}
                            className="text-[9px] text-brand hover:text-brand/80 transition-colors mt-1"
                        >
                            Pokaż wszystkie podstawy prawne...
                        </button>
                    </div>
                </InfoBox>
            )}

            {/* ── §1 Essentialia negotii ──────────────────────────────────────── */}
            <FormSection
                icon={<Copy size={15} weight="fill" />}
                title="Essentialia negotii - Przedmiot i cena"
                index={1}
                status={data.contractNumber && data.contractDate ? 'valid' : 'required'}
                statusMessage="Wymagane do ważności umowy (Art. 535 KC)"
            >
                <FieldGrid cols={{ sm: 1, lg: 2 }}>
                    <FullWidth>
                        <ContractNumberInput
                            label="Numer umowy"
                            prefix="UKS"
                            value={data.contractNumber}
                            onChange={(v) => set('contractNumber', v)}
                            error={errors.contractNumber}
                            required
                            hint="Unikalny numer identyfikacyjny umowy"
                        />
                    </FullWidth>

                    <InputRow
                        label="Data zawarcia"
                        type="date"
                        value={data.contractDate}
                        onChange={e => set('contractDate', e.target.value)}
                        error={errors.contractDate}
                        required
                        hint="Art. 535 KC - Dzień, w którym strony doszły do porozumienia"
                    />

                    <InputRow
                        label="Miejsce zawarcia"
                        placeholder="Warszawa"
                        value={data.location}
                        onChange={e => set('location', e.target.value)}
                        error={errors.location}
                        required
                        hint="Miejscowość podpisania umowy - określa właściwość sądu"
                    />
                </FieldGrid>
            </FormSection>

            {/* ── §2 Sprzedawca - pełne dane ──────────────────────────────────── */}
            <FormSection
                icon={<User size={15} weight="fill" />}
                title="Sprzedawca - strona przenosząca własność"
                index={2}
                status={data.seller.firstName && data.seller.lastName && data.seller.pesel ? 'valid' : 'required'}
            >
                <div className="space-y-4">
                    {/* Typ podmiotu */}
                    <RadioGroup
                        label="Rodzaj sprzedawcy"
                        value={data.seller.isCompany ? 'company' : 'individual'}
                        onChange={(v) => setSeller('isCompany', v === 'company')}
                        options={[
                            { value: 'individual', label: 'Osoba fizyczna' },
                            { value: 'company', label: 'Firma / osoba prawna' }
                        ]}
                    />

                    {!data.seller.isCompany ? (
                        /* Osoba fizyczna */
                        <>
                            <FieldGrid cols={2}>
                                <InputRow
                                    label="Imię"
                                    placeholder="Jan"
                                    required
                                    value={data.seller.firstName}
                                    onChange={e => setSeller('firstName', e.target.value)}
                                    error={errors['seller.firstName']}
                                />
                                <InputRow
                                    label="Nazwisko"
                                    placeholder="Kowalski"
                                    required
                                    value={data.seller.lastName}
                                    onChange={e => setSeller('lastName', e.target.value)}
                                    error={errors['seller.lastName']}
                                />
                            </FieldGrid>

                            <FieldGrid cols={2}>
                                <InputRow
                                    label="PESEL"
                                    required
                                    placeholder="ABC123456"
                                    value={data.seller.pesel}
                                    onChange={(e) => setSeller('pesel', e.target.value)}
                                    error={errors['seller.pesel']}
                                    hint="11 cyfr - niezbędny do identyfikacji"
                                />
                                {/* <PeselInput
                                    label="PESEL"
                                    required
                                    value={data.seller.pesel}
                                    onChange={(v) => setSeller('pesel', v)}
                                    error={errors['seller.pesel']}
                                    hint="11 cyfr - niezbędny do identyfikacji"
                                /> */}
                                <InputRow
                                    label="Numer dowodu osobistego"
                                    placeholder="ABC123456"
                                    value={data.seller.idNumber}
                                    onChange={e => setSeller('idNumber', e.target.value)}
                                    error={errors['seller.idNumber']}
                                    hint="Seria i numer, np. ABC123456"
                                />
                            </FieldGrid>
                        </>
                    ) : (
                        /* Firma */
                        <>
                            <FieldGrid cols={2}>
                                <FullWidth>
                                    <InputRow
                                        label="Nazwa firmy"
                                        placeholder="Przedsiębiorstwo Handlowe Sp. z o.o."
                                        required
                                        value={data.seller.companyName}
                                        onChange={e => setSeller('companyName', e.target.value)}
                                    />
                                </FullWidth>
                                <InputRow
                                    label="NIP"
                                    placeholder="1234567890"
                                    value={data.seller.nip}
                                    onChange={e => setSeller('nip', e.target.value)}
                                    error={errors['seller.nip']}
                                />
                                <InputRow
                                    label="REGON"
                                    placeholder="123456789"
                                    value={data.seller.regon}
                                    onChange={e => setSeller('regon', e.target.value)}
                                    error={errors['seller.regon']}
                                />
                            </FieldGrid>

                            {data.seller.krs && (
                                <InputRow
                                    label="KRS"
                                    placeholder="0000123456"
                                    value={data.seller.krs}
                                    onChange={e => setSeller('krs', e.target.value)}
                                />
                            )}
                        </>
                    )}

                    {/* Adres zamieszkania/siedziby */}
                    <div className="pt-2">
                        <h4 className="text-xs font-medium text-ink-med mb-3 flex items-center gap-1.5">
                            <MapPin size={14} /> Adres {data.seller.isCompany ? 'siedziby' : 'zamieszkania'}
                        </h4>
                        <FieldGrid cols={4}>
                            <FullWidth>
                                <InputRow
                                    label="Ulica"
                                    placeholder="ul. Przykładowa"
                                    required
                                    value={data.seller.street}
                                    onChange={e => setSeller('street', e.target.value)}
                                />
                            </FullWidth>
                            <InputRow
                                label="Nr domu"
                                placeholder="1"
                                required
                                value={data.seller.houseNumber}
                                onChange={e => setSeller('houseNumber', e.target.value)}
                            />
                            <InputRow
                                label="Nr lokalu"
                                placeholder="2A"
                                value={data.seller.apartmentNumber}
                                onChange={e => setSeller('apartmentNumber', e.target.value)}
                            />
                            <InputRow
                                label="Kod pocztowy"
                                placeholder="00-001"
                                required
                                value={data.seller.postalCode}
                                onChange={e => setSeller('postalCode', e.target.value)}
                                mask={(v) => {
                                    const cleaned = v.replace(/\D/g, '')
                                    if (cleaned.length > 2) {
                                        return cleaned.slice(0, 2) + '-' + cleaned.slice(2, 5)
                                    }
                                    return cleaned
                                }}
                            />
                            <FullWidth>
                                <InputRow
                                    label="Miejscowość"
                                    placeholder="Warszawa"
                                    required
                                    value={data.seller.city}
                                    onChange={e => setSeller('city', e.target.value)}
                                />
                            </FullWidth>
                        </FieldGrid>
                    </div>

                    {/* Dane kontaktowe */}
                    <div className="pt-2">
                        <h4 className="text-xs font-medium text-ink-med mb-3 flex items-center gap-1.5">
                            <Phone size={14} /> Dane kontaktowe (opcjonalne)
                        </h4>
                        <FieldGrid cols={2}>
                            <InputRow
                                label="Telefon"
                                placeholder="+48 600 000 000"
                                value={data.seller.phone}
                                onChange={e => setSeller('phone', e.target.value)}
                                mask={(v) => {
                                    const cleaned = v.replace(/\D/g, '')
                                    if (cleaned.startsWith('48')) {
                                        return '+48 ' + cleaned.slice(2, 11).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
                                    }
                                    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
                                }}
                            />
                            <InputRow
                                label="E-mail"
                                type="email"
                                placeholder="kontakt@example.com"
                                value={data.seller.email}
                                onChange={e => setSeller('email', e.target.value)}
                            />
                        </FieldGrid>
                    </div>

                    {/* Rachunek bankowy */}
                    <div className="pt-2">
                        <h4 className="text-xs font-medium text-ink-med mb-3 flex items-center gap-1.5">
                            <Bank size={14} /> Rachunek bankowy
                        </h4>
                        <FieldGrid cols={2}>
                            <IbanInput
                                label="Numer rachunku"
                                value={data.seller.bankAccount}
                                onChange={(v) => setSeller('bankAccount', v)}
                                error={errors['seller.bankAccount']}
                                hint="Numer na który Kupujący dokona płatności"
                            />
                            <InputRow
                                label="Nazwa banku"
                                placeholder="mBank S.A."
                                value={data.seller.bankName}
                                onChange={e => setSeller('bankName', e.target.value)}
                            />
                        </FieldGrid>
                    </div>

                    {/* Status VAT */}
                    <div className="pt-2">
                        <ToggleField
                            label="Czynny podatnik VAT"
                            description="Sprzedawca jest zarejestrowanym czynnym podatnikiem podatku VAT"
                            checked={data.seller.isVatPayer || false}
                            onChange={v => setSeller('isVatPayer', v)}
                        />
                    </div>
                </div>
            </FormSection>

            {/* ── §3 Kupujący (Mennica Cashify) ────────────────────────────────── */}
            <FormSection
                icon={<Buildings size={15} weight="fill" />}
                title="Kupujący - Mennica Cashify Sp. z o.o."
                index={3}
                status="valid"
            >
                <InfoBox variant="neutral" icon={<Building size={14} />} title="Dane stałe">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                        <div>
                            <span className="text-ink-low">Pełna nazwa:</span>
                            <span className="ml-2 text-ink-high font-medium">{data.buyer.companyName}</span>
                        </div>
                        <div>
                            <span className="text-ink-low">KRS:</span>
                            <span className="ml-2 font-mono">{data.buyer.krs}</span>
                        </div>
                        <div>
                            <span className="text-ink-low">NIP:</span>
                            <span className="ml-2 font-mono">{data.buyer.nip}</span>
                        </div>
                        <div>
                            <span className="text-ink-low">REGON:</span>
                            <span className="ml-2 font-mono">{data.buyer.regon}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-ink-low">Adres:</span>
                            <span className="ml-2">
                                ul. {data.buyer.street} {data.buyer.houseNumber}
                                {data.buyer.apartmentNumber && `/${data.buyer.apartmentNumber}`}
                                , {data.buyer.postalCode} {data.buyer.city}
                            </span>
                        </div>
                        <div>
                            <span className="text-ink-low">Bank:</span>
                            <span className="ml-2">{data.buyer.bankName}</span>
                        </div>
                        <div>
                            <span className="text-ink-low">SWIFT:</span>
                            <span className="ml-2 font-mono">{data.buyer.swift}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-ink-low">Rachunek:</span>
                            <span className="ml-2 font-mono">{data.buyer.bankAccount}</span>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] bg-green-500/10 p-2 rounded-lg">
                        <CheckCircle size={12} className="text-green-500" weight="fill" />
                        <span className="text-ink-med">Zweryfikowany podmiot gospodarczy, czynny podatnik VAT</span>
                    </div>
                </InfoBox>
            </FormSection>

            {/* ── §4 Przedmiot umowy ──────────────────────────────────────────── */}
            <FormSection
                icon={<Package size={15} weight="fill" />}
                title="Przedmiot sprzedaży"
                index={4}
                status={data.products.some(p => p.name && p.price > 0) ? 'valid' : 'required'}
                statusMessage="Art. 535 KC - Określenie przedmiotu jest essentialium negotii"
            >
                <div className="space-y-4">
                    <div className="bg-brand/5 p-3 rounded-lg border border-brand/20 text-[10px] flex items-start gap-2">
                        <Info size={12} className="text-brand shrink-0 mt-0.5" />
                        <div>
                            <strong className="text-brand">Art. 535 Kodeksu Cywilnego</strong>
                            <p className="text-ink-med mt-0.5">
                                Przez umowę sprzedaży sprzedawca zobowiązuje się przenieść na kupującego własność rzeczy
                                i wydać mu rzecz, a kupujący zobowiązuje się rzecz odebrać i zapłacić cenę.
                                Bez określenia przedmiotu umowa jest nieważna.
                            </p>
                        </div>
                    </div>

                    {data.products.map((product, idx) => (
                        <ProductRow
                            key={product.id}
                            product={product}
                            index={idx}
                            canRemove={data.products.length > 1}
                            onChange={setProduct}
                            onRemove={removeProduct}
                            errors={{
                                name: errors[`product_${product.id}_name`],
                                price: errors[`product_${product.id}_price`],
                                quantity: errors[`product_${product.id}_quantity`]
                            }}
                        />
                    ))}

                    <button
                        type="button"
                        onClick={addProduct}
                        className="w-full py-2.5 rounded-lg border border-dashed border-border-med 
                            text-ink-low text-sm hover:border-brand/40 hover:text-brand 
                            transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <Plus size={14} /> Dodaj kolejny przedmiot
                    </button>

                    {/* Podsumowanie wartości */}
                    <div className="rounded-lg border border-brand/30 bg-brand/6 overflow-hidden mt-4">
                        <div className="px-4 py-2.5 bg-brand/10 border-b border-brand/20 flex items-center gap-2">
                            <Receipt size={14} className="text-brand" />
                            <span className="text-xs font-semibold text-brand uppercase tracking-wider">
                                Łączna wartość przedmiotu sprzedaży
                            </span>
                        </div>
                        <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-ink-low">Wartość netto:</span>
                                <span className="font-mono font-medium">{formatCurrency(data.totalNet)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-ink-low">VAT (23%):</span>
                                <span className="font-mono">{formatCurrency(data.totalVat)}</span>
                            </div>
                            <div className="flex items-center justify-between text-base pt-2 mt-1 border-t border-brand/20">
                                <span className="font-semibold text-ink-high">Wartość brutto - CENA:</span>
                                <span className="font-bold text-brand font-mono text-lg">
                                    {formatCurrency(data.totalGross)}
                                </span>
                            </div>
                            <p className="text-[9px] text-ink-low mt-2">
                                * Cena zawiera podatek VAT zgodnie z ustawą z dnia 11 marca 2004 r. o podatku od towarów i usług
                            </p>
                        </div>
                    </div>
                </div>
            </FormSection>

            {/* ── §5 Płatność ─────────────────────────────────────────────────── */}
            <FormSection
                icon={<CurrencyDollar size={15} weight="fill" />}
                title="Cena i warunki płatności"
                index={5}
                status={data.paymentType ? 'valid' : 'required'}
            >
                <div className="space-y-4">
                    <PaymentToggleGroup
                        columns={4}
                        options={[
                            {
                                id: 'cash',
                                label: 'Gotówka',
                                icon: <Money size={16} />,
                                description: 'przy odbiorze'
                            },
                            {
                                id: 'transfer',
                                label: 'Przelew',
                                icon: <Bank size={16} />,
                                description: 'na rachunek bankowy'
                            },
                            {
                                id: 'installments',
                                label: 'Raty',
                                icon: <Coins size={16} />,
                                badge: 'odsetki',
                                description: 'płatność rozłożona'
                            },
                            {
                                id: 'card',
                                label: 'Karta',
                                icon: <CreditCard size={16} />,
                                description: 'płatność terminalem'
                            },
                            {
                                id: 'blik',
                                label: 'BLIK',
                                icon: <QrCode size={16} />,
                                badge: 'nowość',
                                description: 'płatność mobilna'
                            }
                        ]}
                        value={data.paymentType}
                        onChange={v => set('paymentType', v as SaleAgreementData['paymentType'])}
                    />

                    {data.paymentType === 'transfer' && (
                        <div className="space-y-3 p-4 bg-bg-tertiary/20 rounded-lg border border-border-subtle">
                            <IbanInput
                                label="Numer rachunku bankowego Sprzedawcy"
                                required
                                value={data.bankAccount || data.seller.bankAccount}
                                onChange={(v) => set('bankAccount', v)}
                                error={errors.bankAccount}
                                hint="Rachunek, na który Kupujący dokona przelewu"
                            />
                            <FieldGrid cols={2}>
                                <InputRow
                                    label="Termin płatności"
                                    type="date"
                                    value={data.paymentDeadline}
                                    onChange={e => set('paymentDeadline', e.target.value)}
                                    min={data.contractDate}
                                    hint="Dzień, w którym płatność powinna wpłynąć na konto"
                                />
                                <InputRow
                                    label="Data płatności (jeśli inna)"
                                    type="date"
                                    value={data.paymentDate}
                                    onChange={e => set('paymentDate', e.target.value)}
                                />
                            </FieldGrid>
                            <div className="text-[10px] text-ink-low flex items-start gap-1.5 bg-brand/5 p-2 rounded-lg">
                                <Gavel size={12} className="shrink-0 mt-0.5 text-brand" />
                                <span>
                                    <strong>Art. 547 KC</strong> - Kupujący obowiązany jest zapłacić cenę w chwili wydania rzeczy,
                                    chyba że umowa stanowi inaczej.
                                </span>
                            </div>
                        </div>
                    )}

                    {data.paymentType === 'installments' && (
                        <InstallmentSection
                            data={data}
                            onChange={onChange}
                            errors={errors}
                        />
                    )}

                    {data.paymentType === 'cash' && (
                        <div className="p-4 bg-bg-tertiary/20 rounded-lg border border-border-subtle">
                            <div className="flex items-center gap-2 mb-2">
                                <Money size={14} className="text-brand" />
                                <span className="text-xs font-medium">Płatność gotówką</span>
                            </div>
                            <p className="text-xs text-ink-med">
                                Płatność realizowana jest jednorazowo, w całości gotówką, w dniu podpisania niniejszej umowy.
                            </p>
                            <div className="mt-2 text-[10px] text-ink-low flex items-start gap-1.5 bg-yellow-500/10 p-2 rounded-lg">
                                <WarningCircle size={12} className="text-yellow-500" />
                                <span>
                                    <strong>Uwaga:</strong> Dla transakcji powyżej 15.000 zł wymagana jest płatność bezgotówkowa
                                    (ustawa z dnia 1 marca 2018 r. o przeciwdziałaniu praniu pieniędzy).
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </FormSection>

            {/* ── §6 Wydanie rzeczy i przejście ryzyka ────────────────────────── */}
            <FormSection
                icon={<Truck size={15} weight="fill" />}
                title="Wydanie rzeczy i przejście ryzyka"
                index={6}
            >
                <div className="space-y-4">
                    <FieldGrid cols={2}>
                        <Select
                            label="Sposób wydania"
                            options={[
                                { value: 'personal', label: 'Osobiście - odbiór własny' },
                                { value: 'courier', label: 'Kurier' },
                                { value: 'post', label: 'Poczta' },
                                { value: 'transport', label: 'Transport własny kupującego' }
                            ]}
                            value={data.delivery.method}
                            onChange={e => set('delivery', { ...data.delivery, method: e.target.value as any })}
                        />
                        <InputRow
                            label="Data wydania"
                            type="date"
                            value={data.delivery.date}
                            onChange={e => set('delivery', { ...data.delivery, date: e.target.value })}
                        />
                    </FieldGrid>

                    <FieldGrid cols={2}>
                        <CurrencyInput
                            label="Koszt dostawy"
                            value={data.delivery.cost}
                            onChange={(v) => set('delivery', { ...data.delivery, cost: v })}
                            adornmentEnd={<span className="text-ink-low">zł</span>}
                        />
                        <Select
                            label="Koszt pokrywa"
                            options={[
                                { value: 'seller', label: 'Sprzedający' },
                                { value: 'buyer', label: 'Kupujący' }
                            ]}
                            value={data.delivery.costPaidBy}
                            onChange={e => set('delivery', { ...data.delivery, costPaidBy: e.target.value as any })}
                        />
                    </FieldGrid>

                    {data.delivery.method === 'courier' && (
                        <FieldGrid cols={2}>
                            <InputRow
                                label="Firma kurierska"
                                placeholder="DHL, UPS, InPost..."
                                value={data.delivery.carrier}
                                onChange={e => set('delivery', { ...data.delivery, carrier: e.target.value })}
                            />
                            <InputRow
                                label="Numer przesyłki"
                                placeholder="0000000000000"
                                value={data.delivery.trackingNumber}
                                onChange={e => set('delivery', { ...data.delivery, trackingNumber: e.target.value })}
                            />
                        </FieldGrid>
                    )}

                    <div className="pt-2">
                        <h4 className="text-xs font-medium text-ink-med mb-3 flex items-center gap-1.5">
                            <Shield size={14} /> Przejście ryzyka (Art. 548 KC)
                        </h4>
                        <RadioGroup
                            value={data.riskTransferMoment}
                            onChange={(v) => set('riskTransferMoment', v as any)}
                            options={[
                                { value: 'signing', label: 'Z chwilą zawarcia umowy' },
                                { value: 'handover', label: 'Z chwilą wydania rzeczy' },
                                { value: 'delivery', label: 'Z chwilą dostarczenia' }
                            ]}
                        />
                        <p className="text-[10px] text-ink-low mt-2 flex items-start gap-1.5">
                            <Info size={10} className="shrink-0 mt-0.5" />
                            <span>
                                <strong>Art. 548 KC</strong> - Z chwilą wydania rzeczy przechodzą na kupującego korzyści i ciężary
                                związane z rzeczą oraz niebezpieczeństwo jej przypadkowej utraty lub uszkodzenia.
                            </span>
                        </p>
                    </div>
                </div>
            </FormSection>

            {/* ── §7 Przeniesienie własności ──────────────────────────────────── */}
            <FormSection
                icon={<Stamp size={15} weight="fill" />}
                title="Przeniesienie własności"
                index={7}
            >
                <div className="space-y-4">
                    <RadioGroup
                        value={data.ownershipTransferMoment}
                        onChange={(v) => set('ownershipTransferMoment', v as any)}
                        options={[
                            { value: 'signing', label: 'Z chwilą zawarcia umowy' },
                            { value: 'payment', label: 'Z chwilą zapłaty ceny' },
                            { value: 'handover', label: 'Z chwilą wydania rzeczy' }
                        ]}
                    />

                    <ToggleField
                        label="Zastrzeżenie prawa własności"
                        description="Sprzedający zachowuje własność rzeczy do czasu zapłaty ceny"
                        checked={data.reservationOfTitle || false}
                        onChange={v => set('reservationOfTitle', v)}
                    >
                        <div className="p-3 bg-bg-tertiary/20 rounded-lg">
                            <p className="text-[10px] text-ink-low">
                                <strong>Art. 589 KC</strong> - Jeżeli sprzedawca zastrzegł własność rzeczy sprzedanej
                                aż do zapłaty ceny, poczytuje się w razie wątpliwości, że przeniesienie własności
                                nastąpiło pod warunkiem zawieszającym.
                            </p>
                        </div>
                    </ToggleField>
                </div>
            </FormSection>

            {/* ── §8 Rękojmia i gwarancja ─────────────────────────────────────── */}
            <FormSection
                icon={<Shield size={15} weight="fill" />}
                title="Rękojmia i gwarancja"
                index={8}
            >
                <div className="space-y-4">
                    {/* Rękojmia - Art. 556 KC */}
                    <div className="p-3 bg-brand/5 rounded-lg border border-brand/20">
                        <div className="flex items-start gap-2">
                            <Gavel size={14} className="text-brand shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs font-semibold text-brand">Odpowiedzialność z tytułu rękojmi</span>
                                <p className="text-[10px] text-ink-med mt-1">
                                    Na podstawie Art. 556 Kodeksu Cywilnego Sprzedawca jest odpowiedzialny względem Kupującego,
                                    jeżeli rzecz sprzedana ma wadę fizyczną lub prawną. Odpowiedzialność ta wynika z ustawy i nie
                                    wymaga osobnego oświadczenia.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Wyłączenie rękojmi - Art. 558 KC */}
                    <ToggleField
                        label="Wyłączenie rękojmi"
                        description="Strony mogą ograniczyć lub wyłączyć odpowiedzialność z tytułu rękojmi (Art. 558 KC)"
                        checked={data.excludeWarranty || false}
                        onChange={v => set('excludeWarranty', v)}
                    >
                        <div className="p-3 bg-bg-tertiary/20 rounded-lg space-y-2">
                            <p className="text-[10px] text-ink-low">
                                <strong>Art. 558 KC</strong> - Strony mogą odpowiedzialność z tytułu rękojmi rozszerzyć,
                                ograniczyć lub wyłączyć. Jeżeli kupującym jest konsument, ograniczenie lub wyłączenie
                                odpowiedzialności jest dopuszczalne tylko w przypadkach określonych w przepisach szczególnych.
                            </p>
                            <FormField label="Zakres wyłączenia rękojmi">
                                <TextArea
                                    rows={2}
                                    placeholder="Np. Strony wyłączają odpowiedzialność za wady fizyczne ujawnione po upływie 6 miesięcy od wydania rzeczy..."
                                    value={data.warrantyExclusionScope || ''}
                                    onChange={e => set('warrantyExclusionScope', e.target.value)}
                                />
                            </FormField>
                            <div className="flex items-start gap-1.5 text-[9px] text-yellow-500 bg-yellow-500/10 p-2 rounded-lg">
                                <WarningCircle size={10} className="shrink-0 mt-0.5" />
                                <span>
                                    <strong>Uwaga:</strong> Wyłączenie rękojmi nie dotyczy wad, które Sprzedawca znał i nie
                                    poinformował o nich Kupującego.
                                </span>
                            </div>
                        </div>
                    </ToggleField>

                    {/* Gwarancja - Art. 577 KC */}
                    <ToggleField
                        label="Gwarancja jakości"
                        description="Dodatkowa, dobrowolna gwarancja na przedmiot sprzedaży"
                        checked={data.includeWarranty || false}
                        onChange={v => set('includeWarranty', v)}
                    >
                        <WarrantySection
                            data={data}
                            onChange={onChange}
                        />
                    </ToggleField>
                </div>
            </FormSection>

            {/* ── §9 Odstąpienie od umowy i kary umowne ─────────────────────────*/}
            <FormSection
                icon={<HandCoins size={15} weight="fill" />}
                title="Odstąpienie od umowy i kary umowne"
                index={9}
            >
                <div className="space-y-4">
                    <ToggleField
                        label="Prawo odstąpienia od umowy"
                        description="Strony mogą określić warunki odstąpienia od umowy"
                        checked={data.withdrawalRight || false}
                        onChange={v => set('withdrawalRight', v)}
                    >
                        <FieldGrid cols={2}>
                            <InputRow
                                label="Termin odstąpienia"
                                placeholder="14"
                                value={data.withdrawalDeadline}
                                onChange={e => set('withdrawalDeadline', parseInt(e.target.value))}
                                type="number"
                                min="1"
                                adornmentEnd={<span className="text-ink-low text-[10px]">dni</span>}
                            />
                            <CurrencyInput
                                label="Koszt odstąpienia"
                                value={data.withdrawalCost || 0}
                                onChange={(v) => set('withdrawalCost', v)}
                                adornmentEnd={<span className="text-ink-low">zł</span>}
                                hint="Opłata manipulacyjna"
                            />
                        </FieldGrid>
                    </ToggleField>

                    <ToggleField
                        label="Kary umowne"
                        description="Określenie kar za opóźnienie lub niewykonanie umowy"
                        checked={!!data.penaltyForDelay || !!data.penaltyForWithdrawal}
                        onChange={v => {
                            if (!v) {
                                set('penaltyForDelay', undefined)
                                set('penaltyForWithdrawal', undefined)
                                set('maxPenalty', undefined)
                            }
                        }}
                    >
                        <FieldGrid cols={2}>
                            <CurrencyInput
                                label="Kara za opóźnienie"
                                value={data.penaltyForDelay || 0}
                                onChange={(v) => set('penaltyForDelay', v)}
                                adornmentEnd={<span className="text-ink-low text-[10px]">za dzień</span>}
                            />
                            <CurrencyInput
                                label="Kara za odstąpienie"
                                value={data.penaltyForWithdrawal || 0}
                                onChange={(v) => set('penaltyForWithdrawal', v)}
                                adornmentEnd={<span className="text-ink-low">zł</span>}
                            />
                            <FullWidth>
                                <InputRow
                                    label="Maksymalna wysokość kar"
                                    placeholder="10"
                                    value={data.maxPenalty || ''}
                                    onChange={e => set('maxPenalty', parseFloat(e.target.value))}
                                    adornmentEnd={<span className="text-ink-low">% wartości</span>}
                                    hint="Art. 484 KC - Kara umowna nie może być rażąco wygórowana"
                                />
                            </FullWidth>
                        </FieldGrid>
                    </ToggleField>
                </div>
            </FormSection>

            {/* ── §10 Klauzule dodatkowe ────────────────────────────────────────*/}
            <FormSection
                icon={<FileText size={15} weight="fill" />}
                title="Klauzule dodatkowe"
                index={10}
            >
                <div className="space-y-3">
                    <ToggleField
                        label="Klauzula RODO"
                        description="Informacja o przetwarzaniu danych osobowych (art. 13 RODO)"
                        checked={data.includeRodo}
                        onChange={v => set('includeRodo', v)}
                    />

                    <ToggleField
                        label="Klauzula poufności"
                        description="Zobowiązanie do zachowania poufności warunków umowy"
                        checked={data.includeConfidentiality || false}
                        onChange={v => set('includeConfidentiality', v)}
                    />

                    <ToggleField
                        label="Zapis na sąd polubowny"
                        description="Rozstrzyganie sporów przez sąd arbitrażowy"
                        checked={data.includeArbitration || false}
                        onChange={v => set('includeArbitration', v)}
                    >
                        <InputRow
                            label="Nazwa sądu polubownego"
                            placeholder="Sąd Arbitrażowy przy KIG w Warszawie"
                            value={data.arbitrationCourt || ''}
                            onChange={e => set('arbitrationCourt', e.target.value)}
                        />
                    </ToggleField>
                </div>
            </FormSection>

            {/* ── §11 Postanowienia końcowe ─────────────────────────────────────*/}
            <FormSection
                icon={<Stamp size={15} weight="fill" />}
                title="Postanowienia końcowe"
                index={11}
            >
                <div className="space-y-4">
                    <FieldGrid cols={2}>
                        <Select
                            label="Sąd właściwy"
                            options={[
                                { value: 'Warszawa', label: 'Sąd w Warszawie' },
                                { value: data.location, label: `Sąd w ${data.location || 'miejscu zawarcia umowy'}` },
                                { value: 'other', label: 'Inny' }
                            ]}
                            value={data.courtVenue || 'Warszawa'}
                            onChange={e => set('courtVenue', e.target.value)}
                        />
                        <Select
                            label="Język umowy"
                            options={[
                                { value: 'PL', label: 'Polski' }
                            ]}
                            value={data.language}
                            onChange={e => set('language', e.target.value as 'PL')}
                            disabled
                        />
                    </FieldGrid>

                    <div className="text-[10px] text-ink-low bg-bg-tertiary/30 p-3 rounded-lg">
                        <p className="flex items-center gap-1.5">
                            <CheckCircle size={10} className="text-green-500" weight="fill" />
                            <strong>Prawo właściwe:</strong> Rzeczpospolita Polska, Kodeks Cywilny
                        </p>
                        <p className="flex items-center gap-1.5 mt-1">
                            <FileText size={10} />
                            <strong>Egzemplarze:</strong> Umowę sporządzono w dwóch jednobrzmiących egzemplarzach,
                            po jednym dla każdej ze stron.
                        </p>
                    </div>

                    <FormField label={<><Notebook size={12} className="inline mr-1" />Uwagi dodatkowe i postanowienia szczególne</>}>
                        <TextArea
                            rows={3}
                            placeholder="Dodatkowe ustalenia stron, które nie zostały uregulowane powyżej..."
                            value={data.notes || ''}
                            onChange={e => set('notes', e.target.value)}
                        />
                    </FormField>
                </div>
            </FormSection>

            {/* ── Podsumowanie zgodności z KC ───────────────────────────────────*/}
            <div className="mt-8 p-4 rounded-lg border border-brand/30 bg-gradient-to-br from-brand/5 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                    {/* <Scale size={14} className="text-brand" /> */}
                    <span className="text-xs font-semibold text-brand uppercase tracking-wider">
                        Zgodność z Kodeksem Cywilnym
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div className="flex items-center gap-1.5">
                        {data.contractDate && data.location ? (
                            <CheckCircle size={10} className="text-green-500" weight="fill" />
                        ) : (
                            <WarningCircle size={10} className="text-yellow-500" />
                        )}
                        <span className="text-ink-med">Art. 535 KC - Określenie stron</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {data.products.some(p => p.name && p.price > 0) ? (
                            <CheckCircle size={10} className="text-green-500" weight="fill" />
                        ) : (
                            <WarningCircle size={10} className="text-yellow-500" />
                        )}
                        <span className="text-ink-med">Art. 535 KC - Przedmiot sprzedaży</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {data.totalGross > 0 ? (
                            <CheckCircle size={10} className="text-green-500" weight="fill" />
                        ) : (
                            <WarningCircle size={10} className="text-yellow-500" />
                        )}
                        <span className="text-ink-med">Art. 536 KC - Cena</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {data.delivery.method && data.ownershipTransferMoment ? (
                            <CheckCircle size={10} className="text-green-500" weight="fill" />
                        ) : (
                            <WarningCircle size={10} className="text-yellow-500" />
                        )}
                        <span className="text-ink-med">Art. 546-548 KC - Wydanie i ryzyko</span>
                    </div>
                </div>

                <p className="text-[9px] text-ink-low mt-3 pt-2 border-t border-brand/20">
                    Umowa zawiera wszystkie elementy przedmiotowo istotne (essentialia negotii) wymagane dla ważności
                    umowy sprzedaży pod rygorem nieważności (Art. 535 KC). Przed podpisaniem zalecamy konsultację z radcą prawnym.
                </p>
            </div>
        </div>
    )
}

// ─── Komponent produktu ─────────────────────────────────────────────────────
interface ProductRowProps {
    product: SaleProduct
    index: number
    canRemove: boolean
    onChange: (id: number, field: keyof SaleProduct, value: any) => void
    onRemove: (id: number) => void
    errors?: {
        name?: string
        price?: string
        quantity?: string
    }
}

function ProductRow({ product, index, canRemove, onChange, onRemove, errors }: ProductRowProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className={`
            rounded-lg border transition-all duration-200
            ${errors?.name || errors?.price || errors?.quantity
                ? 'border-error/40 bg-error/5'
                : product.name && product.price > 0
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-border-subtle bg-white/[0.02]'
            }
        `}>
            <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded-md hover:bg-black/10 transition-colors"
                    >
                        <CaretDown
                            size={12}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <span className="text-xs font-semibold text-brand">
                        Przedmiot #{index + 1}
                    </span>
                    {!product.name && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-error/10 text-error/90 border border-error/20">
                            Wymagany
                        </span>
                    )}
                    {product.name && product.price > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                            Określony
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-medium">
                        {formatCurrency(product.value)}
                    </span>

                    {canRemove && (
                        <button
                            type="button"
                            onClick={() => onRemove(product.id)}
                            className="p-1 rounded-md text-ink-lower hover:text-error hover:bg-error/10 transition-all"
                            title="Usuń przedmiot"
                        >
                            <Trash size={13} />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="p-3 pt-0 border-t border-border-subtle/60">
                    <div className="space-y-3">
                        <FormField
                            label="Nazwa / opis przedmiotu"
                            error={errors?.name}
                            required
                        >
                            <TextArea
                                rows={2}
                                placeholder="Szczegółowy opis produktu lub usługi będącej przedmiotem sprzedaży..."
                                value={product.name}
                                onChange={e => onChange(product.id, 'name', e.target.value)}
                            />
                        </FormField>

                        <FieldGrid cols={4}>
                            <InputRow
                                label="Ilość"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="1.00"
                                value={product.quantity}
                                onChange={e => onChange(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                error={errors?.quantity}
                                required
                            />

                            <Select
                                label="Jednostka"
                                options={[
                                    { value: 'szt.', label: 'sztuki' },
                                    { value: 'kg', label: 'kilogramy' },
                                    { value: 'g', label: 'gramy' },
                                    { value: 'l', label: 'litry' },
                                    { value: 'ml', label: 'mililitry' },
                                    { value: 'm', label: 'metry' },
                                    { value: 'm²', label: 'metry kw.' },
                                    { value: 'm³', label: 'metry sześc.' },
                                    { value: 'opak.', label: 'opakowania' },
                                    { value: 'kpl.', label: 'komplety' },
                                    { value: 'usługa', label: 'usługa' },
                                ]}
                                value={product.unit || 'szt.'}
                                onChange={e => onChange(product.id, 'unit', e.target.value)}
                            />

                            <CurrencyInput
                                label="Cena jednostkowa"
                                value={product.price}
                                onChange={(v) => onChange(product.id, 'price', v)}
                                error={errors?.price}
                                required
                            />

                            <Select
                                label="Stawka VAT"
                                options={[
                                    { value: '23', label: '23%' },
                                    { value: '8', label: '8%' },
                                    { value: '5', label: '5%' },
                                    { value: '0', label: '0%' },
                                    { value: 'zw', label: 'zw.' },
                                ]}
                                value={product.vatRate?.toString() || '23'}
                                onChange={e => onChange(product.id, 'vatRate', parseInt(e.target.value) as any)}
                            />
                        </FieldGrid>

                        <div className="pt-2 grid grid-cols-2 gap-3">
                            <InputRow
                                label="Numer seryjny (jeśli dotyczy)"
                                placeholder="SN-12345-2025"
                                value={product.serialNumber || ''}
                                onChange={e => onChange(product.id, 'serialNumber', e.target.value)}
                            />
                            <Select
                                label="Stan przedmiotu"
                                options={[
                                    { value: 'new', label: 'Nowy' },
                                    { value: 'used', label: 'Używany' },
                                    { value: 'damaged', label: 'Uszkodzony' },
                                    { value: 'after_repair', label: 'Po naprawie' }
                                ]}
                                value={product.condition || 'new'}
                                onChange={e => onChange(product.id, 'condition', e.target.value as any)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Komponent rat ────────────────────────────────────────────────────────
interface InstallmentSectionProps {
    data: SaleAgreementData
    onChange: (data: SaleAgreementData) => void
    errors: Record<string, string>
}

function InstallmentSection({ data, onChange, errors }: InstallmentSectionProps) {
    const set = useCallback(<K extends keyof SaleAgreementData>(field: K, value: SaleAgreementData[K]) => {
        onChange({ ...data, [field]: value })
    }, [data, onChange])

    const setInstallments = useCallback(<K extends keyof InstallmentData>(field: K, value: InstallmentData[K]) => {
        onChange({
            ...data,
            installments: {
                ...data.installments,
                [field]: value
            } as InstallmentData
        })
    }, [data, onChange])

    // Calculate installments
    useEffect(() => {
        if (data.installments?.count && data.installments.count > 0 && data.totalGross > 0) {
            const schedule = calculateInstallments(
                data.totalGross,
                data.installments.count,
                data.installments.interestRate || 0
            )

            onChange({
                ...data,
                installments: {
                    ...data.installments,
                    monthlyAmount: schedule.monthlyAmount,
                    totalInterest: schedule.totalInterest,
                    totalAmount: schedule.totalAmount,
                    schedule: schedule.schedule
                }
            })
        }
    }, [data.installments?.count, data.installments?.interestRate, data.totalGross])

    return (
        <div className="space-y-3 p-4 bg-bg-tertiary/20 rounded-lg border border-border-subtle">
            <FieldGrid cols={2}>
                <InputRow
                    label="Liczba rat"
                    type="number"
                    min="2"
                    max="36"
                    placeholder="np. 3"
                    value={data.installments?.count || ''}
                    onChange={e => setInstallments('count', parseInt(e.target.value) || 0)}
                    error={errors.installmentsCount}
                    required
                    hint="Min. 2 raty, max. 36 rat"
                />
                <InputRow
                    label="Oprocentowanie roczne"
                    placeholder="np. 5.5"
                    value={data.installments?.interestRate || ''}
                    onChange={e => setInstallments('interestRate', parseFloat(e.target.value) || 0)}
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    adornmentEnd={<span className="text-ink-low">%</span>}
                />
            </FieldGrid>

            <IbanInput
                label="Numer rachunku bankowego Sprzedawcy"
                required
                value={data.bankAccount || data.seller.bankAccount}
                onChange={(v) => set('bankAccount', v)}
                error={errors.bankAccount}
            />

            <InputRow
                label="Termin pierwszej raty"
                type="date"
                value={data.installments?.firstPaymentDate || ''}
                onChange={e => setInstallments('firstPaymentDate', e.target.value)}
            />

            {data.installments?.count && data.installments.count > 0 && data.totalGross > 0 && (
                <div className="mt-3 p-3 bg-brand/5 rounded-lg border border-brand/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-brand">Harmonogram spłat</span>
                        <span className="text-[10px] text-ink-low">
                            {data.installments.count} rat × {formatCurrency(data.installments.monthlyAmount || 0)}
                        </span>
                    </div>

                    <div className="space-y-1 max-h-32 overflow-y-auto text-[10px]">
                        {data.installments.schedule?.map((inst, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-border-subtle/50">
                                <span>Rata {inst.number}</span>
                                <span className="font-mono">{formatDatePL(inst.date)}</span>
                                <span className="font-mono font-medium">{formatCurrency(inst.amount)}</span>
                                {inst.interest > 0 && (
                                    <span className="text-ink-lower">(odsetki: {formatCurrency(inst.interest)})</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand/20 text-xs">
                        <span>Całkowita kwota do zapłaty:</span>
                        <span className="font-bold text-brand">{formatCurrency(data.installments.totalAmount || 0)}</span>
                    </div>
                    <p className="text-[9px] text-ink-low mt-1">
                        * w tym odsetki: {formatCurrency(data.installments.totalInterest || 0)}
                    </p>
                </div>
            )}

            <div className="text-[10px] text-ink-low flex items-start gap-1.5 bg-brand/5 p-2 rounded-lg">
                <Gavel size={12} className="shrink-0 mt-0.5 text-brand" />
                <span>
                    <strong>Art. 536 KC</strong> - Cena może być oznaczona przez wskazanie podstaw do jej ustalenia.
                    W przypadku płatności ratalnej, całkowita cena sprzedaży ulega powiększeniu o odsetki.
                </span>
            </div>
        </div>
    )
}

// ─── Komponent gwarancji ──────────────────────────────────────────────────
interface WarrantySectionProps {
    data: SaleAgreementData
    onChange: (data: SaleAgreementData) => void
}

function WarrantySection({ data, onChange }: WarrantySectionProps) {
    const setWarranty = useCallback(<K extends keyof WarrantyData>(field: K, value: WarrantyData[K]) => {
        onChange({
            ...data,
            warranty: {
                ...data.warranty,
                [field]: value
            } as WarrantyData
        })
    }, [data, onChange])

    return (
        <div className="space-y-3 p-3 bg-bg-tertiary/20 rounded-lg">
            <FieldGrid cols={2}>
                <InputRow
                    label="Okres gwarancji"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="12"
                    value={data.warranty?.period || ''}
                    onChange={e => setWarranty('period', parseInt(e.target.value) || 0)}
                    required={data.includeWarranty}
                />
                <Select
                    label="Jednostka czasu"
                    options={[
                        { value: 'months', label: 'miesięcy' },
                        { value: 'years', label: 'lat' },
                        { value: 'days', label: 'dni' }
                    ]}
                    value={data.warranty?.periodUnit || 'months'}
                    onChange={e => setWarranty('periodUnit', e.target.value as any)}
                />
            </FieldGrid>

            <FormField label="Zakres gwarancji">
                <TextArea
                    rows={2}
                    placeholder="Np. Wady ukryte, sprawność mechaniczna, zgodność z parametrami technicznymi..."
                    value={data.warranty?.scope || ''}
                    onChange={e => setWarranty('scope', e.target.value)}
                />
            </FormField>

            <FormField label="Wyłączenia odpowiedzialności">
                <TextArea
                    rows={2}
                    placeholder="Np. Uszkodzenia mechaniczne powstałe po zakupie, normalne zużycie, niewłaściwa konserwacja..."
                    value={data.warranty?.exclusions?.join('\n') || ''}
                    onChange={e => setWarranty('exclusions', e.target.value.split('\n').filter(Boolean))}
                />
            </FormField>

            <div className="text-[10px] text-ink-low flex items-start gap-1.5 bg-brand/5 p-2 rounded-lg">
                <Gavel size={12} className="shrink-0 mt-0.5 text-brand" />
                <span>
                    <strong>Art. 577 KC</strong> - Udzielenie gwarancji następuje przez oświadczenie gwaranta złożone
                    na dokumencie gwarancyjnym. W razie wątpliwości uważa się, że gwarant jest obowiązany do usunięcia
                    wady fizycznej rzeczy lub do dostarczenia rzeczy wolnej od wad.
                </span>
            </div>
        </div>
    )
}