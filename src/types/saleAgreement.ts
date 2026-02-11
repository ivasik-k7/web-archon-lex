export interface SaleProduct {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  value: number;
  vat?: number;
  vatRate?: 0 | 5 | 8 | 23;
  serialNumber?: string;
  condition?: "new" | "used" | "damaged" | "after_repair";
  year?: number;
  manufacturer?: string;
}

export interface SellerData {
  // Osoba fizyczna
  firstName?: string;
  lastName?: string;
  pesel: string;
  idNumber?: string;
  idIssuedBy?: string;
  idIssuedDate?: string;
  idExpiryDate?: string;

  // Osoba prawna / firma
  companyName?: string;
  nip?: string;
  regon?: string;
  krs?: string;

  // Adres
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  country: string;

  // Kontakt
  phone?: string;
  email?: string;

  // Dodatkowe
  isCompany: boolean;
  isVatPayer: boolean;
  bankName?: string;
  bankAccount: string;
}

export interface BuyerData {
  // Mennica Cashify - stałe dane
  companyName: string;
  nip: string;
  regon: string;
  krs: string;
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  country: string;
  bankName: string;
  bankAccount: string;
  swift: string;
  representative?: string;
}

export interface DeliveryData {
  method: "personal" | "courier" | "post" | "transport";
  cost: number;
  costPaidBy: "seller" | "buyer";
  date?: string;
  address?: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface WarrantyData {
  type: "statutory" | "commercial" | "none";
  period: number;
  periodUnit: "days" | "months" | "years";
  scope?: string;
  exclusions?: string[];
  serviceCenter?: string;
  claimProcedure?: string;
}

export interface InstallmentData {
  count: number;
  firstPaymentDate?: string;
  monthlyAmount?: number;
  interestRate?: number;
  totalInterest?: number;
  totalAmount?: number;
  schedule?: Array<{
    number: number;
    date: string;
    amount: number;
    principal: number;
    interest: number;
  }>;
}

export interface SaleAgreementData {
  // Essentialia negotii
  contractNumber: string;
  contractDate: string;
  location: string;

  // Strony
  seller: SellerData;
  buyer: BuyerData;

  // Przedmiot umowy
  products: SaleProduct[];

  // Cena i płatność
  totalNet: number;
  totalVat: number;
  totalGross: number;
  currency: "PLN";

  paymentType: "cash" | "transfer" | "installments" | "card" | "blik";
  paymentDeadline?: string;
  paymentDate?: string;
  bankAccount?: string;

  installments?: InstallmentData;

  // Wydanie rzeczy
  delivery: DeliveryData;

  // Przejście ryzyka
  riskTransferDate?: string;
  riskTransferMoment: "signing" | "handover" | "delivery";

  // Własność
  ownershipTransferDate?: string;
  ownershipTransferMoment: "signing" | "payment" | "handover";
  reservationOfTitle?: boolean;

  // Rękojmia
  excludeWarranty?: boolean;
  warrantyExclusionScope?: string;

  // Gwarancja
  includeWarranty?: boolean;
  warranty?: WarrantyData;

  // Odstąpienie od umowy
  withdrawalRight?: boolean;
  withdrawalDeadline?: number;
  withdrawalCost?: number;

  // Kary umowne
  penaltyForDelay?: number;
  penaltyForWithdrawal?: number;
  maxPenalty?: number;

  // Klauzule dodatkowe
  includeRodo: boolean;
  includeConfidentiality: boolean;
  includeArbitration?: boolean;
  arbitrationCourt?: string;

  // Oświadczenia
  sellerStatements?: string[];
  buyerStatements?: string[];

  // Postanowienia końcowe
  governingLaw: "PL";
  disputeResolution: "court" | "arbitration" | "mediation";
  courtVenue?: string;
  language: "PL";

  // Załączniki
  attachments?: string[];

  // Dodatkowe uwagi
  notes?: string;
}

export const DEFAULT_SALE_AGREEMENT: SaleAgreementData = {
  contractNumber: "",
  contractDate: new Date().toISOString().split("T")[0],
  location: "Warszawa",

  seller: {
    firstName: "",
    lastName: "",
    pesel: "",
    street: "",
    houseNumber: "",
    postalCode: "",
    city: "",
    country: "Polska",
    isCompany: false,
    isVatPayer: false,
    bankAccount: "",
  },

  buyer: {
    companyName: "MENNICA CASHIFY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
    nip: "5342579968",
    regon: "369692058",
    krs: "0000723077",
    street: "Marszałkowska",
    houseNumber: "107",
    postalCode: "00-110",
    city: "Warszawa",
    country: "Polska",
    bankName: "mBank S.A.",
    bankAccount: "PL00 0000 0000 0000 0000 0000 0000",
    swift: "BREXPLPW",
  },

  products: [
    {
      id: 1,
      name: "",
      quantity: 1,
      unit: "szt.",
      price: 0,
      value: 0,
      vat: 0,
      vatRate: 23,
    },
  ],

  totalNet: 0,
  totalVat: 0,
  totalGross: 0,
  currency: "PLN",

  paymentType: "transfer",
  paymentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  bankAccount: "",

  delivery: {
    method: "personal",
    cost: 0,
    costPaidBy: "seller",
    date: new Date().toISOString().split("T")[0],
  },

  riskTransferMoment: "signing",
  ownershipTransferMoment: "signing",
  reservationOfTitle: false,

  excludeWarranty: false,
  includeWarranty: false,

  includeRodo: true,
  includeConfidentiality: false,

  governingLaw: "PL",
  disputeResolution: "court",
  courtVenue: "Warszawa",
  language: "PL",

  attachments: [],
  notes: "",
};
