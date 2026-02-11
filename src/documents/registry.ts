import type { DocumentMeta } from "../../doc-constructor/src/types/documents";

export const DOCUMENTS: DocumentMeta[] = [
  {
    id: "umowa-kupna-sprzedazy",
    title: "Umowa Kupna-Sprzedaży",
    titleEn: "Purchase Agreement",
    category: "Sprzedaż",
    icon: "ShoppingBag",
    description:
      "Standardowa umowa kupna-sprzedaży zgodna z polskim kodeksem cywilnym. Zawiera klauzulę RODO i opcje płatności.",
    tags: ["kupno", "sprzedaż", "towar", "RODO"],
    available: true,
  },
  {
    id: "umowa-zlecenie",
    title: "Umowa Zlecenie",
    titleEn: "Contract of Mandate",
    category: "Usługi",
    icon: "ClipboardText",
    description:
      "Umowa zlecenie dla osób fizycznych i firm. Zgodna z art. 734 K.C.",
    tags: ["zlecenie", "usługi", "prowizja"],
    available: true,
  },
  {
    id: "umowa-o-dzielo",
    title: "Umowa o Dzieło",
    titleEn: "Contract for Work",
    category: "Usługi",
    icon: "HammerSimple",
    description:
      "Umowa o dzieło z opisem rezultatu, wynagrodzenia i terminów. Art. 627 K.C.",
    tags: ["dzieło", "projekt", "rezultat"],
    available: false,
    badgeText: "Wkrótce",
  },
  {
    id: "umowa-najmu",
    title: "Umowa Najmu",
    titleEn: "Rental Agreement",
    category: "Nieruchomości",
    icon: "House",
    description:
      "Umowa najmu lokalu mieszkalnego lub użytkowego z kaucją i warunkami wypowiedzenia.",
    tags: ["najem", "lokal", "nieruchomość"],
    available: true,
  },
  {
    id: "pelnomocnictwo",
    title: "Pełnomocnictwo",
    titleEn: "Power of Attorney",
    category: "Prawo",
    icon: "Signature",
    description:
      "Pełnomocnictwo ogólne, szczególne lub rodzajowe. Opcja notarialna.",
    tags: ["pełnomocnictwo", "reprezentacja", "mocodawca"],
    available: true,
  },
  {
    id: "ugoda-sadowa",
    title: "Ugoda Sądowa",
    titleEn: "Court Settlement",
    category: "Prawo",
    icon: "Scales",
    description: "Ugoda pozasądowa lub przygotowanie dokumentacji do mediacji.",
    tags: ["ugoda", "mediacja", "spór"],
    available: false,
    badgeText: "Wkrótce",
  },
  {
    id: "umowa-pozyczki",
    title: "Umowa Pożyczki",
    titleEn: "Loan Agreement",
    category: "Finanse",
    icon: "CurrencyCircleDollar",
    description:
      "Umowa pożyczki pieniędzy między osobami fizycznymi lub firmami.",
    tags: ["pożyczka", "dług", "odsetki"],
    available: false,
    badgeText: "Wkrótce",
  },
];

export const CATEGORIES = [...new Set(DOCUMENTS.map((d) => d.category))];
