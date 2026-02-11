import { useState, useEffect } from 'react';
import {
  Buildings,
  User,
  ClipboardText,
  CurrencyDollar,
  Calendar,
  MapPin,
  IdentificationCard,
  Bank,
  FileText,
  CheckCircle,
  WarningCircle,
  Info,
  Plus,
  X,
  ArrowClockwise,
  FloppyDisk,
  Eye,
  Seal,
} from '@phosphor-icons/react';
import { useUmowaZlecenieForm, DEFAULT_UMOWA_ZLECENIE } from './useUmowaZlecenieForm';
import { UmowaZleceniePreview } from './Preview';
import { UmowaZlecenieData } from '../../types/documents';
import { formatCurrency, formatDatePL } from '../../shared/utils';

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

function FormProgress({ percentage, isValid }: { percentage: number; isValid: boolean }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-low">Uzupełnienie formularza</span>
          <span className="text-sm font-semibold text-ink-high">{percentage}%</span>
        </div>
        {isValid ? (
          <div className="flex items-center gap-1 text-success">
            <CheckCircle size={14} weight="fill" />
            <span className="text-xs font-medium">Wszystkie pola poprawne</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-warning">
            <WarningCircle size={14} weight="fill" />
            <span className="text-xs font-medium">Wymaga korekty</span>
          </div>
        )}
      </div>
      <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isValid ? 'bg-success' : 'bg-warning'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// VALIDATION MESSAGE COMPONENT
// ============================================================================

function ValidationMessage({
  error,
  warning,
  touched
}: {
  error?: string;
  warning?: string;
  touched?: boolean;
}) {
  if (!touched) return null;

  if (error) {
    return (
      <div className="flex items-start gap-1.5 mt-1.5 text-error">
        <WarningCircle size={14} weight="fill" className="shrink-0 mt-0.5" />
        <span className="text-xs leading-tight">{error}</span>
      </div>
    );
  }

  if (warning) {
    return (
      <div className="flex items-start gap-1.5 mt-1.5 text-warning">
        <Info size={14} weight="fill" className="shrink-0 mt-0.5" />
        <span className="text-xs leading-tight">{warning}</span>
      </div>
    );
  }

  return null;
}

// ============================================================================
// FIELD HOC COMPONENT
// ============================================================================

function FormField({
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
}) {
  const showError = touched && error;
  const showWarning = touched && warning && !error;

  return (
    <div className="space-y-1.5">
      <label className="form-label flex items-center gap-1.5">
        {icon && <span className="text-ink-low">{icon}</span>}
        <span>{label}</span>
        {required && <span className="text-error text-xs">*</span>}
      </label>
      {children}
      {hint && !showError && !showWarning && (
        <div className="flex items-start gap-1.5 mt-1.5 text-ink-low">
          <Info size={14} className="shrink-0 mt-0.5" />
          <span className="text-xs leading-tight">{hint}</span>
        </div>
      )}
      <ValidationMessage error={error} warning={warning} touched={touched} />
    </div>
  );
}

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

interface UmowaZlecenieFormProps {
  initialData?: UmowaZlecenieData;
  onSave?: (data: UmowaZlecenieData) => void;
  onPreview?: (show: boolean) => void;
}

export function UmowaZlecenieForm({
  initialData = DEFAULT_UMOWA_ZLECENIE,
  onSave,
  onPreview
}: UmowaZlecenieFormProps) {
  const [showPreview, setShowPreview] = useState(false);

  const form = useUmowaZlecenieForm(initialData);

  const {
    data,
    formState,
    validationSummary,
    previewData,
    completionPercentage,
    handleFieldChange,
    handleBlur,
    handleFormatNIP,
    handleFormatREGON,
    handleFormatPESEL,
    handleFormatIBAN,
    handleFormatAmount,
    handleGenerateContractNumber,
    handleAutoFillContractor,
    handleValidateAll,
    handleReset,
    handleSubmit,
    handleSaveDraft,
    getFieldError,
    getFieldWarning,
    isFieldValid,
    isFieldTouched,
    setAutoGenerateEnabled,
  } = form;

  // Toggle preview
  useEffect(() => {
    onPreview?.(showPreview);
  }, [showPreview, onPreview]);

  // Handle form submit
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = handleSubmit();
    if (isValid) {
      onSave?.(data);
      setShowPreview(true);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* FORM COLUMN */}
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-high">Nowa umowa zlecenie</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="btn-ghost px-3 py-1.5 text-sm flex items-center gap-1.5"
            >
              <Eye size={16} />
              {showPreview ? 'Ukryj podgląd' : 'Pokaż podgląd'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-ghost px-3 py-1.5 text-sm flex items-center gap-1.5"
            >
              <ArrowClockwise size={16} />
              Resetuj
            </button>
          </div>
        </div>

        <FormProgress percentage={completionPercentage} isValid={validationSummary.isValid} />

        {validationSummary.errorsCount > 0 && (
          <div className="bg-error-bg border border-error-border rounded-sm p-4">
            <div className="flex items-start gap-3">
              <WarningCircle size={20} weight="fill" className="text-error shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-error mb-1">
                  Wykryto {validationSummary.errorsCount} {validationSummary.errorsCount === 1 ? 'błąd' : 'błędy'}
                </h4>
                <ul className="text-xs text-error space-y-1 list-disc list-inside">
                  {validationSummary.fieldsWithErrors.map(field => (
                    <li key={field}>{getFieldError(field)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* SECTION 1: BASIC DATA */}
          <FormSection icon={<ClipboardText size={16} weight="fill" />} title="Dane podstawowe" number="1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FormField
                    label="Numer umowy"
                    required
                    error={getFieldError('numer_umowy')}
                    warning={getFieldWarning('numer_umowy')}
                    touched={isFieldTouched('numer_umowy')}
                  >
                    <div className="flex gap-2">
                      <input
                        className={`form-input flex-1 ${isFieldTouched('numer_umowy') && !isFieldValid('numer_umowy')
                          ? 'border-error'
                          : ''
                          }`}
                        placeholder="np. 01/02/2026/UZ"
                        value={data.numer_umowy}
                        onChange={e => handleFieldChange('numer_umowy', e.target.value)}
                        onBlur={() => handleBlur('numer_umowy')}
                      />
                      <button
                        type="button"
                        className="btn-ghost px-3 border border-border-subtle rounded-sm shrink-0 text-xs flex items-center gap-1"
                        onClick={handleGenerateContractNumber}
                      >
                        <ArrowClockwise size={12} />
                        Auto
                      </button>
                    </div>
                  </FormField>
                </div>

                <div>
                  <FormField
                    label="Data"
                    icon={<Calendar size={12} />}
                    required
                    error={getFieldError('data')}
                    touched={isFieldTouched('data')}
                  >
                    <input
                      type="date"
                      className={`form-input ${isFieldTouched('data') && !isFieldValid('data')
                        ? 'border-error'
                        : ''
                        }`}
                      value={data.data}
                      onChange={e => handleFieldChange('data', e.target.value)}
                      onBlur={() => handleBlur('data')}
                    />
                  </FormField>
                </div>

                <div>
                  <FormField
                    label="Miejsce"
                    icon={<MapPin size={12} />}
                    required
                    error={getFieldError('miejsce')}
                    touched={isFieldTouched('miejsce')}
                  >
                    <input
                      className={`form-input ${isFieldTouched('miejsce') && !isFieldValid('miejsce')
                        ? 'border-error'
                        : ''
                        }`}
                      placeholder="Gdańsk"
                      value={data.miejsce}
                      onChange={e => handleFieldChange('miejsce', e.target.value)}
                      onBlur={() => handleBlur('miejsce')}
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </FormSection>

          {/* SECTION 2: ZLECENIODAWCA */}
          <FormSection icon={<Buildings size={16} weight="fill" />} title="Zleceniodawca" number="2">
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAutoFillContractor}
                  className="btn-ghost text-xs flex items-center gap-1 px-2 py-1"
                >
                  <Plus size={12} />
                  Wypełnij danymi Mennica Cashify
                </button>
              </div>

              <FormField
                label="Nazwa / Imię i nazwisko"
                required
                error={getFieldError('zleceniodawca_nazwa')}
                touched={isFieldTouched('zleceniodawca_nazwa')}
              >
                <input
                  className={`form-input ${isFieldTouched('zleceniodawca_nazwa') && !isFieldValid('zleceniodawca_nazwa')
                    ? 'border-error'
                    : ''
                    }`}
                  value={data.zleceniodawca_nazwa}
                  onChange={e => handleFieldChange('zleceniodawca_nazwa', e.target.value)}
                  onBlur={() => handleBlur('zleceniodawca_nazwa')}
                />
              </FormField>

              <FormField
                label="Adres"
                required
                error={getFieldError('zleceniodawca_adres')}
                touched={isFieldTouched('zleceniodawca_adres')}
              >
                <input
                  className={`form-input ${isFieldTouched('zleceniodawca_adres') && !isFieldValid('zleceniodawca_adres')
                    ? 'border-error'
                    : ''
                    }`}
                  value={data.zleceniodawca_adres}
                  onChange={e => handleFieldChange('zleceniodawca_adres', e.target.value)}
                  onBlur={() => handleBlur('zleceniodawca_adres')}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="NIP"
                  required
                  error={getFieldError('zleceniodawca_nip')}
                  warning={getFieldWarning('zleceniodawca_nip')}
                  touched={isFieldTouched('zleceniodawca_nip')}
                >
                  <input
                    className={`form-input ${isFieldTouched('zleceniodawca_nip') && !isFieldValid('zleceniodawca_nip')
                      ? 'border-error'
                      : ''
                      }`}
                    value={data.zleceniodawca_nip}
                    onChange={e => handleFieldChange('zleceniodawca_nip', handleFormatNIP(e.target.value))}
                    onBlur={() => handleBlur('zleceniodawca_nip')}
                    placeholder="XXX-XXX-XX-XX"
                    maxLength={15}
                  />
                </FormField>

                <FormField
                  label="REGON"
                  error={getFieldError('zleceniodawca_regon')}
                  warning={getFieldWarning('zleceniodawca_regon')}
                  touched={isFieldTouched('zleceniodawca_regon')}
                  hint="Opcjonalnie"
                >
                  <input
                    className={`form-input ${isFieldTouched('zleceniodawca_regon') && !isFieldValid('zleceniodawca_regon')
                      ? 'border-error'
                      : ''
                      }`}
                    value={data.zleceniodawca_regon}
                    onChange={e => handleFieldChange('zleceniodawca_regon', handleFormatREGON(e.target.value))}
                    onBlur={() => handleBlur('zleceniodawca_regon')}
                    maxLength={14}
                  />
                </FormField>
              </div>

              <FormField
                label="Reprezentowany przez"
                error={getFieldError('zleceniodawca_repr')}
                warning={getFieldWarning('zleceniodawca_repr')}
                touched={isFieldTouched('zleceniodawca_repr')}
                hint="Opcjonalnie - osoba podpisująca umowę"
              >
                <input
                  className={`form-input ${isFieldTouched('zleceniodawca_repr') && !isFieldValid('zleceniodawca_repr')
                    ? 'border-error'
                    : ''
                    }`}
                  placeholder="Imię i nazwisko"
                  value={data.zleceniodawca_repr}
                  onChange={e => handleFieldChange('zleceniodawca_repr', e.target.value)}
                  onBlur={() => handleBlur('zleceniodawca_repr')}
                />
              </FormField>
            </div>
          </FormSection>

          {/* SECTION 3: ZLECENIOBIORCA */}
          <FormSection icon={<User size={16} weight="fill" />} title="Zleceniobiorca" number="3">
            <div className="space-y-4">
              <FormField
                label="Imię i nazwisko"
                required
                error={getFieldError('zleceniobiorca_imie')}
                touched={isFieldTouched('zleceniobiorca_imie')}
              >
                <input
                  className={`form-input ${isFieldTouched('zleceniobiorca_imie') && !isFieldValid('zleceniobiorca_imie')
                    ? 'border-error'
                    : ''
                    }`}
                  placeholder="Jan Kowalski"
                  value={data.zleceniobiorca_imie}
                  onChange={e => handleFieldChange('zleceniobiorca_imie', e.target.value)}
                  onBlur={() => handleBlur('zleceniobiorca_imie')}
                />
              </FormField>

              <FormField
                label="Adres"
                required
                error={getFieldError('zleceniobiorca_adres')}
                touched={isFieldTouched('zleceniobiorca_adres')}
              >
                <input
                  className={`form-input ${isFieldTouched('zleceniobiorca_adres') && !isFieldValid('zleceniobiorca_adres')
                    ? 'border-error'
                    : ''
                    }`}
                  placeholder="ul. Przykładowa 1, 00-000 Miasto"
                  value={data.zleceniobiorca_adres}
                  onChange={e => handleFieldChange('zleceniobiorca_adres', e.target.value)}
                  onBlur={() => handleBlur('zleceniobiorca_adres')}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="PESEL"
                  icon={<IdentificationCard size={12} />}
                  required
                  error={getFieldError('zleceniobiorca_pesel')}
                  warning={getFieldWarning('zleceniobiorca_pesel')}
                  touched={isFieldTouched('zleceniobiorca_pesel')}
                >
                  <input
                    className={`form-input ${isFieldTouched('zleceniobiorca_pesel') && !isFieldValid('zleceniobiorca_pesel')
                      ? 'border-error'
                      : ''
                      }`}
                    placeholder="00000000000"
                    value={data.zleceniobiorca_pesel}
                    onChange={e => handleFieldChange('zleceniobiorca_pesel', handleFormatPESEL(e.target.value))}
                    onBlur={() => handleBlur('zleceniobiorca_pesel')}
                    maxLength={11}
                  />
                </FormField>

                <FormField
                  label="Nr dowodu"
                  icon={<Seal size={12} />}
                  error={getFieldError('zleceniobiorca_dowod')}
                  touched={isFieldTouched('zleceniobiorca_dowod')}
                  hint="Opcjonalnie"
                >
                  <input
                    className={`form-input ${isFieldTouched('zleceniobiorca_dowod') && !isFieldValid('zleceniobiorca_dowod')
                      ? 'border-error'
                      : ''
                      }`}
                    placeholder="ABC123456"
                    value={data.zleceniobiorca_dowod}
                    onChange={e => handleFieldChange('zleceniobiorca_dowod', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('zleceniobiorca_dowod')}
                    maxLength={9}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Telefon"
                  icon={<User size={12} />}
                  hint="Opcjonalnie"
                >
                  <input
                    className="form-input"
                    placeholder="+48 000 000 000"
                    value={data.zleceniobiorca_telefon || ''}
                    onChange={e => handleFieldChange('zleceniobiorca_telefon', e.target.value)}
                  />
                </FormField>

                <FormField
                  label="E-mail"
                  icon={<User size={12} />}
                  hint="Opcjonalnie"
                >
                  <input
                    type="email"
                    className="form-input"
                    placeholder="jan@kowalski.pl"
                    value={data.zleceniobiorca_email || ''}
                    onChange={e => handleFieldChange('zleceniobiorca_email', e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* SECTION 4: SERVICE */}
          <FormSection icon={<ClipboardText size={16} weight="fill" />} title="Przedmiot zlecenia" number="4">
            <div className="space-y-4">
              <FormField
                label="Opis usługi / czynności"
                required
                error={getFieldError('opis_uslugi')}
                warning={getFieldWarning('opis_uslugi')}
                touched={isFieldTouched('opis_uslugi')}
              >
                <textarea
                  className={`form-input resize-none min-h-[120px] ${isFieldTouched('opis_uslugi') && !isFieldValid('opis_uslugi')
                    ? 'border-error'
                    : ''
                    }`}
                  rows={5}
                  placeholder="Szczegółowy opis wykonywanych czynności..."
                  value={data.opis_uslugi}
                  onChange={e => handleFieldChange('opis_uslugi', e.target.value)}
                  onBlur={() => handleBlur('opis_uslugi')}
                />
              </FormField>

              <FormField
                label="Termin wykonania"
                icon={<Calendar size={12} />}
                required
                error={getFieldError('data_wykonania')}
                touched={isFieldTouched('data_wykonania')}
              >
                <input
                  type="date"
                  className={`form-input ${isFieldTouched('data_wykonania') && !isFieldValid('data_wykonania')
                    ? 'border-error'
                    : ''
                    }`}
                  value={data.data_wykonania}
                  onChange={e => handleFieldChange('data_wykonania', e.target.value)}
                  onBlur={() => handleBlur('data_wykonania')}
                  min={data.data}
                />
              </FormField>
            </div>
          </FormSection>

          {/* SECTION 5: PAYMENT */}
          <FormSection icon={<CurrencyDollar size={16} weight="fill" />} title="Wynagrodzenie" number="5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Wynagrodzenie netto (PLN)"
                  required
                  error={getFieldError('wynagrodzenie')}
                  touched={isFieldTouched('wynagrodzenie')}
                >
                  <input
                    className={`form-input ${isFieldTouched('wynagrodzenie') && !isFieldValid('wynagrodzenie')
                      ? 'border-error'
                      : ''
                      }`}
                    placeholder="0,00"
                    value={data.wynagrodzenie}
                    onChange={e => handleFieldChange('wynagrodzenie', handleFormatAmount(e.target.value))}
                    onBlur={() => handleBlur('wynagrodzenie')}
                  />
                </FormField>

                <FormField
                  label="Stawka VAT"
                  hint="Domyślnie 23%"
                >
                  <select
                    className="form-input"
                    value={data.vat_rate || '23'}
                    onChange={e => handleFieldChange('vat_rate', e.target.value)}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="8">8%</option>
                    <option value="23">23%</option>
                  </select>
                </FormField>
              </div>

              {data.wynagrodzenie && !getFieldError('wynagrodzenie') && (
                <div className="bg-brand-bg border border-brand-border rounded-sm p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-low">Kwota brutto:</span>
                    <span className="font-semibold text-brand">
                      {formatCurrency(previewData.wynagrodzenieBrutto)} zł
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-low mt-1">
                    <span>Słownie:</span>
                    <span className="italic">{previewData.wynagrodzenieSłownie}</span>
                  </div>
                </div>
              )}

              <FormField
                label="Numer konta (IBAN)"
                icon={<Bank size={12} />}
                error={getFieldError('platnosc_konto')}
                warning={getFieldWarning('platnosc_konto')}
                touched={isFieldTouched('platnosc_konto')}
                hint="Format: PL00 0000 0000 0000 0000 0000 0000"
              >
                <input
                  className={`form-input font-mono ${isFieldTouched('platnosc_konto') && !isFieldValid('platnosc_konto')
                    ? 'border-error'
                    : ''
                    }`}
                  placeholder="PL00 0000 0000 0000 0000 0000 0000"
                  value={data.platnosc_konto}
                  onChange={e => handleFieldChange('platnosc_konto', handleFormatIBAN(e.target.value))}
                  onBlur={() => handleBlur('platnosc_konto')}
                />
              </FormField>

              {previewData.bankDetails && (
                <div className="bg-success-bg border border-success-border rounded-sm p-2 text-xs">
                  <span className="font-medium">Bank: </span>
                  {previewData.bankDetails.bankName}
                </div>
              )}

              <FormField
                label="Termin płatności"
                icon={<Calendar size={12} />}
                required
                error={getFieldError('platnosc_termin')}
                touched={isFieldTouched('platnosc_termin')}
              >
                <input
                  type="date"
                  className={`form-input ${isFieldTouched('platnosc_termin') && !isFieldValid('platnosc_termin')
                    ? 'border-error'
                    : ''
                    }`}
                  value={data.platnosc_termin}
                  onChange={e => handleFieldChange('platnosc_termin', e.target.value)}
                  onBlur={() => handleBlur('platnosc_termin')}
                  min={data.data}
                />
              </FormField>
            </div>
          </FormSection>

          {/* FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn-ghost px-4 py-2 text-sm flex items-center gap-2"
            >
              <FloppyDisk size={16} />
              Zapisz szkic
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 text-sm flex items-center gap-2"
            >
              <FileText size={16} />
              Generuj umowę
            </button>
          </div>
        </form>
      </div>

      {/* PREVIEW COLUMN */}
      {showPreview && (
        <div className="lg:sticky lg:top-8 self-start">
          <div className="bg-white rounded-sm border border-border-subtle shadow-card overflow-hidden">
            <div className="bg-ink-lowest px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-high">Podgląd umowy</h3>
              <span className="text-ink-low text-xs">
                {formatDatePL(new Date().toISOString())}
              </span>
            </div>
            <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-4">
              <UmowaZleceniePreview data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FORM SECTION COMPONENT
// ============================================================================

function FormSection({
  icon,
  title,
  number,
  children
}: {
  icon: React.ReactNode;
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-sm bg-brand/20 border border-brand/30 flex items-center justify-center text-brand shrink-0">
          {icon}
        </div>
        <div>
          <span className="text-xs text-ink-low">§ {number}</span>
          <h3 className="text-sm font-semibold text-ink-high leading-none">{title}</h3>
        </div>
      </div>
      <div className="pl-8 space-y-4">{children}</div>
    </div>
  );
}

export function useUmowaZlecenieData() {
  const [data, setData] = useState<UmowaZlecenieData>(DEFAULT_UMOWA_ZLECENIE);

  const reset = () => setData(DEFAULT_UMOWA_ZLECENIE);

  const updateField = <K extends keyof UmowaZlecenieData>(
    field: K,
    value: UmowaZlecenieData[K]
  ) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateMultiple = (updates: Partial<UmowaZlecenieData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  return {
    data,
    setData,
    reset,
    updateField,
    updateMultiple
  };
}