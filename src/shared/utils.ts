/**
 * ============================================================================
 * TYPES & INTERFACES
 * ============================================================================
 */

export interface Address {
  street: string;
  buildingNo: string;
  apartmentNo?: string;
  postalCode: string;
  city: string;
  country?: string;
}

export interface CompanyData {
  name: string;
  taxId: string; // NIP
  nationalId?: string; // REGON
  address: Address;
  bankAccount?: string; // IBAN
  email?: string;
  phone?: string;
}

export interface PersonData {
  firstName: string;
  lastName: string;
  pesel?: string;
  idDocument?: string;
  address: Address;
  email?: string;
  phone?: string;
}

export interface ContractMetadata {
  number: string;
  issueDate: string;
  effectiveDate: string;
  expiryDate?: string;
  place: string;
  author: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
}

/**
 * ============================================================================
 * DOCUMENT GENERATION & FORMATTING
 * ============================================================================
 */

/**
 * Enhanced number to Polish words converter with support for millions and billions
 */
export function numberToWords(
  num: number,
  includeCurrency: boolean = true
): string {
  if (num === 0) return includeCurrency ? "zero złotych zero groszy" : "zero";

  const units = [
    {
      value: 1000000000,
      singular: "miliard",
      plural: "miliardy",
      genitive: "miliardów",
    },
    {
      value: 1000000,
      singular: "milion",
      plural: "miliony",
      genitive: "milionów",
    },
    { value: 1000, singular: "tysiąc", plural: "tysiące", genitive: "tysięcy" },
  ];

  const ones = [
    "",
    "jeden",
    "dwa",
    "trzy",
    "cztery",
    "pięć",
    "sześć",
    "siedem",
    "osiem",
    "dziewięć",
  ];

  const teens = [
    "dziesięć",
    "jedenaście",
    "dwanaście",
    "trzynaście",
    "czternaście",
    "piętnaście",
    "szesnaście",
    "siedemnaście",
    "osiemnaście",
    "dziewiętnaście",
  ];

  const tens = [
    "",
    "",
    "dwadzieścia",
    "trzydzieści",
    "czterdzieści",
    "pięćdziesiąt",
    "sześćdziesiąt",
    "siedemdziesiąt",
    "osiemdziesiąt",
    "dziewięćdziesiąt",
  ];

  const hundreds = [
    "",
    "sto",
    "dwieście",
    "trzysta",
    "czterysta",
    "pięćset",
    "sześćset",
    "siedemset",
    "osiemset",
    "dziewięćset",
  ];

  const parts = num.toFixed(2).split(".");
  const zlote = parseInt(parts[0]);
  const grosze = parseInt(parts[1]);

  function convertUpTo999(n: number): string {
    if (n === 0) return "";

    const result: string[] = [];
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    if (h > 0) result.push(hundreds[h]);

    if (t === 1) {
      result.push(teens[o]);
    } else {
      if (t > 0) result.push(tens[t]);
      if (o > 0) result.push(ones[o]);
    }

    return result.join(" ");
  }

  const result: string[] = [];
  let remaining = zlote;

  // Handle large units
  for (const unit of units) {
    const unitValue = Math.floor(remaining / unit.value);
    if (unitValue > 0) {
      result.push(convertUpTo999(unitValue));

      if (unitValue === 1) {
        result.push(unit.singular);
      } else if (
        unitValue % 10 >= 2 &&
        unitValue % 10 <= 4 &&
        (unitValue % 100 < 10 || unitValue % 100 >= 20)
      ) {
        result.push(unit.plural);
      } else {
        result.push(unit.genitive);
      }

      remaining %= unit.value;
    }
  }

  // Handle remaining złote
  if (remaining > 0 || zlote === 0) {
    const words = convertUpTo999(remaining);
    if (words) result.push(words);
  }

  if (!includeCurrency) {
    return result.filter(Boolean).join(" ").trim();
  }

  // Add currency
  if (zlote === 1) {
    result.push("złoty");
  } else if (
    zlote % 10 >= 2 &&
    zlote % 10 <= 4 &&
    (zlote % 100 < 10 || zlote % 100 >= 20)
  ) {
    result.push("złote");
  } else {
    result.push("złotych");
  }

  // Add grosze
  const groszeWords = convertUpTo999(grosze);
  if (groszeWords) result.push(groszeWords);

  if (grosze === 1) {
    result.push("grosz");
  } else if (
    grosze % 10 >= 2 &&
    grosze % 10 <= 4 &&
    (grosze % 100 < 10 || grosze % 100 >= 20)
  ) {
    result.push("grosze");
  } else {
    result.push("groszy");
  }

  return result.filter(Boolean).join(" ").trim();
}

