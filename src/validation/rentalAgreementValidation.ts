import {
  validatePesel,
  validateIdCard,
  ValidationResult,
} from "../shared/utils";

export const RENTAL_VALIDATION_RULES = {
  contractNumber: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    errors: !value.trim().length
      ? [
          {
            field: "contractNumber",
            code: "REQUIRED",
            message: "Numer umowy jest wymagany",
          },
        ]
      : [],
    warnings: [],
  }),

  conclusionDate: (value: string): ValidationResult => {
    const errors = [];
    if (!value) {
      errors.push({
        field: "conclusionDate",
        code: "REQUIRED",
        message: "Data zawarcia umowy jest wymagana",
      });
    } else {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push({
          field: "conclusionDate",
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
              message: "Miejsce zawarcia umowy jest wymagane",
            },
          ]
        : [],
    warnings: [],
  }),

  landlordFullName: (value: string): ValidationResult => {
    const errors = [];
    if (!value.trim()) {
      errors.push({
        field: "landlordFullName",
        code: "REQUIRED",
        message: "Imię i nazwisko wynajmującego jest wymagane",
      });
    } else if (value.trim().split(" ").length < 2) {
      errors.push({
        field: "landlordFullName",
        code: "INCOMPLETE",
        message: "Podaj pełne imię i nazwisko",
      });
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  landlordAddress: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 10,
    errors:
      value.trim().length < 10
        ? [
            {
              field: "landlordAddress",
              code: "TOO_SHORT",
              message:
                "Adres wynajmującego jest wymagany i musi zawierać minimum 10 znaków",
            },
          ]
        : [],
    warnings: [],
  }),

  landlordPesel: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        errors: [
          {
            field: "landlordPesel",
            code: "REQUIRED",
            message: "PESEL wynajmującego jest wymagany",
          },
        ],
        warnings: [],
      };
    }
    return validatePesel(value);
  },

  landlordIdCard: (value: string): ValidationResult =>
    value ? validateIdCard(value) : { isValid: true, errors: [], warnings: [] },

  tenantFullName: (value: string): ValidationResult => {
    const errors = [];
    if (!value.trim()) {
      errors.push({
        field: "tenantFullName",
        code: "REQUIRED",
        message: "Imię i nazwisko najemcy jest wymagane",
      });
    } else if (value.trim().split(" ").length < 2) {
      errors.push({
        field: "tenantFullName",
        code: "INCOMPLETE",
        message: "Podaj pełne imię i nazwisko",
      });
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  tenantAddress: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 10,
    errors:
      value.trim().length < 10
        ? [
            {
              field: "tenantAddress",
              code: "TOO_SHORT",
              message:
                "Adres najemcy jest wymagany i musi zawierać minimum 10 znaków",
            },
          ]
        : [],
    warnings: [],
  }),

  tenantPesel: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        errors: [
          {
            field: "tenantPesel",
            code: "REQUIRED",
            message: "PESEL najemcy jest wymagany",
          },
        ],
        warnings: [],
      };
    }
    return validatePesel(value);
  },

  propertyAddress: (value: string): ValidationResult => ({
    isValid: value.trim().length >= 10,
    errors:
      value.trim().length < 10
        ? [
            {
              field: "propertyAddress",
              code: "REQUIRED",
              message: "Adres nieruchomości jest wymagany",
            },
          ]
        : [],
    warnings: [],
  }),

  startDate: (value: string): ValidationResult => {
    const errors = [];
    if (!value) {
      errors.push({
        field: "startDate",
        code: "REQUIRED",
        message: "Data rozpoczęcia najmu jest wymagana",
      });
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  monthlyRent: (value: string): ValidationResult => {
    const errors = [];
    const numValue = parseFloat(value.replace(",", "."));

    if (!value) {
      errors.push({
        field: "monthlyRent",
        code: "REQUIRED",
        message: "Czynsz jest wymagany",
      });
    } else if (isNaN(numValue)) {
      errors.push({
        field: "monthlyRent",
        code: "INVALID_NUMBER",
        message: "Podaj prawidłową kwotę czynszu",
      });
    } else if (numValue <= 0) {
      errors.push({
        field: "monthlyRent",
        code: "NEGATIVE_OR_ZERO",
        message: "Czynsz musi być większy od 0",
      });
    } else if (numValue < 100) {
      errors.push({
        field: "monthlyRent",
        code: "TOO_LOW",
        message: "Czynsz wydaje się zbyt niski",
      });
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  deposit: (value: string): ValidationResult => {
    const errors = [];
    const numValue = parseFloat(value.replace(",", "."));

    if (value && isNaN(numValue)) {
      errors.push({
        field: "deposit",
        code: "INVALID_NUMBER",
        message: "Podaj prawidłową kwotę kaucji",
      });
    } else if (numValue < 0) {
      errors.push({
        field: "deposit",
        code: "NEGATIVE_VALUE",
        message: "Kaucja nie może być ujemna",
      });
    }
    return { isValid: errors.length === 0, errors, warnings: [] };
  },

  noticePeriod: (value: string): ValidationResult => ({
    isValid: value.trim().length > 0,
    errors: !value.trim().length
      ? [
          {
            field: "noticePeriod",
            code: "REQUIRED",
            message: "Okres wypowiedzenia jest wymagany",
          },
        ]
      : [],
    warnings: [],
  }),
};
