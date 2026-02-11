// Convert number to Polish words
export function numberToWords(num: number): string {
  if (num === 0) return "zero złotych zero groszy";

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

  const tys = Math.floor(zlote / 1000);
  if (tys > 0) {
    result.push(convertUpTo999(tys));
    if (tys === 1) result.push("tysiąc");
    else if (tys >= 2 && tys <= 4) result.push("tysiące");
    else result.push("tysięcy");
  }

  const zl = zlote % 1000;
  if (zl > 0 || zlote === 0) {
    const w = convertUpTo999(zl);
    if (w) result.push(w);
  }

  if (zlote === 1) result.push("złoty");
  else if (
    zlote % 10 >= 2 &&
    zlote % 10 <= 4 &&
    (zlote % 100 < 10 || zlote % 100 >= 20)
  )
    result.push("złote");
  else result.push("złotych");

  const gWords = convertUpTo999(grosze);
  if (gWords) result.push(gWords);

  if (grosze === 1) result.push("grosz");
  else if (
    grosze % 10 >= 2 &&
    grosze % 10 <= 4 &&
    (grosze % 100 < 10 || grosze % 100 >= 20)
  )
    result.push("grosze");
  else result.push("groszy");

  return result.filter(Boolean).join(" ").trim();
}

// Format currency for display
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format date Polish style
export function formatDatePL(dateStr: string): string {
  if (!dateStr) return "___.___.______";
  const d = new Date(dateStr);
  return d
    .toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, ".");
}

// Generate contract number helper
export function generateContractNumber(prefix: string = "UKS"): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const seq = Math.floor(Math.random() * 99 + 1)
    .toString()
    .padStart(2, "0");
  return `${seq}/${month}/${year}/${prefix}`;
}

// Validate PESEL
export function validatePesel(pesel: string): boolean {
  if (pesel.length !== 11) return false;
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const sum = weights.reduce((acc, w, i) => acc + w * parseInt(pesel[i]), 0);
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(pesel[10]);
}

// Validate Polish IBAN
export function validateIBAN(iban: string): boolean {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  return /^PL\d{26}$/.test(clean);
}

// Format IBAN with spaces
export function formatIBAN(value: string): string {
  const clean = value.toUpperCase().replace(/\s/g, "");
  return clean.match(/.{1,4}/g)?.join(" ") ?? value;
}