/**
 * Enhanced currency formatting with PLN symbol and word conversion
 */
export function formatCurrency(
  value: number,
  options?: {
    showSymbol?: boolean;
    showWords?: boolean;
    compact?: boolean;
  }
): string {
  const {
    showSymbol = true,
    showWords = false,
    compact = false,
  } = options || {};

  const formatted = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  if (compact) {
    return showSymbol ? `${formatted} PLN` : formatted;
  }

  let result = showSymbol ? `${formatted} zł` : formatted;

  if (showWords) {
    result += ` (słownie: ${numberToWords(value)})`;
  }

  return result;
}

/**
 * Polish date formatting with multiple formats
 */
export function formatDatePL(
  date: Date | string,
  format: "short" | "long" | "numeric" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return "___.___.______";
  }

  switch (format) {
    case "short":
      return d
        .toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, ".");

    case "long":
      return d.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    case "numeric":
      return d
        .toLocaleDateString("pl-PL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");
  }
}

/**
 * Advanced contract number generator with sequence persistence
 */
export class ContractNumberGenerator {
  private static sequence: Map<string, number> = new Map();

  static generate(
    prefix: string = "UKS",
    options?: {
      useSequence?: boolean;
      separator?: string;
      includeDay?: boolean;
    }
  ): string {
    const {
      useSequence = true,
      separator = "/",
      includeDay = false,
    } = options || {};

    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = includeDay ? now.getDate().toString().padStart(2, "0") : "";

    let seq: string;

    if (useSequence) {
      const key = `${prefix}-${year}${month}`;
      const currentSeq = this.sequence.get(key) || 0;
      const nextSeq = currentSeq + 1;
      this.sequence.set(key, nextSeq);
      seq = nextSeq.toString().padStart(4, "0");
    } else {
      seq = Math.floor(Math.random() * 999 + 1)
        .toString()
        .padStart(3, "0");
    }

    const parts = [seq, month, year, prefix];
    if (includeDay) parts.splice(1, 0, day);

    return parts.join(separator);
  }

  static resetSequence(prefix?: string, year?: number, month?: number): void {
    if (prefix && year && month) {
      const key = `${prefix}-${year}${month.toString().padStart(2, "0")}`;
      this.sequence.delete(key);
    } else {
      this.sequence.clear();
    }
  }
}

// Generate contract number helper
export function generateContractNumber(prefix: string = "UKS"): string {
  return ContractNumberGenerator.generate(prefix);
}

/**
 * Document template variables replacer
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number | Date>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");

    let formattedValue: string;
    if (value instanceof Date) {
      formattedValue = formatDatePL(value);
    } else if (typeof value === "number") {
      formattedValue = formatCurrency(value);
    } else {
      formattedValue = String(value);
    }

    result = result.replace(placeholder, formattedValue);
  }

  return result;
}

/**
 * ============================================================================
 * POLISH SPECIFIC VALIDATIONS
 * ============================================================================
 */

/**
 * Enhanced PESEL validation with date verification and gender extraction
 */
