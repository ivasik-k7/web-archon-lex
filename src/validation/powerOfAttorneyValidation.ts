import {
  validatePesel,
  validateIdCard,
  ValidationResult,
} from "../shared/utils";
import { PowerOfAttorneyType } from "../types/documents";

export const POWER_OF_ATTORNEY_VALIDATION_RULES = {
  documentNumber: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    errors: !value.trim().length
      ? [
          {
            field: "documentNumber",
            code: "REQUIRED",
            message: "Numer dokumentu jest wymagany",
          },
        ]
      : [],
    warnings: [],
  }),

  issueDate: (value: string): ValidationResult => {
    const errors = [];
    if (!value) {
      errors.push({
        field: "issueDate",
        code: "REQUIRED",
        message: "Data wystawienia jest wymagana",
      });
    } else {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push({
          field: "issueDate",
          code: "INVALID_DATE",
          message: "Nieprawidłowy format daty",
        });
      }
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  place: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 3,
    errors:
      value.trim().length < 3
        ? [
            {
              field: "place",
              code: "TOO_SHORT",
              message: "Miejsce wystawienia jest wymagane",
            },
          ]
        : [],
    warnings: [],
  }),

  principalFullName: (value: string): ValidationResult => {
    const errors = [];
    if (!value.trim()) {
      errors.push({
        field: "principalFullName",
        code: "REQUIRED",
        message: "Imię i nazwisko mocodawcy jest wymagane",
      });
    } else if (value.trim().split(" ").length < 2) {
      errors.push({
        field: "principalFullName",
        code: "INCOMPLETE",
        message: "Podaj pełne imię i nazwisko",
      });
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  principalAddress: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 10,
    errors:
      value.trim().length < 10
        ? [
            {
              field: "principalAddress",
              code: "TOO_SHORT",
              message:
                "Adres mocodawcy jest wymagany i musi zawierać minimum 10 znaków",
            },
          ]
        : [],
    warnings: [],
  }),

  principalPesel: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        errors: [
          {
            field: "principalPesel",
            code: "REQUIRED",
            message: "PESEL mocodawcy jest wymagany",
          },
        ],
        warnings: [],
      };
    }
    return validatePesel(value);
  },

  principalIdCard: (value: string): ValidationResult =>
    value ? validateIdCard(value) : { isValid: true, errors: [], warnings: [] },

  attorneyFullName: (value: string): ValidationResult => {
    const errors = [];
    if (!value.trim()) {
      errors.push({
        field: "attorneyFullName",
        code: "REQUIRED",
        message: "Imię i nazwisko pełnomocnika jest wymagane",
      });
    } else if (value.trim().split(" ").length < 2) {
      errors.push({
        field: "attorneyFullName",
        code: "INCOMPLETE",
        message: "Podaj pełne imię i nazwisko",
      });
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  attorneyAddress: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 10,
    errors:
      value.trim().length < 10
        ? [
            {
              field: "attorneyAddress",
              code: "TOO_SHORT",
              message:
                "Adres pełnomocnika jest wymagany i musi zawierać minimum 10 znaków",
            },
          ]
        : [],
    warnings: [],
  }),

  attorneyPesel: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        errors: [
          {
            field: "attorneyPesel",
            code: "REQUIRED",
            message: "PESEL pełnomocnika jest wymagany",
          },
        ],
        warnings: [],
      };
    }
    return validatePesel(value);
  },

  powerType: (value: PowerOfAttorneyType): ValidationResult => {
    const validTypes = ["general", "specific", "special"];
    return {
      isValid: validTypes.includes(value),
      errors: !validTypes.includes(value)
        ? [
            {
              field: "powerType",
              code: "INVALID_TYPE",
              message: "Wybierz prawidłowy rodzaj pełnomocnictwa",
            },
          ]
        : [],
      warnings: [],
    };
  },

  scopeDescription: (value: string): ValidationResult => {
    const errors = [];
    const warnings = [];

    if (!value.trim()) {
      errors.push({
        field: "scopeDescription",
        code: "REQUIRED",
        message: "Opis zakresu pełnomocnictwa jest wymagany",
      });
    } else if (value.trim().length < 20) {
      errors.push({
        field: "scopeDescription",
        code: "TOO_SHORT",
        message: "Opis zakresu musi zawierać minimum 20 znaków",
      });
    } else if (value.trim().length < 50) {
      warnings.push({
        field: "scopeDescription",
        code: "SHORT_DESCRIPTION",
        message:
          "Zalecane jest bardziej szczegółowe określenie zakresu umocowania",
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  },

  expiryDate: (value: string): ValidationResult => {
    if (!value) return { isValid: true, errors: [], warnings: [] };

    const errors = [];
    const date = new Date(value);
    const today = new Date();

    if (isNaN(date.getTime())) {
      errors.push({
        field: "expiryDate",
        code: "INVALID_DATE",
        message: "Nieprawidłowy format daty",
      });
    } else if (date < today) {
      errors.push({
        field: "expiryDate",
        code: "PAST_DATE",
        message: "Data wygaśnięcia nie może być w przeszłości",
      });
    }

    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  notaryOffice: (value: string, isNotarized: boolean): ValidationResult => {
    if (!isNotarized) return { isValid: true, errors: [], warnings: [] };

    return {
      isValid: value.trim().length >= 3,
      errors:
        value.trim().length < 3
          ? [
              {
                field: "notaryOffice",
                code: "REQUIRED",
                message:
                  "Nazwa kancelarii notarialnej jest wymagana dla pełnomocnictwa notarialnego",
              },
            ]
          : [],
      warnings: [],
    };
  },
};
