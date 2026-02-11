// documents/RentalAgreement/RentalAgreementForm.tsx
import React, { useCallback, useEffect } from 'react';
import {
    House,
    User,
    MapPin,
    Calendar,
    CurrencyDollar,
    IdentificationCard,
    DeviceMobile,
    Envelope,
    Building,
    Ruler,
    Stairs,
    Hash,
    Question,
    CaretDown,
    Plus,
    X,
    FileText,
    Seal,
} from '@phosphor-icons/react';
import { useRentalAgreementForm } from '../../hooks/useRentalAgreementForm';
import type { RentalAgreementData } from '../../types/documents';
import { formatCurrency, numberToWords } from '../../shared/utils';

interface RentalAgreementFormProps {
    data: RentalAgreementData;
    onChange: (data: RentalAgreementData) => void;
    onValidationChange?: (isValid: boolean, errors: any) => void;
}

const FormSection = ({
    icon,
    title,
    number,
    children,
    accent = '#7c6a3e'
}: {
    icon: React.ReactNode;
    title: string;
    number: string;
    children: React.ReactNode;
    accent?: string;
}) => (
    <div className="space-y-4 group">
        <div className="flex items-center gap-3">
            <div className={`
        w-7 h-7 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 
        border border-brand/30 flex items-center justify-center text-brand 
        shrink-0 group-hover:scale-110 transition-transform duration-300
      `}>
                {icon}
            </div>
            <div>
                <span className="text-2xs font-mono text-ink-low tracking-wider">§ {number}</span>
                <h3 className="text-sm font-semibold text-ink-high leading-tight">{title}</h3>
            </div>
        </div>
        <div className="pl-10 space-y-4">{children}</div>
    </div>
);

const FormField = ({
    label,
    icon,
    children,
    required = false,
    error,
    warning,
    touched,
    hint,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    required?: boolean;
    error?: string;
    warning?: string;
    touched?: boolean;
    hint?: string;
}) => {
    const showError = touched && error;
    const showWarning = touched && warning && !error;

    return (
        <div className="space-y-1.5">
            <label className="form-label flex items-center gap-1.5 text-xs">
                {icon && <span className="text-ink-low">{icon}</span>}
                <span className="font-medium">{label}</span>
                {required && <span className="text-error text-xs">*</span>}
            </label>
            {children}
            {hint && !showError && !showWarning && (
                <div className="flex items-start gap-1.5 mt-1 text-ink-low">
                    <Question size={12} className="shrink-0 mt-0.5" />
                    <span className="text-2xs leading-tight">{hint}</span>
                </div>
            )}
            {showError && (
                <div className="flex items-start gap-1.5 mt-1 text-error">
                    <span className="w-1 h-1 rounded-full bg-error mt-1.5" />
                    <span className="text-2xs leading-tight">{error}</span>
                </div>
            )}
            {showWarning && (
                <div className="flex items-start gap-1.5 mt-1 text-warning">
                    <span className="w-1 h-1 rounded-full bg-warning mt-1.5" />
                    <span className="text-2xs leading-tight">{warning}</span>
                </div>
            )}
        </div>
    );
};