export function validatePesel(pesel: string): ValidationResult & {
  birthDate?: Date;
  gender?: "male" | "female";
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!pesel) {
    errors.push({
      field: "pesel",
      code: "REQUIRED",
      message: "PESEL jest wymagany",
    });
    return { isValid: false, errors, warnings };
  }

  if (pesel.length !== 11) {
    errors.push({
      field: "pesel",
      code: "LENGTH",
      message: "PESEL musi zawierać 11 cyfr",
    });
    return { isValid: false, errors, warnings };
  }

  if (!/^\d{11}$/.test(pesel)) {
    errors.push({
      field: "pesel",
      code: "FORMAT",
      message: "PESEL może zawierać tylko cyfry",
    });
    return { isValid: false, errors, warnings };
  }

  // Weight calculation
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const sum = weights.reduce((acc, w, i) => acc + w * parseInt(pesel[i]), 0);
  const checkDigit = (10 - (sum % 10)) % 10;

  if (checkDigit !== parseInt(pesel[10])) {
    errors.push({
      field: "pesel",
      code: "CHECK_DIGIT",
      message: "Nieprawidłowa cyfra kontrolna PESEL",
    });
  }

  // Extract and validate birth date
  const year = parseInt(pesel.slice(0, 2));
  const month = parseInt(pesel.slice(2, 4));
  const day = parseInt(pesel.slice(4, 6));

  let fullYear: number;
  let monthOffset = month;

  if (month >= 1 && month <= 12) {
    fullYear = 1900 + year;
  } else if (month >= 21 && month <= 32) {
    fullYear = 2000 + year;
    monthOffset = month - 20;
  } else if (month >= 41 && month <= 52) {
    fullYear = 2100 + year;
    monthOffset = month - 40;
  } else if (month >= 61 && month <= 72) {
    fullYear = 2200 + year;
    monthOffset = month - 60;
  } else if (month >= 81 && month <= 92) {
    fullYear = 1800 + year;
    monthOffset = month - 80;
  } else {
    errors.push({
      field: "pesel",
      code: "INVALID_MONTH",
      message: "Nieprawidłowy miesiąc w PESEL",
    });
    return { isValid: false, errors, warnings };
  }

  const birthDate = new Date(fullYear, monthOffset - 1, day);

  if (birthDate > new Date() || birthDate < new Date(1800, 0, 1)) {
    errors.push({
      field: "pesel",
      code: "INVALID_DATE",
      message: "Nieprawidłowa data urodzenia",
    });
  }

  // Extract gender
  const genderDigit = parseInt(pesel[9]);
  const gender = genderDigit % 2 === 0 ? "female" : "male";

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    birthDate,
    gender,
  };
}

/**
 * NIP (Polish Tax ID) validation
 */
