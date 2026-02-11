import React, { useCallback, useEffect } from 'react';
import {
    User,
    MapPin,
    Calendar,
    IdentificationCard,
    DeviceMobile,
    Envelope,
    FileText,
    Seal,
    SealCheck,
    SealWarning,
    Gavel,
    Scales,
    Users,
    Plus,
    X,
    CaretDown,
    Clock,
    Question,
} from '@phosphor-icons/react';
import { usePowerOfAttorneyForm } from '../../hooks/usePowerOfAttorneyForm';
import type { PowerOfAttorneyData, PowerOfAttorneyType } from '../../types/documents';

interface PowerOfAttorneyFormProps {
    data: PowerOfAttorneyData;
    onChange: (data: PowerOfAttorneyData) => void;
    onValidationChange?: (isValid: boolean, summary: any) => void;
}

const FormSection = ({
    icon,
    title,
    number,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    number: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-4 group">
        <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 flex items-center justify-center text-brand shrink-0 group-hover:scale-110 transition-transform duration-300">
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
    className = '',
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    required?: boolean;
    error?: string;
    warning?: string;
    touched?: boolean;
    hint?: string;
    className?: string;
}) => {
    const showError = touched && error;
    const showWarning = touched && warning && !error;

    return (
        <div className={`space-y-1.5 ${className}`}>
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
                    <SealWarning size={12} weight="fill" className="shrink-0 mt-0.5" />
                    <span className="text-2xs leading-tight">{error}</span>
                </div>
            )}
            {showWarning && (
                <div className="flex items-start gap-1.5 mt-1 text-warning">
                    <SealWarning size={12} className="shrink-0 mt-0.5" />
                    <span className="text-2xs leading-tight">{warning}</span>
                </div>
            )}
        </div>
    );
};

const PowerTypeButton = ({
    type,
    currentType,
    onClick,
    label,
}: {
    type: PowerOfAttorneyType;
    currentType: PowerOfAttorneyType;
    onClick: (type: PowerOfAttorneyType) => void;
    label: string;
}) => {
    const isActive = currentType === type;

    return (
        <button
            onClick={() => onClick(type)}
            className={`
        relative flex-1 py-3 rounded-lg border text-xs font-medium transition-all duration-200
        ${isActive
                    ? 'border-brand/50 text-brand bg-gradient-to-br from-brand/10 to-brand/5 shadow-sm'
                    : 'border-border-subtle text-ink-low hover:border-border-med hover:bg-ink-lower/5'
                }
      `}
        >
            <span className="relative z-10">{label}</span>
            {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-full" />
            )}
        </button>
    );
};

