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
  numer_umowy: string;
  data: string;
  miejsce: string;
  zleceniodawca_nazwa: string;
  zleceniodawca_adres: string;
  zleceniodawca_nip: string;
  zleceniodawca_regon: string;
  zleceniodawca_repr: string;
  zleceniobiorca_imie: string;
  zleceniobiorca_adres: string;
  zleceniobiorca_pesel: string;
  opis_uslugi: string;
  wynagrodzenie: string;
  data_wykonania: string;
  platnosc_termin: string;
  platnosc_konto: string;
}

export interface UmowaNajmuData {
  numer_umowy: string;
  data_zawarcia: string;
  miejsce: string;
  wynajmujacy_imie: string;
  wynajmujacy_adres: string;
  wynajmujacy_pesel: string;
  najemca_imie: string;
  najemca_adres: string;
  najemca_pesel: string;
  nieruchomosc_adres: string;
  nieruchomosc_opis: string;
  czynsz: string;
  kaucja: string;
  data_od: string;
  data_do: string;
  okres_wypowiedzenia: string;
}

export interface PelnomocnictwoData {
  numer: string;
  data: string;
  miejsce: string;
  mocodawca_imie: string;
  mocodawca_adres: string;
  mocodawca_pesel: string;
  pelnomocnik_imie: string;
  pelnomocnik_adres: string;
  pelnomocnik_pesel: string;
  zakres: string;
  rodzaj: "ogolne" | "szczegolne" | "rodzajowe";
  notarialne: boolean;
}