export function validateNIP(nip: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const cleanNip = nip.replace(/[-\s]/g, "");

  if (!cleanNip) {
    errors.push({
      field: "nip",
      code: "REQUIRED",
      message: "NIP jest wymagany",
    });
    return { isValid: false, errors, warnings };
  }

  if (!/^\d{10}$/.test(cleanNip)) {
    errors.push({
      field: "nip",
      code: "FORMAT",
      message: "NIP musi zawierać 10 cyfr",
    });
    return { isValid: false, errors, warnings };
  }

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const digits = cleanNip.split("").map(Number);

  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  const checkDigit = sum % 11;

  if (checkDigit !== digits[9]) {
    errors.push({
      field: "nip",
      code: "CHECK_DIGIT",
      message: "Nieprawidłowa cyfra kontrolna NIP",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * REGON (Polish National Business Registry) validation
 */
export function validateREGON(regon: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const cleanRegon = regon.replace(/\s/g, "");

  if (!cleanRegon) {
    errors.push({
      field: "regon",
      code: "REQUIRED",
      message: "REGON jest wymagany",
    });
    return { isValid: false, errors, warnings };
  }

  if (!/^\d{9}$/.test(cleanRegon) && !/^\d{14}$/.test(cleanRegon)) {
    errors.push({
      field: "regon",
      code: "FORMAT",
      message: "REGON musi zawierać 9 lub 14 cyfr",
    });
    return { isValid: false, errors, warnings };
  }

  const isLong = cleanRegon.length === 14;
  const weights = isLong
    ? [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8]
    : [8, 9, 2, 7, 3, 4, 5, 6, 7];

  const digits = cleanRegon.split("").map(Number);
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  const checkDigit = sum % 11;

  if (checkDigit === 10) {
    warnings.push({
      field: "regon",
      code: "CHECK_DIGIT_10",
      message: "Cyfra kontrolna wynosi 0 (suma kontrolna dała 10)",
    });
  }

  const expectedCheckDigit = checkDigit === 10 ? 0 : checkDigit;
  const actualCheckDigit = digits[cleanRegon.length - 1];

  if (expectedCheckDigit !== actualCheckDigit) {
    errors.push({
      field: "regon",
      code: "CHECK_DIGIT",
      message: "Nieprawidłowa cyfra kontrolna REGON",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Enhanced IBAN validation for Polish accounts
 */
export function validateIBAN(iban: string): ValidationResult & {
  bankCode?: string;
  bankName?: string;
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const clean = iban.replace(/\s/g, "").toUpperCase();

  if (!clean) {
    errors.push({
      field: "iban",
      code: "REQUIRED",
      message: "Numer konta jest wymagany",
    });
    return { isValid: false, errors, warnings };
  }

  if (!/^PL\d{26}$/.test(clean)) {
    errors.push({
      field: "iban",
      code: "FORMAT",
      message: "Polski numer konta musi zaczynać się od PL i zawierać 26 cyfr",
    });
    return { isValid: false, errors, warnings };
  }

  // Extract bank code (first 8 digits of account number)
  const bankCode = clean.substring(2, 10);
  const bankName = getBankName(bankCode);

  // IBAN checksum validation
  const rearranged = clean.substring(4) + clean.substring(0, 4);
  const numeric = rearranged
    .split("")
    .map((char) => {
      if (char >= "0" && char <= "9") return char;
      return (char.charCodeAt(0) - 55).toString();
    })
    .join("");

  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
  }

  if (remainder !== 1) {
    errors.push({
      field: "iban",
      code: "CHECK_DIGIT",
      message: "Nieprawidłowa suma kontrolna IBAN",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    bankCode,
    bankName,
  };
}

export function formatIBAN(value: string): string {
  const clean = value.toUpperCase().replace(/\s/g, "");
  return clean.match(/.{1,4}/g)?.join(" ") ?? value;
}

/**
 * Polish bank codes mapping
 */
const bankCodes: Record<string, string> = {
  "1010": "Narodowy Bank Polski",
  "1020": "PKO BP",
  "1030": "Citibank Handlowy",
  "1050": "ING Bank Śląski",
  "1060": "BPH Bank",
  "1090": "Bank Zachodni WBK",
  "1130": "Bank Gospodarstwa Krajowego",
  "1140": "mBank",
  "1160": "Bank Millennium",
  "1240": "Pekao SA",
  "1280": "HSBC Bank Polska",
  "1320": "Bank Pocztowy",
  "1440": "Nordea Bank Polska",
  "1470": "Euro Bank",
  "1540": "Bank Ochrony Środowiska",
  "1580": "Mercedes-Benz Bank Polska",
  "1600": "BNP Paribas Bank Polska",
  "1610": "SGB-Bank",
  "1670": "RBS Bank (Polska)",
  "1680": "Plus Bank",
  "1750": "Raiffeisen Bank Polska",
  "1840": "Societe Generale",
  "1870": "FM Bank PBP",
  "1910": "Deutsche Bank Polska",
  "1930": "Bank Polskiej Spółdzielczości",
  "1940": "Credit Agricole Bank Polska",
  "1950": "Idea Bank",
  "1960": "Alior Bank",
  "1970": "Getin Noble Bank",
  "1980": "BNY Mellon (Polska)",
  "2030": "Bank BGŻ BNP Paribas",
  "2070": "FCE Bank Polska",
  "2120": "Santander Consumer Bank",
  "2130": "Volkswagen Bank",
  "2140": "Fiat Bank Polska",
  "2160": "Toyota Bank",
  "2190": "DnB Nord",
  "2480": "Gettin Noble",
  "2490": "Alior Sync",
};

function getBankName(bankCode: string): string | undefined {
  return bankCodes[bankCode.substring(0, 4)];
}

/**
 * ============================================================================
 * ADDRESS & POSTAL CODE UTILITIES
 * ============================================================================
 */

/**
 * Polish postal code formatting and validation
 */
export function formatPostalCode(code: string): string {
  const clean = code.replace(/[-\s]/g, "");
  if (clean.length === 5 && /^\d{5}$/.test(clean)) {
    return `${clean.substring(0, 2)}-${clean.substring(2)}`;
  }
  return code;
}

export function validatePostalCode(code: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const clean = code.replace(/[-\s]/g, "");

  if (!clean) {
    errors.push({
      field: "postalCode",
      code: "REQUIRED",
      message: "Kod pocztowy jest wymagany",
    });
    return { isValid: false, errors, warnings };
  }

  if (!/^\d{5}$/.test(clean)) {
    errors.push({
      field: "postalCode",
      code: "FORMAT",
      message: "Kod pocztowy musi zawierać 5 cyfr",
    });
    return { isValid: false, errors, warnings };
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Format full address in Polish style
 */
export function formatAddress(address: Address): string {
  const parts = [
    address.street,
    `${address.buildingNo}${
      address.apartmentNo ? `/${address.apartmentNo}` : ""
    }`,
    `${formatPostalCode(address.postalCode)} ${address.city}`,
  ];

  if (address.country && address.country !== "Polska") {
    parts.push(address.country);
  }

  return parts.join(", ");
}

/**
 * ============================================================================
 * DOCUMENT VALIDATION
 * ============================================================================
 */

/**
 * Validate Polish ID card number
 */
export function validateIdCard(idCard: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const clean = idCard.toUpperCase().replace(/\s/g, "");

  if (!clean) {
    errors.push({
      field: "idCard",
      code: "REQUIRED",
      message: "Numer dowodu jest wymagany",
    });
    return { isValid: false, errors, warnings };
  }

  if (!/^[A-Z]{3}\d{6}$/.test(clean)) {
    errors.push({
      field: "idCard",
      code: "FORMAT",
      message: "Nieprawidłowy format numeru dowodu (np. ABC123456)",
    });
    return { isValid: false, errors, warnings };
  }

  // ID card checksum validation
  const weights = [7, 3, 1, 9, 7, 3, 1, 7, 3];
  const letters = clean.substring(0, 3).split("");
  const digits = clean.substring(3).split("").map(Number);

  let sum = 0;

  // Process letters
  letters.forEach((letter, index) => {
    const value = letter.charCodeAt(0) - 55; // A=10, B=11, etc.
    sum += value * weights[index];
  });

  // Process digits
  digits.forEach((digit, index) => {
    sum += digit * weights[index + 3];
  });

  if (sum % 10 !== 0) {
    errors.push({
      field: "idCard",
      code: "CHECK_DIGIT",
      message: "Nieprawidłowy numer dowodu osobistego",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * ============================================================================
 * VAT & TAX UTILITIES
 * ============================================================================
 */

/**
 * Calculate VAT amount
 */
export function calculateVAT(
  amount: number,
  rate: number = 23
): {
  net: number;
  vat: number;
  gross: number;
  rate: number;
} {
  const gross = amount * (1 + rate / 100);
  const vat = amount * (rate / 100);

  return {
    net: amount,
    vat: Number(vat.toFixed(2)),
    gross: Number(gross.toFixed(2)),
    rate,
  };
}

/**
 * Reverse calculate VAT from gross amount
 */
export function reverseCalculateVAT(
  gross: number,
  rate: number = 23
): {
  net: number;
  vat: number;
  gross: number;
  rate: number;
} {
  const net = gross / (1 + rate / 100);
  const vat = gross - net;

  return {
    net: Number(net.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    gross,
    rate,
  };
}

/**
 * ============================================================================
 * STRING & TEXT UTILITIES
 * ============================================================================
 */

/**
 * Capitalize first letter of each word in Polish text
 */
export function capitalizePolish(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Remove Polish diacritics
 */
export function removePolishDiacritics(text: string): string {
  const polishChars: Record<string, string> = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
    Ą: "A",
    Ć: "C",
    Ę: "E",
    Ł: "L",
    Ń: "N",
    Ó: "O",
    Ś: "S",
    Ź: "Z",
    Ż: "Z",
  };

  return text.replace(
    /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g,
    (char) => polishChars[char] || char
  );
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = "..."
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * ============================================================================
 * FILE & EXPORT UTILITIES
 * ============================================================================
 */

/**
 * Generate CSV from array of objects
 */
export function generateCSV<T extends Record<string, any>>(
  data: T[],
  columns?: Array<keyof T & string>
): string {
  if (data.length === 0) return "";

  const headers = columns || (Object.keys(data[0]) as Array<keyof T & string>);
  const rows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value ?? "";
        })
        .join(",")
    ),
  ];

  return rows.join("\n");
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * ============================================================================
 * EXPORT ALL UTILITIES
 * ============================================================================
 */

export default {
  // Number & Currency
  numberToWords,
  formatCurrency,

  // Date & Contract
  formatDatePL,
  ContractNumberGenerator,
  generateContractNumber: ContractNumberGenerator.generate,
  replaceTemplateVariables,

  // Polish Validations
  validatePesel,
  validateNIP,
  validateREGON,
  validateIBAN,
  validateIdCard,
  validatePostalCode,

  // Address
  formatAddress,
  formatPostalCode,

  // VAT & Tax
  calculateVAT,
  reverseCalculateVAT,

  // Text
  capitalizePolish,
  removePolishDiacritics,
  truncateText,

  // File
  generateCSV,
  formatFileSize,

  // Types
  // (Types are exported separately)
};