export const PowerOfAttorneyForm: React.FC<PowerOfAttorneyFormProps> = ({
    data,
    onChange,
    onValidationChange,
}) => {
    const form = usePowerOfAttorneyForm(data);

    const {
        handleFieldChange,
        handleBlur,
        handleFormatPesel,
        handleFormatPhone,
        handleFormatIdCard,
        handleGenerateDocumentNumber,
        handleAddAdditionalAttorney,
        handleRemoveAdditionalAttorney,
        handleUpdateAdditionalAttorney,
        getFieldError,
        getFieldWarning,
        isFieldTouched,
        isFieldValid,
        validationSummary,
        previewData,
    } = form;

    useEffect(() => {
        onValidationChange?.(validationSummary.isValid, validationSummary);
    }, [validationSummary, onValidationChange]);

    const set = useCallback(<K extends keyof PowerOfAttorneyData>(
        field: K,
        value: PowerOfAttorneyData[K]
    ) => {
        handleFieldChange(field, value);
        onChange({ ...data, [field]: value });
    }, [data, onChange, handleFieldChange]);

    const powerTypeLabels = {
        general: 'Ogólne',
        specific: 'Szczególne',
        special: 'Rodzajowe',
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Section 1: Basic Data */}
            <FormSection icon={<FileText size={16} weight="fill" />} title="Dane podstawowe" number="1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <FormField
                            label="Numer / sygnatura"
                            required
                            error={getFieldError('documentNumber')}
                            touched={isFieldTouched('documentNumber')}
                        >
                            <div className="flex gap-2">
                                <input
                                    className={`form-input flex-1 ${isFieldTouched('documentNumber') && !isFieldValid('documentNumber')
                                        ? 'border-error ring-1 ring-error/20'
                                        : ''
                                        }`}
                                    placeholder="P/01/03/2026"
                                    value={data.documentNumber}
                                    onChange={e => set('documentNumber', e.target.value)}
                                    onBlur={() => handleBlur('documentNumber')}
                                />
                                <button
                                    type="button"
                                    className="btn-ghost px-3 border border-border-subtle rounded-lg text-xs flex items-center gap-1.5 hover:border-brand/30 transition-colors"
                                    onClick={handleGenerateDocumentNumber}
                                >
                                    <Seal size={12} />
                                    Auto
                                </button>
                            </div>
                        </FormField>
                    </div>

                    <FormField
                        label="Data wystawienia"
                        icon={<Calendar size={12} />}
                        required
                        error={getFieldError('issueDate')}
                        touched={isFieldTouched('issueDate')}
                    >
                        <input
                            type="date"
                            className={`form-input ${isFieldTouched('issueDate') && !isFieldValid('issueDate')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            value={data.issueDate}
                            onChange={e => set('issueDate', e.target.value)}
                            onBlur={() => handleBlur('issueDate')}
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

                    <div className="col-span-2">
                        <label className="form-label flex items-center gap-1.5 text-xs mb-2">
                            <Gavel size={12} className="text-ink-low" />
                            <span className="font-medium">Rodzaj pełnomocnictwa</span>
                            <span className="text-error text-xs">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(Object.entries(powerTypeLabels) as [PowerOfAttorneyType, string][]).map(([type, label]) => (
                                <PowerTypeButton
                                    key={type}
                                    type={type}
                                    currentType={data.powerType}
                                    onClick={value => set('powerType', value)}
                                    label={label}
                                />
                            ))}
                        </div>
                        {isFieldTouched('powerType') && getFieldError('powerType') && (
                            <div className="flex items-start gap-1.5 mt-2 text-error">
                                <SealWarning size={12} weight="fill" className="shrink-0 mt-0.5" />
                                <span className="text-2xs">{getFieldError('powerType')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </FormSection>

            {/* Section 2: Principal (Mocodawca) */}
            <FormSection icon={<User size={16} weight="fill" />} title="Mocodawca" number="2">
                <div className="space-y-4">
                    <FormField
                        label="Imię i nazwisko"
                        required
                        error={getFieldError('principalFullName')}
                        touched={isFieldTouched('principalFullName')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('principalFullName') && !isFieldValid('principalFullName')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="Jan Kowalski"
                            value={data.principalFullName}
                            onChange={e => set('principalFullName', e.target.value)}
                            onBlur={() => handleBlur('principalFullName')}
                        />
                    </FormField>

                    <FormField
                        label="Adres"
                        required
                        error={getFieldError('principalAddress')}
                        touched={isFieldTouched('principalAddress')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('principalAddress') && !isFieldValid('principalAddress')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="ul. Przykładowa 1, 00-000 Miasto"
                            value={data.principalAddress}
                            onChange={e => set('principalAddress', e.target.value)}
                            onBlur={() => handleBlur('principalAddress')}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="PESEL"
                            icon={<IdentificationCard size={12} />}
                            required
                            error={getFieldError('principalPesel')}
                            warning={getFieldWarning('principalPesel')}
                            touched={isFieldTouched('principalPesel')}
                        >
                            <input
                                className={`form-input ${isFieldTouched('principalPesel') && !isFieldValid('principalPesel')
                                    ? 'border-error ring-1 ring-error/20'
                                    : ''
                                    }`}
                                placeholder="00000000000"
                                maxLength={11}
                                value={data.principalPesel}
                                onChange={e => set('principalPesel', handleFormatPesel(e.target.value))}
                                onBlur={() => handleBlur('principalPesel')}
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
                                value={data.principalIdCard || ''}
                                onChange={e => set('principalIdCard', handleFormatIdCard(e.target.value))}
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="Data urodzenia"
                            icon={<Calendar size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                type="date"
                                className="form-input"
                                value={data.principalBirthDate || ''}
                                onChange={e => set('principalBirthDate', e.target.value)}
                            />
                        </FormField>

                        <FormField
                            label="Miejsce urodzenia"
                            icon={<MapPin size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                className="form-input"
                                placeholder="Warszawa"
                                value={data.principalBirthPlace || ''}
                                onChange={e => set('principalBirthPlace', e.target.value)}
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
                                value={data.principalPhone || ''}
                                onChange={e => set('principalPhone', handleFormatPhone(e.target.value))}
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
                                value={data.principalEmail || ''}
                                onChange={e => set('principalEmail', e.target.value.trim().toLowerCase())}
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>

            {/* Section 3: Attorney (Pełnomocnik) */}
            <FormSection icon={<User size={16} weight="fill" />} title="Pełnomocnik" number="3">
                <div className="space-y-4">
                    <FormField
                        label="Imię i nazwisko"
                        required
                        error={getFieldError('attorneyFullName')}
                        touched={isFieldTouched('attorneyFullName')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('attorneyFullName') && !isFieldValid('attorneyFullName')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="Anna Nowak"
                            value={data.attorneyFullName}
                            onChange={e => set('attorneyFullName', e.target.value)}
                            onBlur={() => handleBlur('attorneyFullName')}
                        />
                    </FormField>

                    <FormField
                        label="Adres"
                        required
                        error={getFieldError('attorneyAddress')}
                        touched={isFieldTouched('attorneyAddress')}
                    >
                        <input
                            className={`form-input ${isFieldTouched('attorneyAddress') && !isFieldValid('attorneyAddress')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            placeholder="ul. Przykładowa 2, 00-001 Miasto"
                            value={data.attorneyAddress}
                            onChange={e => set('attorneyAddress', e.target.value)}
                            onBlur={() => handleBlur('attorneyAddress')}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="PESEL"
                            icon={<IdentificationCard size={12} />}
                            required
                            error={getFieldError('attorneyPesel')}
                            warning={getFieldWarning('attorneyPesel')}
                            touched={isFieldTouched('attorneyPesel')}
                        >
                            <input
                                className={`form-input ${isFieldTouched('attorneyPesel') && !isFieldValid('attorneyPesel')
                                    ? 'border-error ring-1 ring-error/20'
                                    : ''
                                    }`}
                                placeholder="00000000000"
                                maxLength={11}
                                value={data.attorneyPesel}
                                onChange={e => set('attorneyPesel', handleFormatPesel(e.target.value))}
                                onBlur={() => handleBlur('attorneyPesel')}
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
                                value={data.attorneyIdCard || ''}
                                onChange={e => set('attorneyIdCard', handleFormatIdCard(e.target.value))}
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            label="Data urodzenia"
                            icon={<Calendar size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                type="date"
                                className="form-input"
                                value={data.attorneyBirthDate || ''}
                                onChange={e => set('attorneyBirthDate', e.target.value)}
                            />
                        </FormField>

                        <FormField
                            label="Miejsce urodzenia"
                            icon={<MapPin size={12} />}
                            hint="Opcjonalnie"
                        >
                            <input
                                className="form-input"
                                placeholder="Gdańsk"
                                value={data.attorneyBirthPlace || ''}
                                onChange={e => set('attorneyBirthPlace', e.target.value)}
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
                                value={data.attorneyPhone || ''}
                                onChange={e => set('attorneyPhone', handleFormatPhone(e.target.value))}
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
                                value={data.attorneyEmail || ''}
                                onChange={e => set('attorneyEmail', e.target.value.trim().toLowerCase())}
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>

            {/* Section 4: Additional Attorneys */}
            {data.jointRepresentation && (
                <FormSection icon={<Users size={16} weight="fill" />} title="Dodatkowi pełnomocnicy" number="3a">
                    <div className="space-y-4">
                        {(data.additionalAttorneys || []).map((attorney, index) => (
                            <div key={index} className="relative p-4 bg-bg-tertiary/20 rounded-lg border border-border-subtle">
                                <button
                                    className="absolute top-2 right-2 p-1 hover:bg-error/10 rounded-md transition-colors group"
                                    onClick={() => handleRemoveAdditionalAttorney(index)}
                                >
                                    <X size={14} className="text-ink-low group-hover:text-error" />
                                </button>

                                <div className="space-y-3">
                                    <FormField
                                        label="Imię i nazwisko"
                                        required
                                    >
                                        <input
                                            className="form-input"
                                            placeholder="Jan Kowalski"
                                            value={attorney.fullName}
                                            onChange={e => handleUpdateAdditionalAttorney(index, 'fullName', e.target.value)}
                                        />
                                    </FormField>

                                    <FormField
                                        label="Adres"
                                        required
                                    >
                                        <input
                                            className="form-input"
                                            placeholder="ul. Przykładowa 3, 00-002 Miasto"
                                            value={attorney.address}
                                            onChange={e => handleUpdateAdditionalAttorney(index, 'address', e.target.value)}
                                        />
                                    </FormField>

                                    <FormField
                                        label="PESEL"
                                        required
                                    >
                                        <input
                                            className="form-input"
                                            placeholder="00000000000"
                                            maxLength={11}
                                            value={attorney.pesel}
                                            onChange={e => handleUpdateAdditionalAttorney(
                                                index,
                                                'pesel',
                                                handleFormatPesel(e.target.value)
                                            )}
                                        />
                                    </FormField>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={handleAddAdditionalAttorney}
                            className="w-full py-3 border-2 border-dashed border-border-subtle rounded-lg text-xs text-ink-low hover:text-brand hover:border-brand/30 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={14} />
                            Dodaj kolejnego pełnomocnika
                        </button>
                    </div>
                </FormSection>
            )}

            {/* Section 5: Scope */}
            <FormSection icon={<Gavel size={16} weight="fill" />} title="Zakres umocowania" number="4">
                <div className="space-y-4">
                    <FormField
                        label="Opis zakresu"
                        required
                        error={getFieldError('scopeDescription')}
                        warning={getFieldWarning('scopeDescription')}
                        touched={isFieldTouched('scopeDescription')}
                    >
                        <textarea
                            className={`form-input resize-none min-h-[120px] ${isFieldTouched('scopeDescription') && !isFieldValid('scopeDescription')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            rows={5}
                            placeholder="Np. do zawarcia umów kupna-sprzedaży nieruchomości, reprezentowania przed sądami, podpisywania dokumentów w imieniu mocodawcy..."
                            value={data.scopeDescription}
                            onChange={e => set('scopeDescription', e.target.value)}
                            onBlur={() => handleBlur('scopeDescription')}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-border-med transition-colors">
                            <input
                                type="checkbox"
                                id="isRevocable"
                                className="w-4 h-4 rounded border-border-subtle text-brand focus:ring-brand/20"
                                checked={data.isRevocable}
                                onChange={e => set('isRevocable', e.target.checked)}
                            />
                            <label htmlFor="isRevocable" className="flex-1 text-sm cursor-pointer">
                                <span className="font-medium">Odwołalne</span>
                                <span className="block text-2xs text-ink-low">
                                    Pełnomocnictwo może zostać odwołane w każdym czasie
                                </span>
                            </label>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-border-med transition-colors">
                            <input
                                type="checkbox"
                                id="canSubstitute"
                                className="w-4 h-4 rounded border-border-subtle text-brand focus:ring-brand/20"
                                checked={data.canSubstitute}
                                onChange={e => set('canSubstitute', e.target.checked)}
                            />
                            <label htmlFor="canSubstitute" className="flex-1 text-sm cursor-pointer">
                                <span className="font-medium">Substytucja</span>
                                <span className="block text-2xs text-ink-low">
                                    Pełnomocnik może ustanawiać dalszych pełnomocników
                                </span>
                            </label>
                        </div>
                    </div>

                    {data.canSubstitute && (
                        <FormField
                            label="Ograniczenia substytucji"
                            hint="Opcjonalnie - np. tylko określone czynności"
                        >
                            <input
                                className="form-input"
                                placeholder="Np. tylko do czynności administracyjnych"
                                value={data.substitutionLimit || ''}
                                onChange={e => set('substitutionLimit', e.target.value)}
                            />
                        </FormField>
                    )}

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-border-med transition-colors">
                        <input
                            type="checkbox"
                            id="jointRepresentation"
                            className="w-4 h-4 rounded border-border-subtle text-brand focus:ring-brand/20"
                            checked={data.jointRepresentation}
                            onChange={e => set('jointRepresentation', e.target.checked)}
                        />
                        <label htmlFor="jointRepresentation" className="flex-1 text-sm cursor-pointer">
                            <span className="font-medium">Współpełnomocnicy</span>
                            <span className="block text-2xs text-ink-low">
                                Ustanawiam kilku pełnomocników działających łącznie
                            </span>
                        </label>
                    </div>
                </div>
            </FormSection>

            {/* Section 6: Notarial & Expiry */}
            <FormSection icon={<SealCheck size={16} weight="fill" />} title="Forma notarialna i termin" number="5">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-border-med transition-colors cursor-pointer"
                        onClick={() => set('isNotarized', !data.isNotarized)}>
                        <div className={`
              w-9 h-5 rounded-full relative transition-all shrink-0
              ${data.isNotarized ? 'bg-brand' : 'bg-surface-accent border border-border-med'}
            `}>
                            <div className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all
                ${data.isNotarized ? 'left-[18px]' : 'left-0.5'}
              `} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-ink-high">Pełnomocnictwo notarialne</p>
                            <p className="text-xs text-ink-low">Wymaga poświadczenia notariusza</p>
                        </div>
                    </div>

                    {data.isNotarized && (
                        <div className="grid grid-cols-2 gap-3 p-4 bg-bg-tertiary/20 rounded-lg border border-border-subtle">
                            <FormField
                                label="Kancelaria notarialna"
                                required
                                error={getFieldError('notaryOffice')}
                                touched={isFieldTouched('notaryOffice')}
                            >
                                <input
                                    className={`form-input ${isFieldTouched('notaryOffice') && !isFieldValid('notaryOffice')
                                        ? 'border-error ring-1 ring-error/20'
                                        : ''
                                        }`}
                                    placeholder="Notariusz Jan Nowak, Warszawa"
                                    value={data.notaryOffice || ''}
                                    onChange={e => set('notaryOffice', e.target.value)}
                                    onBlur={() => handleBlur('notaryOffice')}
                                />
                            </FormField>

                            <FormField
                                label="Nr aktu notarialnego"
                                hint="Opcjonalnie"
                            >
                                <input
                                    className="form-input"
                                    placeholder="Rep. A 1234/2026"
                                    value={data.notaryActNumber || ''}
                                    onChange={e => set('notaryActNumber', e.target.value)}
                                />
                            </FormField>

                            <FormField
                                label="Data sporządzenia"
                                hint="Opcjonalnie"
                            >
                                <input
                                    type="date"
                                    className="form-input"
                                    value={data.notaryDate || ''}
                                    onChange={e => set('notaryDate', e.target.value)}
                                />
                            </FormField>
                        </div>
                    )}

                    <FormField
                        label="Termin wygaśnięcia"
                        icon={<Clock size={12} />}
                        error={getFieldError('expiryDate')}
                        touched={isFieldTouched('expiryDate')}
                        hint="Pozostaw puste dla pełnomocnictwa bezterminowego"
                    >
                        <input
                            type="date"
                            className={`form-input ${isFieldTouched('expiryDate') && !isFieldValid('expiryDate')
                                ? 'border-error ring-1 ring-error/20'
                                : ''
                                }`}
                            value={data.expiryDate || ''}
                            onChange={e => set('expiryDate', e.target.value)}
                            onBlur={() => handleBlur('expiryDate')}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </FormField>
                </div>
            </FormSection>

            {/* Section 7: Additional Clauses */}
            <FormSection icon={<FileText size={16} weight="fill" />} title="Klauzule dodatkowe" number="6">
                <div className="space-y-3">
                    <textarea
                        className="form-input resize-none"
                        rows={3}
                        placeholder="Dodatkowe postanowienia, klauzule, ograniczenia..."
                        value={data.additionalClauses?.join('\n') || ''}
                        onChange={e => set('additionalClauses', e.target.value.split('\n').filter(Boolean))}
                    />
                    <p className="text-2xs text-ink-low">
                        Każda klauzula w nowej linii
                    </p>
                </div>
            </FormSection>

            {/* Section 8: Internal Notes */}
            <FormSection icon={<Question size={16} weight="fill" />} title="Uwagi wewnętrzne" number="7">
                <div className="space-y-3">
                    <textarea
                        className="form-input resize-none bg-bg-tertiary/30"
                        rows={2}
                        placeholder="Notatki dla wewnętrznego użytku (nie trafiają do dokumentu)"
                        value={data.internalNotes || ''}
                        onChange={e => set('internalNotes', e.target.value)}
                    />
                </div>
            </FormSection>
        </div>
    );
};

export default PowerOfAttorneyForm;