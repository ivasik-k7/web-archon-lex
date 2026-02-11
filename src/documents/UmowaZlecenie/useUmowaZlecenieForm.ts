// useUmowaZlecenieForm.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import type { UmowaZlecenieData } from "../../types/documents";
import {
  numberToWords,
  formatCurrency,
  formatDatePL,
  ContractNumberGenerator,
  validatePesel,
  validateNIP,
  validateREGON,
  validateIBAN,
  validateIdCard,
  ValidationResult,
  formatIBAN,
  calculateVAT,
} from "../../shared/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FormFieldState {
  value: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type FormState = {
  [K in keyof UmowaZlecenieData]: FormFieldState;
};

export interface FormValidationSummary {
  isValid: boolean;
  errorsCount: number;
  warningsCount: number;
  fieldsWithErrors: Array<keyof UmowaZlecenieData>;
  fieldsWithWarnings: Array<keyof UmowaZlecenieData>;
}

export interface ContractPreviewData {
  contractNumber: string;
  issueDate: string;
  place: string;
  wynagrodzenieNetto: number;
  wynagrodzenieBrutto: number;
  vatAmount: number;
  vatRate: number;
  wynagrodzenieSłownie: string;
  terminPłatnościFormatted: string;
  terminWykonaniaFormatted: string;
  zleceniodawcaValidated: boolean;
  zleceniobiorcaValidated: boolean;
  bankDetails: { bankCode?: string; bankName?: string } | null;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_UMOWA_ZLECENIE: UmowaZlecenieData = {
  numer_umowy: "",
  data: new Date().toISOString().split("T")[0],
  miejsce: "Gdańsk",
  zleceniodawca_nazwa: "MENNICA CASHIFY SP. Z O.O.",
  zleceniodawca_adres: "ul. Marszałkowska 107, 00-110 Warszawa",
  zleceniodawca_nip: "5342579968",
  zleceniodawca_regon: "369692058",
  zleceniodawca_repr: "",
  zleceniobiorca_imie: "",
  zleceniobiorca_adres: "",
  zleceniobiorca_pesel: "",
  zleceniobiorca_dowod: "",
  zleceniobiorca_telefon: "",
  zleceniobiorca_email: "",
  opis_uslugi: "",
  wynagrodzenie: "",
  wynagrodzenie_netto: "",
  vat_rate: "23",
  data_wykonania: "",
  platnosc_termin: "",
  platnosc_konto: "",
  dodatkowe_klauzule: [],
  uwagi: "",
};

// ============================================================================
// VALIDATION RULES - COMPLETE WITH ALL FIELDS
// ============================================================================

export const VALIDATION_RULES: {
  [K in keyof UmowaZlecenieData]: (
    value: UmowaZlecenieData[K]
  ) => ValidationResult;
} = {
  numer_umowy: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    errors: !value.trim().length
      ? [
          {
            field: "numer_umowy",
            code: "REQUIRED",
            message: "Numer umowy jest wymagany",
          },
        ]
      : [],
    warnings: [],
  }),

  data: (value: string): ValidationResult => {
    const errors = [];
    if (!value) {
      errors.push({
        field: "data",
        code: "REQUIRED",
        message: "Data jest wymagana",
      });
    } else {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push({
          field: "data",
          code: "INVALID_DATE",
          message: "Nieprawidłowy format daty",
        });
      }
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  miejsce: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    errors: !value.trim().length
      ? [
          {
            field: "miejsce",
            code: "REQUIRED",
            message: "Miejsce zawarcia umowy jest wymagane",
          },
        ]
      : [],
    warnings: [],
  }),

  zleceniodawca_nazwa: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 3,
    errors:
      value.trim().length < 3
        ? [
            {
              field: "zleceniodawca_nazwa",
              code: "TOO_SHORT",
              message:
                "Nazwa zleceniodawcy jest wymagana i musi zawierać minimum 3 znaki",
            },
          ]
        : [],
    warnings: [],
  }),

  zleceniodawca_adres: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 10,
    errors:
      value.trim().length < 10
        ? [
            {
              field: "zleceniodawca_adres",
              code: "TOO_SHORT",
              message: "Adres jest wymagany i musi zawierać minimum 10 znaków",
            },
          ]
        : [],
    warnings: [],
  }),

  zleceniodawca_nip: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        errors: [
          {
            field: "zleceniodawca_nip",
            code: "REQUIRED",
            message: "NIP jest wymagany",
          },
        ],
        warnings: [],
      };
    }
    return validateNIP(value);
  },

  zleceniodawca_regon: (value: string): ValidationResult =>
    value ? validateREGON(value) : { isValid: true, errors: [], warnings: [] },

  zleceniodawca_repr: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 3 || value.trim().length === 0,
    errors:
      value.trim().length > 0 && value.trim().length < 3
        ? [
            {
              field: "zleceniodawca_repr",
              code: "TOO_SHORT",
              message:
                "Imię i nazwisko reprezentanta musi zawierać minimum 3 znaki",
            },
          ]
        : [],
    warnings: !value.trim()
      ? [
          {
            field: "zleceniodawca_repr",
            code: "OPTIONAL",
            message:
              "Reprezentant nie został określony - umowa może być podpisana bezpośrednio",
          },
        ]
      : [],
  }),

  zleceniobiorca_imie: (value: string): ValidationResult => {
    const errors = [];
    if (!value.trim()) {
      errors.push({
        field: "zleceniobiorca_imie",
        code: "REQUIRED",
        message: "Imię i nazwisko zleceniobiorcy jest wymagane",
      });
    } else if (value.trim().split(" ").length < 2) {
      errors.push({
        field: "zleceniobiorca_imie",
        code: "INCOMPLETE",
        message: "Podaj imię i nazwisko",
      });
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  zleceniobiorca_adres: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 10,
    errors:
      value.trim().length < 10
        ? [
            {
              field: "zleceniobiorca_adres",
              code: "TOO_SHORT",
              message: "Adres jest wymagany i musi zawierać minimum 10 znaków",
            },
          ]
        : [],
    warnings: [],
  }),

  zleceniobiorca_pesel: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        errors: [
          {
            field: "zleceniobiorca_pesel",
            code: "REQUIRED",
            message: "PESEL jest wymagany",
          },
        ],
        warnings: [],
      };
    }
    return validatePesel(value);
  },

  // NEW: ID Card validation
  zleceniobiorca_dowod: (value: string): ValidationResult => {
    if (!value) return { isValid: true, errors: [], warnings: [] };
    return validateIdCard(value);
  },

  // NEW: Phone validation
  zleceniobiorca_telefon: (value: string): ValidationResult => {
    if (!value) return { isValid: true, errors: [], warnings: [] };

    const errors = [];
    const cleaned = value.replace(/[^\d+]/g, "");

    if (!/^(\+48)?\d{9}$/.test(cleaned) && !/^(\+48)?\d{7}$/.test(cleaned)) {
      errors.push({
        field: "zleceniobiorca_telefon",
        code: "INVALID_PHONE",
        message:
          "Nieprawidłowy numer telefonu. Wymagany format: +48 123 456 789 lub 123456789",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  },

  // NEW: Email validation
  zleceniobiorca_email: (value: string): ValidationResult => {
    if (!value) return { isValid: true, errors: [], warnings: [] };

    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      errors.push({
        field: "zleceniobiorca_email",
        code: "INVALID_EMAIL",
        message: "Nieprawidłowy adres email",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  },

  opis_uslugi: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 20,
    errors:
      value.trim().length < 20
        ? [
            {
              field: "opis_uslugi",
              code: "TOO_SHORT",
              message: "Opis usługi musi zawierać minimum 20 znaków",
            },
          ]
        : [],
    warnings:
      value.trim().length < 50
        ? [
            {
              field: "opis_uslugi",
              code: "SHORT_DESCRIPTION",
              message:
                "Zalecane jest bardziej szczegółowe opisanie przedmiotu umowy",
            },
          ]
        : [],
  }),

  wynagrodzenie: (value: string): ValidationResult => {
    const errors = [];
    const numValue = parseFloat(value.replace(",", "."));

    if (!value) {
      errors.push({
        field: "wynagrodzenie",
        code: "REQUIRED",
        message: "Wynagrodzenie jest wymagane",
      });
    } else if (isNaN(numValue)) {
      errors.push({
        field: "wynagrodzenie",
        code: "INVALID_NUMBER",
        message: "Podaj prawidłową kwotę",
      });
    } else if (numValue <= 0) {
      errors.push({
        field: "wynagrodzenie",
        code: "NEGATIVE_OR_ZERO",
        message: "Wynagrodzenie musi być większe od 0",
      });
    }

    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  // NEW: Net amount validation
  wynagrodzenie_netto: (value: string): ValidationResult => {
    if (!value) return { isValid: true, errors: [], warnings: [] };

    const errors = [];
    const numValue = parseFloat(value.replace(",", "."));

    if (isNaN(numValue)) {
      errors.push({
        field: "wynagrodzenie_netto",
        code: "INVALID_NUMBER",
        message: "Podaj prawidłową kwotę netto",
      });
    } else if (numValue < 0) {
      errors.push({
        field: "wynagrodzenie_netto",
        code: "NEGATIVE_VALUE",
        message: "Wynagrodzenie netto nie może być ujemne",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  },

  // NEW: VAT rate validation
  vat_rate: (value: string): ValidationResult => {
    const errors = [];
    const validRates = ["0", "5", "8", "23"];

    if (!validRates.includes(value)) {
      errors.push({
        field: "vat_rate",
        code: "INVALID_VAT_RATE",
        message: "Nieprawidłowa stawka VAT. Dozwolone: 0%, 5%, 8%, 23%",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  },

  platnosc_konto: (value: string): ValidationResult =>
    value ? validateIBAN(value) : { isValid: true, errors: [], warnings: [] },

  platnosc_termin: (value: string): ValidationResult => ({
    isValid: !!value,
    errors: !value
      ? [
          {
            field: "platnosc_termin",
            code: "REQUIRED",
            message: "Termin płatności jest wymagany",
          },
        ]
      : [],
    warnings: [],
  }),

  data_wykonania: (value: string): ValidationResult => ({
    isValid: !!value,
    errors: !value
      ? [
          {
            field: "data_wykonania",
            code: "REQUIRED",
            message: "Termin wykonania usługi jest wymagany",
          },
        ]
      : [],
    warnings: [],
  }),

  // NEW: Additional clauses validation
  dodatkowe_klauzule: (value: string[]): ValidationResult => {
    const warnings = [];

    if (value && value.length > 5) {
      warnings.push({
        field: "dodatkowe_klauzule",
        code: "TOO_MANY_CLAUSES",
        message:
          "Duża liczba klauzul dodatkowych może wpłynąć na czytelność umowy",
      });
    }

    return {
      isValid: true,
      errors: [],
      warnings,
    };
  },

  // NEW: Notes validation
  uwagi: (): ValidationResult => ({
    isValid: true,
    errors: [],
    warnings: [],
  }),
};

// ============================================================================
// CUSTOM HOOK: useUmowaZlecenieForm
// ============================================================================

export function useUmowaZlecenieForm(
  initialData: UmowaZlecenieData = DEFAULT_UMOWA_ZLECENIE
) {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  const [data, setData] = useState<UmowaZlecenieData>(initialData);
  const [formState, setFormState] = useState<FormState>(() =>
    initializeFormState(initialData)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  function initializeFormState(initial: UmowaZlecenieData): FormState {
    const state = {} as FormState;
    for (const key in initial) {
      const fieldKey = key as keyof UmowaZlecenieData;
      const value = initial[fieldKey];
      const validation = VALIDATION_RULES[fieldKey]?.(value as any) || {
        isValid: true,
        errors: [],
        warnings: [],
      };

      state[fieldKey] = {
        value: typeof value === "string" ? value : JSON.stringify(value),
        touched: false,
        dirty: false,
        valid: validation.isValid,
        errors: validation.errors.map((e) => e.message),
        warnings: validation.warnings.map((w) => w.message),
      };
    }
    return state;
  }

  // --------------------------------------------------------------------------
  // Auto-generate contract number on mount
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (autoGenerateEnabled && !data.numer_umowy) {
      handleGenerateContractNumber();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --------------------------------------------------------------------------
  // Field Handlers
  // --------------------------------------------------------------------------

  const handleFieldChange = useCallback(
    <K extends keyof UmowaZlecenieData>(
      field: K,
      value: UmowaZlecenieData[K],
      options?: { skipValidation?: boolean; touch?: boolean }
    ) => {
      // Update data
      setData((prev) => ({ ...prev, [field]: value }));

      // Validate
      const validation = !options?.skipValidation
        ? VALIDATION_RULES[field]?.(value as any)
        : { isValid: true, errors: [], warnings: [] };

      // Update form state
      setFormState((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          value: typeof value === "string" ? value : JSON.stringify(value),
          dirty: true,
          touched: options?.touch ? true : prev[field]?.touched || false,
          valid: validation?.isValid ?? true,
          errors: validation?.errors.map((e) => e.message) || [],
          warnings: validation?.warnings.map((w) => w.message) || [],
        },
      }));
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof UmowaZlecenieData) => {
      setFormState((prev) => {
        const fieldState = prev[field];
        if (!fieldState) return prev;

        return {
          ...prev,
          [field]: {
            ...fieldState,
            touched: true,
          },
        };
      });

      // Re-validate on blur
      const value = data[field];
      handleFieldChange(field, value as any, {
        skipValidation: false,
        touch: true,
      });
    },
    [data, handleFieldChange]
  );

  // --------------------------------------------------------------------------
  // Smart Formatters
  // --------------------------------------------------------------------------

  const handleFormatNIP = useCallback((value: string): string => {
    const cleaned = value.replace(/[^\d]/g, "");
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = cleaned.slice(0, 3) + "-" + cleaned.slice(3);
    }
    if (cleaned.length > 6) {
      formatted = formatted.slice(0, 7) + "-" + formatted.slice(7);
    }
    if (cleaned.length > 8) {
      formatted = formatted.slice(0, 11) + "-" + formatted.slice(11);
    }
    return formatted.slice(0, 15);
  }, []);

  const handleFormatREGON = useCallback((value: string): string => {
    return value.replace(/[^\d]/g, "").slice(0, 14);
  }, []);

  const handleFormatPESEL = useCallback((value: string): string => {
    return value.replace(/[^\d]/g, "").slice(0, 11);
  }, []);

  const handleFormatIBAN = useCallback((value: string): string => {
    return formatIBAN(value);
  }, []);

  const handleFormatAmount = useCallback((value: string): string => {
    const cleaned = value.replace(/[^\d,.]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    if (isNaN(num)) return "";
    return num.toFixed(2).replace(".", ",");
  }, []);

  // NEW: Phone formatter
  const handleFormatPhone = useCallback((value: string): string => {
    const cleaned = value.replace(/[^\d+]/g, "");

    if (cleaned.startsWith("+48")) {
      const number = cleaned.slice(3);
      if (number.length <= 3) return `+48 ${number}`;
      if (number.length <= 6)
        return `+48 ${number.slice(0, 3)} ${number.slice(3)}`;
      return `+48 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(
        6,
        9
      )}`;
    } else {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6)
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6,
        9
      )}`;
    }
  }, []);

  // NEW: Email formatter
  const handleFormatEmail = useCallback((value: string): string => {
    return value.trim().toLowerCase();
  }, []);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------

  const handleGenerateContractNumber = useCallback(() => {
    const newNumber = ContractNumberGenerator.generate("UZ", {
      useSequence: true,
      includeDay: true,
      separator: "/",
    });
    handleFieldChange("numer_umowy", newNumber);
  }, [handleFieldChange]);

  const handleAutoFillContractor = useCallback(() => {
    handleFieldChange("zleceniodawca_nazwa", "MENNICA CASHIFY SP. Z O.O.");
    handleFieldChange(
      "zleceniodawca_adres",
      "ul. Marszałkowska 107, 00-110 Warszawa"
    );
    handleFieldChange("zleceniodawca_nip", "5342579968");
    handleFieldChange("zleceniodawca_regon", "369692058");
  }, [handleFieldChange]);

  // NEW: Clause management
  const handleAddClause = useCallback(
    (clause: string) => {
      const currentClauses = data.dodatkowe_klauzule || [];
      handleFieldChange("dodatkowe_klauzule", [...currentClauses, clause]);
    },
    [data.dodatkowe_klauzule, handleFieldChange]
  );

  const handleRemoveClause = useCallback(
    (index: number) => {
      const currentClauses = data.dodatkowe_klauzule || [];
      handleFieldChange(
        "dodatkowe_klauzule",
        currentClauses.filter((_, i) => i !== index)
      );
    },
    [data.dodatkowe_klauzule, handleFieldChange]
  );

  const handleValidateAll = useCallback(() => {
    let isValid = true;
    const updatedState = { ...formState };

    for (const key in data) {
      const field = key as keyof UmowaZlecenieData;
      const value = data[field];
      const validation = VALIDATION_RULES[field]?.(value as any);

      if (validation) {
        updatedState[field] = {
          ...updatedState[field],
          touched: true,
          valid: validation.isValid,
          errors: validation.errors.map((e) => e.message),
          warnings: validation.warnings.map((w) => w.message),
        };

        if (!validation.isValid) isValid = false;
      }
    }

    setFormState(updatedState);
    return isValid;
  }, [data, formState]);

  const handleReset = useCallback(() => {
    setData(DEFAULT_UMOWA_ZLECENIE);
    setFormState(initializeFormState(DEFAULT_UMOWA_ZLECENIE));
    setIsSubmitted(false);
    setAutoGenerateEnabled(true);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    const isValid = handleValidateAll();

    if (isValid) {
      setLastSaved(new Date());
    }

    return isValid;
  }, [handleValidateAll]);

  const handleSaveDraft = useCallback(() => {
    setLastSaved(new Date());
    localStorage.setItem("umowa_zlecenie_draft", JSON.stringify(data));
  }, [data]);

  // --------------------------------------------------------------------------
  // Computed Properties
  // --------------------------------------------------------------------------

  const validationSummary = useMemo((): FormValidationSummary => {
    const errors: Array<keyof UmowaZlecenieData> = [];
    const warnings: Array<keyof UmowaZlecenieData> = [];
    let errorsCount = 0;
    let warningsCount = 0;

    for (const [key, state] of Object.entries(formState)) {
      if (state?.errors?.length > 0) {
        errors.push(key as keyof UmowaZlecenieData);
        errorsCount += state.errors.length;
      }
      if (state?.warnings?.length > 0) {
        warnings.push(key as keyof UmowaZlecenieData);
        warningsCount += state.warnings.length;
      }
    }

    return {
      isValid: errorsCount === 0,
      errorsCount,
      warningsCount,
      fieldsWithErrors: errors,
      fieldsWithWarnings: warnings,
    };
  }, [formState]);

  const previewData = useMemo((): ContractPreviewData => {
    const wynagrodzenie =
      parseFloat(data.wynagrodzenie?.replace(",", ".") || "0") || 0;
    const vatRate = parseInt(data.vat_rate || "23");
    const vatAmount = calculateVAT(wynagrodzenie, vatRate).vat;
    const wynagrodzenieBrutto = wynagrodzenie + vatAmount;

    const ibanValidation = data.platnosc_konto
      ? validateIBAN(data.platnosc_konto)
      : null;

    return {
      contractNumber: data.numer_umowy || "[numer umowy]",
      issueDate: data.data,
      place: data.miejsce || "[miejsce]",
      wynagrodzenieNetto: wynagrodzenie,
      wynagrodzenieBrutto,
      vatAmount,
      vatRate,
      wynagrodzenieSłownie: numberToWords(wynagrodzenieBrutto),
      terminPłatnościFormatted: formatDatePL(data.platnosc_termin),
      terminWykonaniaFormatted: formatDatePL(data.data_wykonania),
      zleceniodawcaValidated: data.zleceniodawca_nip
        ? validateNIP(data.zleceniodawca_nip).isValid
        : false,
      zleceniobiorcaValidated: data.zleceniobiorca_pesel
        ? validatePesel(data.zleceniobiorca_pesel).isValid
        : false,
      bankDetails: ibanValidation?.bankName
        ? {
            bankCode: ibanValidation.bankCode,
            bankName: ibanValidation.bankName,
          }
        : null,
    };
  }, [data]);

  const completionPercentage = useMemo(() => {
    const requiredFields: Array<keyof UmowaZlecenieData> = [
      "numer_umowy",
      "data",
      "miejsce",
      "zleceniodawca_nazwa",
      "zleceniodawca_adres",
      "zleceniodawca_nip",
      "zleceniobiorca_imie",
      "zleceniobiorca_adres",
      "zleceniobiorca_pesel",
      "opis_uslugi",
      "wynagrodzenie",
      "platnosc_termin",
      "data_wykonania",
    ];

    const filled = requiredFields.filter((field) => {
      const value = data[field];
      return typeof value === "string" && value.trim().length > 0;
    }).length;

    return Math.round((filled / requiredFields.length) * 100);
  }, [data]);

  // --------------------------------------------------------------------------
  // Field Helpers
  // --------------------------------------------------------------------------

  const getFieldError = useCallback(
    (field: keyof UmowaZlecenieData): string => {
      return formState[field]?.errors?.[0] || "";
    },
    [formState]
  );

  const getFieldWarning = useCallback(
    (field: keyof UmowaZlecenieData): string => {
      return formState[field]?.warnings?.[0] || "";
    },
    [formState]
  );

  const isFieldValid = useCallback(
    (field: keyof UmowaZlecenieData): boolean => {
      return formState[field]?.valid ?? true;
    },
    [formState]
  );

  const isFieldTouched = useCallback(
    (field: keyof UmowaZlecenieData): boolean => {
      return formState[field]?.touched ?? false;
    },
    [formState]
  );

  const getFieldValue = useCallback(
    <K extends keyof UmowaZlecenieData>(field: K): UmowaZlecenieData[K] => {
      return data[field];
    },
    [data]
  );

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------

  return {
    // State
    data,
    formState,
    isSubmitted,
    autoGenerateEnabled,
    lastSaved,
    validationSummary,
    previewData,
    completionPercentage,

    // Setters
    setData,
    setAutoGenerateEnabled,

    // Field handlers
    handleFieldChange,
    handleBlur,

    // Formatters
    handleFormatNIP,
    handleFormatREGON,
    handleFormatPESEL,
    handleFormatIBAN,
    handleFormatAmount,
    handleFormatPhone,
    handleFormatEmail,

    // Actions
    handleGenerateContractNumber,
    handleAutoFillContractor,
    handleAddClause,
    handleRemoveClause,
    handleValidateAll,
    handleReset,
    handleSubmit,
    handleSaveDraft,

    // Utilities
    getFieldError,
    getFieldWarning,
    isFieldValid,
    isFieldTouched,
    getFieldValue,
  };
}

export type UseUmowaZlecenieFormReturn = ReturnType<
  typeof useUmowaZlecenieForm
>;
