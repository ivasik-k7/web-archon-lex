// hooks/usePowerOfAttorneyForm.ts
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  PowerOfAttorneyData,
  DEFAULT_POWER_OF_ATTORNEY,
} from "../types/documents";
import { POWER_OF_ATTORNEY_VALIDATION_RULES } from "../validation/powerOfAttorneyValidation";
import { ContractNumberGenerator, ValidationResult } from "../shared/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface FormFieldState {
  value: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export type PowerOfAttorneyFormState = {
  [K in keyof PowerOfAttorneyData]: FormFieldState;
};

export interface ValidationSummary {
  isValid: boolean;
  errorsCount: number;
  warningsCount: number;
  fieldsWithErrors: Array<keyof PowerOfAttorneyData>;
  fieldsWithWarnings: Array<keyof PowerOfAttorneyData>;
  errorMessages: string[];
  warningMessages: string[];
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export function usePowerOfAttorneyForm(
  initialData: PowerOfAttorneyData = DEFAULT_POWER_OF_ATTORNEY,
  options?: {
    autoGenerateNumber?: boolean;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  }
) {
  const {
    autoGenerateNumber = true,
    validateOnChange = true,
    validateOnBlur = true,
  } = options || {};

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  const [data, setData] = useState<PowerOfAttorneyData>(initialData);
  const [formState, setFormState] = useState<PowerOfAttorneyFormState>(() =>
    initializeFormState(initialData)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [autoGenerateEnabled, setAutoGenerateEnabled] =
    useState(autoGenerateNumber);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  function initializeFormState(
    initial: PowerOfAttorneyData
  ): PowerOfAttorneyFormState {
    const state = {} as PowerOfAttorneyFormState;

    for (const key in initial) {
      const fieldKey = key as keyof PowerOfAttorneyData;
      const value = initial[fieldKey];

      // Get validation result for this field
      let validation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      if (fieldKey in POWER_OF_ATTORNEY_VALIDATION_RULES) {
        const rule =
          POWER_OF_ATTORNEY_VALIDATION_RULES[
            fieldKey as keyof typeof POWER_OF_ATTORNEY_VALIDATION_RULES
          ];

        // Handle special case for notaryOffice which depends on isNotarized
        if (fieldKey === "notaryOffice") {
          validation = (
            rule as (value: string, isNotarized: boolean) => ValidationResult
          )(value as string, initial.isNotarized);
        } else {
          validation = (rule as (value: any) => ValidationResult)(value as any);
        }
      }

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
  // Auto-generate document number
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (autoGenerateEnabled && !data.documentNumber) {
      handleGenerateDocumentNumber();
    }
  }, [autoGenerateEnabled, data.documentNumber]);

  // --------------------------------------------------------------------------
  // Validation Helpers
  // --------------------------------------------------------------------------

  const validateField = useCallback(
    <K extends keyof PowerOfAttorneyData>(
      field: K,
      value: PowerOfAttorneyData[K],
      context?: { isNotarized: boolean }
    ): ValidationResult => {
      if (!(field in POWER_OF_ATTORNEY_VALIDATION_RULES)) {
        return { isValid: true, errors: [], warnings: [] };
      }

      const rule =
        POWER_OF_ATTORNEY_VALIDATION_RULES[
          field as keyof typeof POWER_OF_ATTORNEY_VALIDATION_RULES
        ];

      // Special handling for notaryOffice which requires isNotarized context
      if (field === "notaryOffice") {
        const isNotarized = context?.isNotarized ?? data.isNotarized;
        return (
          rule as (value: string, isNotarized: boolean) => ValidationResult
        )(value as string, isNotarized);
      }

      return (rule as (value: any) => ValidationResult)(value as any);
    },
    [data.isNotarized]
  );

  const validateAllFields = useCallback((): {
    isValid: boolean;
    fieldStates: Partial<PowerOfAttorneyFormState>;
  } => {
    const fieldStates: Partial<PowerOfAttorneyFormState> = {};
    let isValid = true;

    for (const key in data) {
      const field = key as keyof PowerOfAttorneyData;
      const value = data[field];

      const validation = validateField(field, value, {
        isNotarized: data.isNotarized,
      });

      fieldStates[field] = {
        ...formState[field],
        valid: validation.isValid,
        errors: validation.errors.map((e) => e.message),
        warnings: validation.warnings.map((w) => w.message),
      };

      if (!validation.isValid) {
        isValid = false;
      }
    }

    return { isValid, fieldStates };
  }, [data, formState, validateField]);

  // --------------------------------------------------------------------------
  // Field Handlers
  // --------------------------------------------------------------------------

  const handleFieldChange = useCallback(
    <K extends keyof PowerOfAttorneyData>(
      field: K,
      value: PowerOfAttorneyData[K],
      options?: { skipValidation?: boolean; touch?: boolean }
    ) => {
      // Update data
      setData((prev) => {
        const newData = { ...prev, [field]: value };

        // Special case: when isNotarized changes, revalidate notaryOffice
        if (field === "isNotarized") {
          const notaryOfficeValidation = validateField(
            "notaryOffice",
            prev.notaryOffice || "",
            { isNotarized: value as boolean }
          );

          setFormState((prevState) => ({
            ...prevState,
            notaryOffice: {
              ...prevState.notaryOffice,
              valid: notaryOfficeValidation.isValid,
              errors: notaryOfficeValidation.errors.map((e) => e.message),
              warnings: notaryOfficeValidation.warnings.map((w) => w.message),
            },
          }));
        }

        return newData;
      });

      // Validate if enabled
      let validation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };
      if (validateOnChange && !options?.skipValidation) {
        validation = validateField(field, value, {
          isNotarized: data.isNotarized,
        });
      }

      // Update form state
      setFormState((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          value: typeof value === "string" ? value : JSON.stringify(value),
          dirty: true,
          touched: options?.touch ? true : prev[field]?.touched || false,
          valid: validation.isValid,
          errors: validation.errors.map((e) => e.message),
          warnings: validation.warnings.map((w) => w.message),
        },
      }));

      setIsDirty(true);
    },
    [data.isNotarized, validateField, validateOnChange]
  );

  const handleBlur = useCallback(
    <K extends keyof PowerOfAttorneyData>(field: K) => {
      // Mark field as touched
      setFormState((prev) => {
        const fieldState = prev[field];
        if (!fieldState) return prev;
        return {
          ...prev,
          [field]: { ...fieldState, touched: true },
        };
      });

      // Validate on blur if enabled
      if (validateOnBlur) {
        const value = data[field];
        const validation = validateField(field, value, {
          isNotarized: data.isNotarized,
        });

        setFormState((prev) => ({
          ...prev,
          [field]: {
            ...prev[field],
            valid: validation.isValid,
            errors: validation.errors.map((e) => e.message),
            warnings: validation.warnings.map((w) => w.message),
          },
        }));
      }
    },
    [data, validateField, validateOnBlur]
  );

  // --------------------------------------------------------------------------
  // Formatters
  // --------------------------------------------------------------------------

  const handleFormatPesel = useCallback((value: string): string => {
    return value.replace(/[^\d]/g, "").slice(0, 11);
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

  const handleFormatIdCard = useCallback((value: string): string => {
    return value
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, 9);
  }, []);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------

  const handleGenerateDocumentNumber = useCallback(() => {
    const newNumber = ContractNumberGenerator.generate("PM", {
      useSequence: true,
      includeDay: true,
      separator: "/",
    });
    handleFieldChange("documentNumber", newNumber, {
      skipValidation: false,
      touch: true,
    });
  }, [handleFieldChange]);

  const handleValidateAll = useCallback(() => {
    const { isValid, fieldStates } = validateAllFields();

    // Update all field states with validation results and mark as touched
    setFormState((prev) => {
      const updated = { ...prev };
      for (const [field, state] of Object.entries(fieldStates)) {
        if (state) {
          updated[field as keyof PowerOfAttorneyData] = {
            ...updated[field as keyof PowerOfAttorneyData],
            ...state,
            touched: true,
          };
        }
      }
      return updated;
    });

    return isValid;
  }, [validateAllFields]);

  const handleReset = useCallback(() => {
    setData(DEFAULT_POWER_OF_ATTORNEY);
    setFormState(initializeFormState(DEFAULT_POWER_OF_ATTORNEY));
    setIsSubmitted(false);
    setIsDirty(false);
    setLastSaved(null);
    setAutoGenerateEnabled(true);
  }, []);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    const isValid = handleValidateAll();

    if (isValid) {
      setLastSaved(new Date());
      // Save to localStorage as draft
      localStorage.setItem("power_of_attorney_draft", JSON.stringify(data));
    }

    return isValid;
  }, [handleValidateAll, data]);

  const handleSaveDraft = useCallback(() => {
    setLastSaved(new Date());
    localStorage.setItem("power_of_attorney_draft", JSON.stringify(data));
  }, [data]);

  // --------------------------------------------------------------------------
  // Computed Properties for Validation Summary
  // --------------------------------------------------------------------------

  const validationSummary = useMemo((): ValidationSummary => {
    const fieldsWithErrors: Array<keyof PowerOfAttorneyData> = [];
    const fieldsWithWarnings: Array<keyof PowerOfAttorneyData> = [];
    const errorMessages: string[] = [];
    const warningMessages: string[] = [];
    let errorsCount = 0;
    let warningsCount = 0;

    for (const [key, state] of Object.entries(formState)) {
      if (state?.errors?.length > 0) {
        fieldsWithErrors.push(key as keyof PowerOfAttorneyData);
        errorsCount += state.errors.length;
        errorMessages.push(...state.errors);
      }
      if (state?.warnings?.length > 0) {
        fieldsWithWarnings.push(key as keyof PowerOfAttorneyData);
        warningsCount += state.warnings.length;
        warningMessages.push(...state.warnings);
      }
    }

    return {
      isValid: errorsCount === 0,
      errorsCount,
      warningsCount,
      fieldsWithErrors,
      fieldsWithWarnings,
      errorMessages: [...new Set(errorMessages)], // Remove duplicates
      warningMessages: [...new Set(warningMessages)], // Remove duplicates
    };
  }, [formState]);

  const completionPercentage = useMemo(() => {
    const requiredFields: Array<keyof PowerOfAttorneyData> = [
      "documentNumber",
      "issueDate",
      "place",
      "principalFullName",
      "principalAddress",
      "principalPesel",
      "attorneyFullName",
      "attorneyAddress",
      "attorneyPesel",
      "scopeDescription",
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
    (field: keyof PowerOfAttorneyData): string => {
      return formState[field]?.errors?.[0] || "";
    },
    [formState]
  );

  const getFieldErrors = useCallback(
    (field: keyof PowerOfAttorneyData): string[] => {
      return formState[field]?.errors || [];
    },
    [formState]
  );

  const getFieldWarning = useCallback(
    (field: keyof PowerOfAttorneyData): string => {
      return formState[field]?.warnings?.[0] || "";
    },
    [formState]
  );

  const getFieldWarnings = useCallback(
    (field: keyof PowerOfAttorneyData): string[] => {
      return formState[field]?.warnings || [];
    },
    [formState]
  );

  const isFieldValid = useCallback(
    (field: keyof PowerOfAttorneyData): boolean => {
      return formState[field]?.valid ?? true;
    },
    [formState]
  );

  const isFieldTouched = useCallback(
    (field: keyof PowerOfAttorneyData): boolean => {
      return formState[field]?.touched ?? false;
    },
    [formState]
  );

  const isFieldDirty = useCallback(
    (field: keyof PowerOfAttorneyData): boolean => {
      return formState[field]?.dirty ?? false;
    },
    [formState]
  );

  const getFieldValue = useCallback(
    <K extends keyof PowerOfAttorneyData>(field: K): PowerOfAttorneyData[K] => {
      return data[field];
    },
    [data]
  );

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------

  return {
    // Data
    data,
    setData,

    // Form state
    formState,
    isSubmitted,
    isDirty,
    lastSaved,
    autoGenerateEnabled,
    setAutoGenerateEnabled,

    // Validation
    validationSummary,
    completionPercentage,
    validateField: handleValidateAll,
    isFieldValid,
    isFieldTouched,
    isFieldDirty,
    getFieldError,
    getFieldErrors,
    getFieldWarning,
    getFieldWarnings,
    getFieldValue,

    // Handlers
    handleFieldChange,
    handleBlur,
    handleSubmit,
    handleReset,
    handleSaveDraft,
    handleGenerateDocumentNumber,

    // Formatters
    handleFormatPesel,
    handleFormatPhone,
    handleFormatIdCard,
  };
}

// Simple data hook for basic usage
export function usePowerOfAttorneyData() {
  const [data, setData] = useState<PowerOfAttorneyData>(
    DEFAULT_POWER_OF_ATTORNEY
  );
  const reset = useCallback(() => setData(DEFAULT_POWER_OF_ATTORNEY), []);
  return { data, setData, reset };
}
