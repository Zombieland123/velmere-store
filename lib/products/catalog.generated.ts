import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "essential-oversized-hoodie",
    provider: "manual",
    status: "coming_soon",
    fulfilmentMode: "disabled",
    title: {
      pl: "Bluza oversize Essential",
      en: "Essential Oversized Hoodie",
      de: "Essential Oversized Hoodie",
    },
    shortDescription: {
      pl: "Cięższa bluza o spokojnej, pudełkowej sylwetce.",
      en: "A heavier hoodie with a quiet boxy silhouette.",
      de: "Ein schwererer Hoodie mit ruhiger, kastiger Silhouette.",
    },
    description: {
      pl: "Powściągliwa bluza Velmère z obniżoną linią ramion, miękką objętością i naciskiem na ciężar materiału. Finalny skład, kraj produkcji i tabela wymiarów zostaną potwierdzone przed sprzedażą.",
      en: "A restrained Velmère hoodie with a dropped shoulder, soft volume, and focus on fabric weight. Final composition, production country, and measurements will be confirmed before sales.",
      de: "Ein reduzierter Velmère Hoodie mit überschnittener Schulter, ruhigem Volumen und Fokus auf Materialgewicht. Finale Zusammensetzung, Produktionsland und Maße werden vor dem Verkauf bestätigt.",
    },
    price: {
      amount: 24000,
      currency: "EUR",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=18",
        alt: {
          pl: "Bluza oversize Velmère w edytorialnym ujęciu",
          en: "Velmère oversized hoodie in an editorial image",
          de: "Velmère Oversized Hoodie in einer Editorial-Aufnahme",
        },
        width: 1400,
        height: 1750,
      },
      {
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=20",
        alt: {
          pl: "Detal sylwetki bluzy Velmère",
          en: "Velmère hoodie silhouette detail",
          de: "Detail der Velmère Hoodie-Silhouette",
        },
        width: 1400,
        height: 1750,
      },
    ],
    variants: ["S", "M", "L", "XL"].map((size) => ({
      id: `essential-oversized-hoodie-${size.toLowerCase()}`,
      title: size,
      size,
      price: {
        amount: 24000,
        currency: "EUR",
      },
      available: false,
    })),
    tags: ["hoodie", "new-drop", "coming-soon"],
    collection: "new-drop",
  },
  {
    id: "2",
    slug: "signature-heavy-tee",
    provider: "manual",
    status: "coming_soon",
    fulfilmentMode: "disabled",
    title: {
      pl: "T-shirt Signature Heavy",
      en: "Signature Heavy Tee",
      de: "Signature Heavy Tee",
    },
    shortDescription: {
      pl: "T-shirt premium o czystej linii i cięższym chwycie.",
      en: "A premium tee with a clean line and heavier hand.",
      de: "Ein Premium-T-Shirt mit klarer Linie und schwererem Griff.",
    },
    description: {
      pl: "Minimalny T-shirt Velmère zaprojektowany jako baza dropu: spokojny branding, stabilna forma i nacisk na proporcję. Dane produkcyjne zostaną uzupełnione przed startem sprzedaży.",
      en: "A minimal Velmère tee designed as a drop foundation: quiet branding, stable form, and emphasis on proportion. Production data will be completed before sales launch.",
      de: "Ein minimales Velmère T-Shirt als Basis des Drops: ruhiges Branding, stabile Form und Fokus auf Proportion. Produktionsdaten werden vor Verkaufsstart ergänzt.",
    },
    price: {
      amount: 12000,
      currency: "EUR",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=20",
        alt: {
          pl: "T-shirt Velmère w edytorialnym świetle",
          en: "Velmère tee in editorial light",
          de: "Velmère T-Shirt in Editorial-Licht",
        },
        width: 1400,
        height: 1750,
      },
      {
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=20",
        alt: {
          pl: "Detal linii T-shirtu Velmère",
          en: "Velmère tee line detail",
          de: "Detail der Velmère T-Shirt-Linie",
        },
        width: 1400,
        height: 1750,
      },
    ],
    variants: ["S", "M", "L", "XL"].map((size) => ({
      id: `signature-heavy-tee-${size.toLowerCase()}`,
      title: size,
      size,
      price: {
        amount: 12000,
        currency: "EUR",
      },
      available: false,
    })),
    tags: ["tshirt", "new-drop", "coming-soon"],
    collection: "new-drop",
  },
  {
    id: "3",
    slug: "structured-cargo-trouser",
    provider: "manual",
    status: "coming_soon",
    fulfilmentMode: "disabled",
    title: {
      pl: "Spodnie cargo Structured",
      en: "Structured Cargo Trouser",
      de: "Structured Cargo Trouser",
    },
    shortDescription: {
      pl: "Spodnie o technicznej linii, zbudowane na proporcji i ciężarze.",
      en: "A technical trouser built around proportion and weight.",
      de: "Eine technische Hose, gebaut um Proportion und Gewicht.",
    },
    description: {
      pl: "Spodnie Velmère o mocniejszej strukturze i użytkowej sylwetce. Produkt pozostaje w trybie przygotowania do czasu potwierdzenia wariantów, kosztów wysyłki i fulfillmentu.",
      en: "Velmère trousers with stronger structure and a utility silhouette. The product stays in preparation until variants, shipping cost, and fulfilment are confirmed.",
      de: "Velmère Hose mit stärkerer Struktur und Utility-Silhouette. Das Produkt bleibt in Vorbereitung, bis Varianten, Versandkosten und Fulfilment bestätigt sind.",
    },
    price: {
      amount: 35000,
      currency: "EUR",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=20",
        alt: {
          pl: "Spodnie Velmère w spokojnej sylwetce",
          en: "Velmère trousers in a quiet silhouette",
          de: "Velmère Hose in ruhiger Silhouette",
        },
        width: 1400,
        height: 1750,
      },
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop&sat=-100&contrast=18",
        alt: {
          pl: "Detal proporcji spodni Velmère",
          en: "Velmère trouser proportion detail",
          de: "Detail der Velmère Hosenproportion",
        },
        width: 1400,
        height: 1750,
      },
    ],
    variants: ["M", "L", "XL"].map((size) => ({
      id: `structured-cargo-trouser-${size.toLowerCase()}`,
      title: size,
      size,
      price: {
        amount: 35000,
        currency: "EUR",
      },
      available: false,
    })),
    tags: ["pants", "new-drop", "coming-soon"],
    collection: "new-drop",
  },
];