export const RentalAgreementForm: React.FC<RentalAgreementFormProps> = ({
    data,
    onChange,
    onValidationChange
}) => {
    const form = useRentalAgreementForm(data);

    const {
        handleFieldChange,
        handleBlur,
        handleFormatPesel,
        handleFormatAmount,
        handleFormatPhone,
        handleGenerateContractNumber,
        handleCalculateGrossRent,
        getFieldError,
        getFieldWarning,
        isFieldTouched,
        isFieldValid,
        validationSummary
    } = form;

    // Notify parent about validation status
    useEffect(() => {
        onValidationChange?.(validationSummary.isValid, validationSummary);
    }, [validationSummary, onValidationChange]);

    // Calculate gross rent when net rent or VAT changes
    useEffect(() => {
        handleCalculateGrossRent();
    }, [data.monthlyRent, data.monthlyRentVatRate, handleCalculateGrossRent]);

    const set = useCallback(<K extends keyof RentalAgreementData>(
        field: K,
        value: RentalAgreementData[K]
    ) => {
        handleFieldChange(field, value);
        onChange({ ...data, [field]: value });
    }, [data, onChange, handleFieldChange]);

    const monthlyRent = parseFloat(data.monthlyRent.replace(',', '.')) || 0;
    const deposit = parseFloat(data.deposit.replace(',', '.')) || 0;
    const vatRate = parseInt(data.monthlyRentVatRate || '23');
    const grossRent = monthlyRent * (1 + vatRate / 100);

    return (
        <div className="space-y-8 pb-8">
            {/* Section 1: Basic Data */}
            <FormSection icon={<FileText size={16} weight="fill" />} title="Dane podstawowe" number="1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <FormField
                            label="Numer umowy"
                            required
                            error={getFieldError('contractNumber')}
                            touched={isFieldTouched('contractNumber')}
                        >
                            <div className="flex gap-2">
                                <input
                                    className={`form-input flex-1 ${isFieldTouched('contractNumber') && !isFieldValid('contractNumber')
                                        ? 'border-error ring-1 ring-error/20'
                                        : ''
                                        }`}
                                    placeholder="01/03/2026/UN"
                                    value={data.contractNumber}
                                    onChange={e => set('contractNumber', e.target.value)}
                                    onBlur={() => handleBlur('contractNumber')}
                                />
                                <button
                                    type="button"
                                    className="btn-ghost px-3 border border-border-subtle rounded-lg text-xs flex items-center gap-1.5 hover:border-brand/30 transition-colors"
                                    onClick={handleGenerateContractNumber}
                                >
                                    <Seal size={12} />
                                    Auto
                                </button>
                            </div>
                        </FormField>
                    </div>

                    <FormField
                        label="Data zawarcia"
                        icon={<Calendar size={12} />}
                        required
                        error={getFieldError('conclusionDate')}
                        touched={isFieldTouched('conclusionDate')}
                    >
                        <input
                            type="date"
                            className={`form-input ${isFieldTouched('conclusionDate') && !isFieldValid('conclusionDate')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            value={data.conclusionDate}
                            onChange={e => set('conclusionDate', e.target.value)}
                            onBlur={() => handleBlur('conclusionDate')}
                        />
                    </FormField>

                    <FormField
                        label="Miejsce"
                        icon={<MapPin size={12} />}
                        required
                        error={getFieldError('place')}
                        touched={isFieldTouched('place')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('place') && !isFieldValid('place')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="Gdańsk"
                            value={data.place}
                            onChange={e => set('place', e.target.value)}
                            onBlur={() => handleBlur('place')}
                        />
                    </FormField>
                </div>
            </FormSection>

            {/* Section 2: Landlord */}
            <FormSection icon={<User size={16} weight="fill" />} title="Wynajmujący" number="2">
                <div className="space-y-4">
                    <FormField
                        label="Imię i nazwisko"
                        required
                        error={getFieldError('landlordFullName')}
                        touched={isFieldTouched('landlordFullName')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('landlordFullName') && !isFieldValid('landlordFullName')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="Jan Kowalski"
                            value={data.landlordFullName}
                            onChange={e => set('landlordFullName', e.target.value)}
                            onBlur={() => handleBlur('landlordFullName')}
                        />
                    </FormField>

                    <FormField
                        label="Adres"
                        required
                        error={getFieldError('landlordAddress')}
                        touched={isFieldTouched('landlordAddress')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('landlordAddress') && !isFieldValid('landlordAddress')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="ul. Przykładowa 1, 00-000 Miasto"
                            value={data.landlordAddress}
                            onChange={e => set('landlordAddress', e.target.value)}
                            onBlur={() => handleBlur('landlordAddress')}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="PESEL"
                            icon={<IdentificationCard size={12} />}
                            required
                            error={getFieldError('landlordPesel')}
                            warning={getFieldWarning('landlordPesel')}
                            touched={isFieldTouched('landlordPesel')}
                        >
                            <input
                                className={`form-input ${isFieldTouched('landlordPesel') && !isFieldValid('landlordPesel')
                                    ? 'border-error ring-1 ring-error/20'
                                    : ''
                                    }`}
                                placeholder="00000000000"
                                maxLength={11}
                                value={data.landlordPesel}
                                onChange={e => set('landlordPesel', handleFormatPesel(e.target.value))}
                                onBlur={() => handleBlur('landlordPesel')}
                            />
                        </FormField>

                        <FormField
                            label="Nr dowodu"
                            icon={<IdentificationCard size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                className="form-input"
                                placeholder="ABC123456"
                                maxLength={9}
                                value={data.landlordIdCard || ''}
                                onChange={e => set('landlordIdCard', e.target.value.toUpperCase())}
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="Telefon"
                            icon={<DeviceMobile size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                className="form-input"
                                placeholder="+48 123 456 789"
                                value={data.landlordPhone || ''}
                                onChange={e => set('landlordPhone', handleFormatPhone(e.target.value))}
                            />
                        </FormField>

                        <FormField
                            label="Email"
                            icon={<Envelope size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                type="email"
                                className="form-input"
                                placeholder="jan@kowalski.pl"
                                value={data.landlordEmail || ''}
                                onChange={e => set('landlordEmail', e.target.value.trim().toLowerCase())}
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>

            {/* Section 3: Tenant */}
            <FormSection icon={<User size={16} weight="fill" />} title="Najemca" number="3">
                <div className="space-y-4">
                    <FormField
                        label="Imię i nazwisko"
                        required
                        error={getFieldError('tenantFullName')}
                        touched={isFieldTouched('tenantFullName')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('tenantFullName') && !isFieldValid('tenantFullName')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="Anna Nowak"
                            value={data.tenantFullName}
                            onChange={e => set('tenantFullName', e.target.value)}
                            onBlur={() => handleBlur('tenantFullName')}
                        />
                    </FormField>

                    <FormField
                        label="Adres"
                        required
                        error={getFieldError('tenantAddress')}
                        touched={isFieldTouched('tenantAddress')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('tenantAddress') && !isFieldValid('tenantAddress')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="ul. Przykładowa 2, 00-001 Miasto"
                            value={data.tenantAddress}
                            onChange={e => set('tenantAddress', e.target.value)}
                            onBlur={() => handleBlur('tenantAddress')}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="PESEL"
                            icon={<IdentificationCard size={12} />}
                            required
                            error={getFieldError('tenantPesel')}
                            warning={getFieldWarning('tenantPesel')}
                            touched={isFieldTouched('tenantPesel')}
                        >
                            <input
                                className={`form-input ${isFieldTouched('tenantPesel') && !isFieldValid('tenantPesel')
                                    ? 'border-error ring-1 ring-error/20'
                                    : ''
                                    }`}
                                placeholder="00000000000"
                                maxLength={11}
                                value={data.tenantPesel}
                                onChange={e => set('tenantPesel', handleFormatPesel(e.target.value))}
                                onBlur={() => handleBlur('tenantPesel')}
                            />
                        </FormField>

                        <FormField
                            label="Nr dowodu"
                            icon={<IdentificationCard size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                className="form-input"
                                placeholder="XYZ789012"
                                maxLength={9}
                                value={data.tenantIdCard || ''}
                                onChange={e => set('tenantIdCard', e.target.value.toUpperCase())}
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="Telefon"
                            icon={<DeviceMobile size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                className="form-input"
                                placeholder="+48 987 654 321"
                                value={data.tenantPhone || ''}
                                onChange={e => set('tenantPhone', handleFormatPhone(e.target.value))}
                            />
                        </FormField>

                        <FormField
                            label="Email"
                            icon={<Envelope size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                type="email"
                                className="form-input"
                                placeholder="anna@nowak.pl"
                                value={data.tenantEmail || ''}
                                onChange={e => set('tenantEmail', e.target.value.trim().toLowerCase())}
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>

            {/* Section 4: Property */}
            <FormSection icon={<Building size={16} weight="fill" />} title="Nieruchomość" number="4">
                <div className="space-y-4">
                    <FormField
                        label="Adres nieruchomości"
                        required
                        error={getFieldError('propertyAddress')}
                        touched={isFieldTouched('propertyAddress')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('propertyAddress') && !isFieldValid('propertyAddress')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="ul. Najmu 5/10, 00-002 Miasto"
                            value={data.propertyAddress}
                            onChange={e => set('propertyAddress', e.target.value)}
                            onBlur={() => handleBlur('propertyAddress')}
                        />
                    </FormField>

                    <div className="grid grid-cols-3 gap-3">
                        <FormField
                            label="Powierzchnia"
                            icon={<Ruler size={12} />}
                            hint="m²"
                        >
                            <input
                                className="form-input"
                                placeholder="45.5"
                                value={data.propertyArea || ''}
                                onChange={e => set('propertyArea', e.target.value.replace(',', '.'))}
                            />
                        </FormField>

                        <FormField
                            label="Piętro"
                            icon={<Stairs size={12} />}
                        >
                            <input
                                className="form-input"
                                placeholder="3"
                                value={data.propertyFloor || ''}
                                onChange={e => set('propertyFloor', e.target.value)}
                            />
                        </FormField>

                        <FormField
                            label="Pokoje"
                            icon={<Hash size={12} />}
                        >
                            <input
                                type="number"
                                className="form-input"
                                placeholder="2"
                                min="1"
                                value={data.propertyRooms || ''}
                                onChange={e => set('propertyRooms', parseInt(e.target.value) || undefined)}
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="Opis (opcjonalnie)"
                        hint="Dodatkowe informacje o nieruchomości"
                    >
                        <textarea
                            className="form-input resize-none min-h-[80px]"
                            rows={3}
                            placeholder="Kawalerka, 35m², 3. piętro, balkon, miejsce parkingowe..."
                            value={data.propertyDescription}
                            onChange={e => set('propertyDescription', e.target.value)}
                        />
                    </FormField>
                </div>
            </FormSection>

            {/* Section 5: Rental Terms */}
            <FormSection icon={<Calendar size={16} weight="fill" />} title="Okres najmu" number="5">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Data rozpoczęcia"
                            required
                            error={getFieldError('startDate')}
                            touched={isFieldTouched('startDate')}
                        >
                            <input
                                type="date"
                                className={`form-input ${isFieldTouched('startDate') && !isFieldValid('startDate')
                                    ? 'border-error ring-1 ring-error/20'
                                    : ''
                                    }`}
                                value={data.startDate}
                                onChange={e => set('startDate', e.target.value)}
                                onBlur={() => handleBlur('startDate')}
                            />
                        </FormField>

                        <FormField
                            label="Data zakończenia"
                            hint="Pozostaw puste dla umowy na czas nieokreślony"
                        >
                            <input
                                type="date"
                                className="form-input"
                                value={data.endDate}
                                onChange={e => set('endDate', e.target.value)}
                                min={data.startDate}
                            />
                        </FormField>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-bg-tertiary/30 rounded-lg border border-border-subtle">
                        <div className="flex-1">
                            <label className="form-label text-xs">Okres wypowiedzenia</label>
                            <select
                                className="form-input mt-1"
                                value={data.noticePeriod}
                                onChange={e => set('noticePeriod', e.target.value)}
                            >
                                <option value="1 miesiąc">1 miesiąc</option>
                                <option value="2 miesiące">2 miesiące</option>
                                <option value="3 miesiące">3 miesiące</option>
                                <option value="1 tydzień">1 tydzień</option>
                                <option value="2 tygodnie">2 tygodnie</option>
                            </select>
                        </div>
                        <div className="text-2xs text-ink-low">
                            <span className="block">Standardowy okres</span>
                            <span className="block text-brand">wypowiedzenia</span>
                        </div>
                    </div>
                </div>
            </FormSection>

            {/* Section 6: Financial */}
            <FormSection icon={<CurrencyDollar size={16} weight="fill" />} title="Finanse" number="6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Czynsz netto (PLN)"
                            required
                            error={getFieldError('monthlyRent')}
                            touched={isFieldTouched('monthlyRent')}
                        >
                            <input
                                className={`form-input ${isFieldTouched('monthlyRent') && !isFieldValid('monthlyRent')
                                    ? 'border-error ring-1 ring-error/20'
                                    : ''
                                    }`}
                                placeholder="2500,00"
                                value={data.monthlyRent}
                                onChange={e => set('monthlyRent', handleFormatAmount(e.target.value))}
                                onBlur={() => handleBlur('monthlyRent')}
                            />
                        </FormField>

                        <FormField
                            label="Stawka VAT"
                        >
                            <select
                                className="form-input"
                                value={data.monthlyRentVatRate}
                                onChange={e => set('monthlyRentVatRate', e.target.value)}
                            >
                                <option value="0">0% (zwolniony)</option>
                                <option value="8">8%</option>
                                <option value="23">23%</option>
                            </select>
                        </FormField>
                    </div>

                    {monthlyRent > 0 && (
                        <div className="bg-gradient-to-r from-brand/5 to-brand/10 rounded-lg p-4 border border-brand/20">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-ink-low">Czynsz brutto miesięcznie:</span>
                                <span className="text-lg font-semibold text-brand">
                                    {formatCurrency(grossRent)} zł
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-ink-low mt-1">
                                <span>Słownie:</span>
                                <span className="italic">{numberToWords(grossRent)}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Kaucja (PLN)"
                            error={getFieldError('deposit')}
                            warning={getFieldWarning('deposit')}
                            touched={isFieldTouched('deposit')}
                            hint="Zazwyczaj 1-3 x czynsz"
                        >
                            <input
                                className={`form-input ${isFieldTouched('deposit') && !isFieldValid('deposit')
                                    ? 'border-error ring-1 ring-error/20'
                                    : ''
                                    }`}
                                placeholder="5000,00"
                                value={data.deposit}
                                onChange={e => set('deposit', handleFormatAmount(e.target.value))}
                                onBlur={() => handleBlur('deposit')}
                            />
                        </FormField>

                        <FormField
                            label="Zwrot kaucji (dni)"
                        >
                            <select
                                className="form-input"
                                value={data.depositReturnDays}
                                onChange={e => set('depositReturnDays', e.target.value)}
                            >
                                <option value="14">14 dni</option>
                                <option value="30">30 dni</option>
                                <option value="60">60 dni</option>
                            </select>
                        </FormField>
                    </div>

                    {deposit > 0 && (
                        <p className="text-2xs text-ink-low italic">
                            Słownie: {numberToWords(deposit)}
                        </p>
                    )}

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-border-med transition-colors">
                        <input
                            type="checkbox"
                            id="utilitiesIncluded"
                            className="w-4 h-4 rounded border-border-subtle text-brand focus:ring-brand/20"
                            checked={data.utilitiesIncluded}
                            onChange={e => set('utilitiesIncluded', e.target.checked)}
                        />
                        <label htmlFor="utilitiesIncluded" className="flex-1 text-sm cursor-pointer">
                            <span className="font-medium">Media wliczone w czynsz</span>
                            <span className="block text-2xs text-ink-low">
                                Prąd, woda, ogrzewanie, internet
                            </span>
                        </label>
                    </div>

                    {!data.utilitiesIncluded && (
                        <FormField
                            label="Szacunkowe koszty mediów"
                            hint="Opcjonalnie, PLN/miesiąc"
                        >
                            <input
                                className="form-input"
                                placeholder="500,00"
                                value={data.utilitiesCost || ''}
                                onChange={e => set('utilitiesCost', handleFormatAmount(e.target.value))}
                            />
                        </FormField>
                    )}
                </div>
            </FormSection>
        </div>
    );
};

export default RentalAgreementForm;