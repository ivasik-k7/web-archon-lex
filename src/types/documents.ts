export interface DocumentMeta {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  icon: string;
  description: string;
  tags: string[];
  available: boolean;
  badgeText?: string;
}

export interface Product {
  id: number;
  name: string;
  quantity: string;
  price: string;
  value: number;
}

export interface UmowaKupnaSprzedazyData {
  // Basic
  numer_umowy: string;
  data: string;
  miejsce: string;
  // Seller
  sprzedajacy_imie: string;
  sprzedajacy_adres: string;
  sprzedajacy_pesel: string;
  sprzedajacy_dowod: string;
  sprzedajacy_telefon: string;
  sprzedajacy_email: string;
  // Products
  products: Product[];
  // Payment
  platnosc_typ: "gotowka" | "przelew" | "raty" | "";
  numer_konta: string;
  termin_platnosci: string;
  ilosc_rat: string;
  // Options
  include_rodo: boolean;
  include_gwarancja: boolean;
  gwarancja_czas: string;
  gwarancja_opis: string;
  notes: string;
}

export interface UmowaZlecenieData {
  // Basic contract data
  numer_umowy: string;
  data: string;
  miejsce: string;

  // Zleceniodawca (Contractor/Client)
  zleceniodawca_nazwa: string;
  zleceniodawca_adres: string;
  zleceniodawca_nip: string;
  zleceniodawca_regon: string;
  zleceniodawca_repr: string;

  // Zleceniobiorca (Contractor/Worker) - ENHANCED
  zleceniobiorca_imie: string;
  zleceniobiorca_adres: string;
  zleceniobiorca_pesel: string;
  zleceniobiorca_dowod: string; // ID card number - NEW
  zleceniobiorca_telefon: string; // Phone number - NEW
  zleceniobiorca_email: string; // Email address - NEW

  // Service details
  opis_uslugi: string;
  data_wykonania: string;

  // Payment details - ENHANCED
  wynagrodzenie: string; // Net amount
  wynagrodzenie_netto?: string; // Optional if storing separately
  vat_rate: string; // VAT rate (0,5,8,23) - NEW
  platnosc_konto: string; // IBAN account number
  platnosc_termin: string; // Payment deadline

  // Additional clauses - NEW
  dodatkowe_klauzule?: string[]; // Additional contract clauses
  uwagi?: string; // Internal notes/comments - NEW
}

// types/documents.ts

// ============================================================================
// UMOwa NAJMU (Rental Agreement) - Production Grade
// ============================================================================

export interface RentalAgreementData {
  // Basic contract data
  contractNumber: string;
  conclusionDate: string;
  place: string;

  // Landlord (Wynajmujący)
  landlordFullName: string;
  landlordAddress: string;
  landlordPesel: string;
  landlordIdCard?: string;
  landlordPhone?: string;
  landlordEmail?: string;

  // Tenant (Najemca)
  tenantFullName: string;
  tenantAddress: string;
  tenantPesel: string;
  tenantIdCard?: string;
  tenantPhone?: string;
  tenantEmail?: string;

  // Property details
  propertyAddress: string;
  propertyDescription: string;
  propertyArea?: string;
  propertyFloor?: string;
  propertyRooms?: number;

  // Rental terms
  startDate: string;
  endDate: string; // Optional - empty string for indefinite
  isFixedTerm: boolean;
  noticePeriod: string;

  // Financial
  monthlyRent: string; // Net rent
  monthlyRentVatRate: string; // VAT rate for rent (usually 23% or 8%)
  monthlyRentGross: string; // Calculated
  deposit: string;
  depositReturnDays: string;
  utilitiesIncluded: boolean;
  utilitiesCost?: string;

  // Additional
  additionalClauses: string[];
  internalNotes: string;
}

// ============================================================================
// POWER OF ATTORNEY (Pełnomocnictwo) - Production Grade
// ============================================================================

export type PowerOfAttorneyType = "general" | "specific" | "special"; // ogólne, szczególne, rodzajowe

export interface PowerOfAttorneyData {
  // Basic document data
  documentNumber: string;
  issueDate: string;
  place: string;

  // Principal (Mocodawca)
  principalFullName: string;
  principalAddress: string;
  principalPesel: string;
  principalIdCard?: string;
  principalPhone?: string;
  principalEmail?: string;
  principalBirthDate?: string;
  principalBirthPlace?: string;

  // Attorney (Pełnomocnik)
  attorneyFullName: string;
  attorneyAddress: string;
  attorneyPesel: string;
  attorneyIdCard?: string;
  attorneyPhone?: string;
  attorneyEmail?: string;
  attorneyBirthDate?: string;
  attorneyBirthPlace?: string;

  // Scope and type
  powerType: PowerOfAttorneyType;
  scopeDescription: string;
  isNotarized: boolean;
  notaryOffice?: string;
  notaryDate?: string;
  notaryActNumber?: string;

  // Restrictions and limitations
  isRevocable: boolean;
  expiryDate?: string;
  canSubstitute: boolean;
  substitutionLimit?: string;

  // Multiple attorneys
  jointRepresentation: boolean;
  additionalAttorneys?: Array<{
    fullName: string;
    pesel: string;
    address: string;
  }>;

  // Additional
  additionalClauses: string[];
  internalNotes: string;
}

// Default values for new documents
export const DEFAULT_RENTAL_AGREEMENT: RentalAgreementData = {
  contractNumber: "",
  conclusionDate: new Date().toISOString().split("T")[0],
  place: "Gdańsk",
  landlordFullName: "",
  landlordAddress: "",
  landlordPesel: "",
  landlordIdCard: "",
  landlordPhone: "",
  landlordEmail: "",
  tenantFullName: "",
  tenantAddress: "",
  tenantPesel: "",
  tenantIdCard: "",
  tenantPhone: "",
  tenantEmail: "",
  propertyAddress: "",
  propertyDescription: "",
  propertyArea: "",
  propertyFloor: "",
  propertyRooms: undefined,
  startDate: "",
  endDate: "",
  isFixedTerm: false,
  noticePeriod: "1 miesiąc",
  monthlyRent: "",
  monthlyRentVatRate: "23",
  monthlyRentGross: "",
  deposit: "",
  depositReturnDays: "30",
  utilitiesIncluded: false,
  utilitiesCost: "",
  additionalClauses: [],
  internalNotes: "",
};

export const DEFAULT_POWER_OF_ATTORNEY: PowerOfAttorneyData = {
  documentNumber: "",
  issueDate: new Date().toISOString().split("T")[0],
  place: "Gdańsk",
  principalFullName: "",
  principalAddress: "",
  principalPesel: "",
  principalIdCard: "",
  principalPhone: "",
  principalEmail: "",
  principalBirthDate: "",
  principalBirthPlace: "",
  attorneyFullName: "",
  attorneyAddress: "",
  attorneyPesel: "",
  attorneyIdCard: "",
  attorneyPhone: "",
  attorneyEmail: "",
  attorneyBirthDate: "",
  attorneyBirthPlace: "",
  powerType: "specific",
  scopeDescription: "",
  isNotarized: false,
  notaryOffice: "",
  notaryDate: "",
  notaryActNumber: "",
  isRevocable: true,
  expiryDate: "",
  canSubstitute: false,
  substitutionLimit: "",
  jointRepresentation: false,
  additionalAttorneys: [],
  additionalClauses: [],
  internalNotes: "",
};
