// hooks/useRentalAgreementForm.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  RentalAgreementData,
  DEFAULT_RENTAL_AGREEMENT,
} from "../types/documents";
import { RENTAL_VALIDATION_RULES } from "../validation/rentalAgreementValidation";
import {
  numberToWords,
  formatCurrency,
  formatDatePL,
  ContractNumberGenerator,
  validatePesel,
} from "../shared/utils";

export interface FormFieldState {
  value: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type RentalFormState = {
  [K in keyof RentalAgreementData]: FormFieldState;
};

export function useRentalAgreementForm(
  initialData: RentalAgreementData = DEFAULT_RENTAL_AGREEMENT
) {
  const [data, setData] = useState<RentalAgreementData>(initialData);
  const [formState, setFormState] = useState<RentalFormState>(() =>
    initializeFormState(initialData)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  function initializeFormState(initial: RentalAgreementData): RentalFormState {
    const state = {} as RentalFormState;
    for (const key in initial) {
      const fieldKey = key as keyof RentalAgreementData;
      const value = initial[fieldKey];
      const validation = RENTAL_VALIDATION_RULES[
        fieldKey as keyof typeof RENTAL_VALIDATION_RULES
      ]?.(value as any) || {
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

  // Auto-generate contract number
  useEffect(() => {
    if (autoGenerateEnabled && !data.contractNumber) {
      handleGenerateContractNumber();
    }
  }, []);

  // Field change handler
  const handleFieldChange = useCallback(
    <K extends keyof RentalAgreementData>(
      field: K,
      value: RentalAgreementData[K],
      options?: { skipValidation?: boolean; touch?: boolean }
    ) => {
      setData((prev) => ({ ...prev, [field]: value }));

      const validation = !options?.skipValidation
        ? RENTAL_VALIDATION_RULES[
            field as keyof typeof RENTAL_VALIDATION_RULES
          ]?.(value as any)
        : { isValid: true, errors: [], warnings: [] };

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

  // Blur handler
  const handleBlur = useCallback(
    (field: keyof RentalAgreementData) => {
      setFormState((prev) => {
        const fieldState = prev[field];
        if (!fieldState) return prev;
        return {
          ...prev,
          [field]: { ...fieldState, touched: true },
        };
      });
      handleFieldChange(field, data[field] as any, {
        skipValidation: false,
        touch: true,
      });
    },
    [data, handleFieldChange]
  );

  // Formatters
  const handleFormatPesel = useCallback((value: string): string => {
    return value.replace(/[^\d]/g, "").slice(0, 11);
  }, []);

  const handleFormatAmount = useCallback((value: string): string => {
    const cleaned = value.replace(/[^\d,.]/g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    if (isNaN(num)) return "";
    return num.toFixed(2).replace(".", ",");
  }, []);

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

  // Actions
  const handleGenerateContractNumber = useCallback(() => {
    const newNumber = ContractNumberGenerator.generate("UN", {
      useSequence: true,
      includeDay: true,
      separator: "/",
    });
    handleFieldChange("contractNumber", newNumber);
  }, [handleFieldChange]);

  const handleCalculateGrossRent = useCallback(() => {
    const netRent = parseFloat(data.monthlyRent.replace(",", ".")) || 0;
    const vatRate = parseInt(data.monthlyRentVatRate || "23");
    const grossRent = netRent * (1 + vatRate / 100);
    handleFieldChange(
      "monthlyRentGross",
      grossRent.toFixed(2).replace(".", ",")
    );
  }, [data.monthlyRent, data.monthlyRentVatRate, handleFieldChange]);

  const handleValidateAll = useCallback(() => {
    let isValid = true;
    const updatedState = { ...formState };

    for (const key in data) {
      const field = key as keyof RentalAgreementData;
      const value = data[field];
      const validation = RENTAL_VALIDATION_RULES[
        field as keyof typeof RENTAL_VALIDATION_RULES
      ]?.(value as any);

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
    setData(DEFAULT_RENTAL_AGREEMENT);
    setFormState(initializeFormState(DEFAULT_RENTAL_AGREEMENT));
    setIsSubmitted(false);
    setAutoGenerateEnabled(true);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    const isValid = handleValidateAll();
    if (isValid) {
      setLastSaved(new Date());
      handleCalculateGrossRent();
    }
    return isValid;
  }, [handleValidateAll, handleCalculateGrossRent]);

  // Computed properties
  const validationSummary = useMemo(() => {
    const errors: Array<keyof RentalAgreementData> = [];
    const warnings: Array<keyof RentalAgreementData> = [];
    let errorsCount = 0;
    let warningsCount = 0;

    for (const [key, state] of Object.entries(formState)) {
      if (state?.errors?.length > 0) {
        errors.push(key as keyof RentalAgreementData);
        errorsCount += state.errors.length;
      }
      if (state?.warnings?.length > 0) {
        warnings.push(key as keyof RentalAgreementData);
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

  const monthlyRentValue = parseFloat(data.monthlyRent.replace(",", ".")) || 0;
  const depositValue = parseFloat(data.deposit.replace(",", ".")) || 0;

  const previewData = useMemo(
    () => ({
      contractNumber: data.contractNumber || "[numer umowy]",
      conclusionDate: formatDatePL(data.conclusionDate),
      place: data.place || "[miejsce]",
      landlordValidated: data.landlordPesel
        ? validatePesel(data.landlordPesel).isValid
        : false,
      tenantValidated: data.tenantPesel
        ? validatePesel(data.tenantPesel).isValid
        : false,
      monthlyRentWords: numberToWords(monthlyRentValue),
      depositWords: numberToWords(depositValue),
      monthlyRentFormatted: formatCurrency(monthlyRentValue),
      depositFormatted: formatCurrency(depositValue),
      startDateFormatted: formatDatePL(data.startDate),
      endDateFormatted: formatDatePL(data.endDate),
      isIndefinite: !data.endDate || data.endDate === "",
    }),
    [data, monthlyRentValue, depositValue]
  );

  const completionPercentage = useMemo(() => {
    const requiredFields: Array<keyof RentalAgreementData> = [
      "contractNumber",
      "conclusionDate",
      "place",
      "landlordFullName",
      "landlordAddress",
      "landlordPesel",
      "tenantFullName",
      "tenantAddress",
      "tenantPesel",
      "propertyAddress",
      "startDate",
      "monthlyRent",
      "noticePeriod",
    ];

    const filled = requiredFields.filter((field) => {
      const value = data[field];
      return typeof value === "string" && value.trim().length > 0;
    }).length;

    return Math.round((filled / requiredFields.length) * 100);
  }, [data]);

  // Field helpers
  const getFieldError = useCallback(
    (field: keyof RentalAgreementData): string => {
      return formState[field]?.errors?.[0] || "";
    },
    [formState]
  );

  const getFieldWarning = useCallback(
    (field: keyof RentalAgreementData): string => {
      return formState[field]?.warnings?.[0] || "";
    },
    [formState]
  );

  const isFieldValid = useCallback(
    (field: keyof RentalAgreementData): boolean => {
      return formState[field]?.valid ?? true;
    },
    [formState]
  );

  const isFieldTouched = useCallback(
    (field: keyof RentalAgreementData): boolean => {
      return formState[field]?.touched ?? false;
    },
    [formState]
  );

  return {
    data,
    formState,
    isSubmitted,
    autoGenerateEnabled,
    lastSaved,
    validationSummary,
    previewData,
    completionPercentage,
    setData,
    setAutoGenerateEnabled,
    handleFieldChange,
    handleBlur,
    handleFormatPesel,
    handleFormatAmount,
    handleFormatPhone,
    handleGenerateContractNumber,
    handleCalculateGrossRent,
    handleValidateAll,
    handleReset,
    handleSubmit,
    handleSaveDraft: () => {
      setLastSaved(new Date());
      localStorage.setItem("rental_agreement_draft", JSON.stringify(data));
    },
    getFieldError,
    getFieldWarning,
    isFieldValid,
    isFieldTouched,
  };
}

// Simple data hook
export function useRentalAgreementData() {
  const [data, setData] = useState<RentalAgreementData>(
    DEFAULT_RENTAL_AGREEMENT
  );
  const reset = () => setData(DEFAULT_RENTAL_AGREEMENT);
  return { data, setData, reset };
}
