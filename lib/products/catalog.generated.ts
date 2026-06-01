import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "velmere-frost-zip-hoodie",
    provider: "manual",
    status: "coming_soon",
    fulfilmentMode: "disabled",
    title: {
      pl: "Bluza Frost Zip Hoodie",
      en: "Frost Zip Hoodie",
      de: "Frost Zip Hoodie",
    },
    shortDescription: {
      pl: "Szara bluza z kapturem i spokojnym brandingiem Velmère.",
      en: "A grey zip hoodie with quiet Velmère branding.",
      de: "Ein grauer Zip-Hoodie mit ruhigem Velmère Branding.",
    },
    description: {
      pl: "Bluza Velmère w jasnoszarej palecie, z zamkiem, kapturem i pudełkową sylwetką. Produkt jest tymczasowym podglądem pierwszego dropu; finalny skład, tabela wymiarów, produkcja i fulfillment zostaną potwierdzone przed sprzedażą.",
      en: "A Velmère hoodie in a light grey palette, with a zip front, hood, and boxy silhouette. This is a temporary first-drop preview; final composition, measurements, production, and fulfilment will be confirmed before sales.",
      de: "Ein Velmère Hoodie in hellgrauer Palette, mit Reißverschluss, Kapuze und kastiger Silhouette. Dies ist eine temporäre Vorschau des ersten Drops; finale Zusammensetzung, Maße, Produktion und Fulfilment werden vor dem Verkauf bestätigt.",
    },
    price: {
      amount: 24000,
      currency: "EUR",
    },
    images: [
      {
        url: "/products/velmere-preview/1.webp",
        alt: {
          pl: "Szara bluza z kapturem Velmère — podgląd pierwszego dropu",
          en: "Grey Velmère zip hoodie — first drop preview",
          de: "Grauer Velmère Zip-Hoodie — Vorschau des ersten Drops",
        },
        width: 1024,
        height: 1024,
      },
    ],
    variants: ["S", "M", "L", "XL"].map((size) => ({
      id: `velmere-frost-zip-hoodie-${size.toLowerCase()}`,
      title: size,
      size,
      price: {
        amount: 24000,
        currency: "EUR",
      },
      available: false,
    })),
    tags: ["hoodie", "zip", "new-drop", "coming-soon"],
    collection: "new-drop",
  },
  {
    id: "2",
    slug: "velmere-contrast-varsity-jacket",
    provider: "manual",
    status: "coming_soon",
    fulfilmentMode: "disabled",
    title: {
      pl: "Kurtka Contrast Varsity",
      en: "Contrast Varsity Jacket",
      de: "Contrast Varsity Jacket",
    },
    shortDescription: {
      pl: "Czarno-kremowa kurtka varsity z metalicznym znakiem Velmère.",
      en: "A black and cream varsity jacket with a metallic Velmère mark.",
      de: "Eine schwarz-cremefarbene Varsity-Jacke mit metallischem Velmère Zeichen.",
    },
    description: {
      pl: "Kurtka Velmère z kontrastowymi rękawami, prążkowanymi wykończeniami i spokojnym znakiem na piersi. Produkt pozostaje w trybie preview do czasu potwierdzenia finalnych wariantów, ceny i fulfillmentu.",
      en: "A Velmère jacket with contrast sleeves, ribbed trims, and a quiet chest mark. The product remains in preview mode until final variants, pricing, and fulfilment are confirmed.",
      de: "Eine Velmère Jacke mit kontrastierenden Ärmeln, gerippten Abschlüssen und ruhigem Brustzeichen. Das Produkt bleibt im Preview-Modus, bis finale Varianten, Preise und Fulfilment bestätigt sind.",
    },
    price: {
      amount: 35000,
      currency: "EUR",
    },
    images: [
      {
        url: "/products/velmere-preview/2.webp",
        alt: {
          pl: "Kurtka varsity Velmère — podgląd pierwszego dropu",
          en: "Velmère varsity jacket — first drop preview",
          de: "Velmère Varsity-Jacke — Vorschau des ersten Drops",
        },
        width: 1024,
        height: 1024,
      },
    ],
    variants: ["S", "M", "L", "XL"].map((size) => ({
      id: `velmere-contrast-varsity-jacket-${size.toLowerCase()}`,
      title: size,
      size,
      price: {
        amount: 35000,
        currency: "EUR",
      },
      available: false,
    })),
    tags: ["jacket", "varsity", "new-drop", "coming-soon"],
    collection: "new-drop",
  },
  {
    id: "3",
    slug: "velmere-black-track-pants",
    provider: "manual",
    status: "coming_soon",
    fulfilmentMode: "disabled",
    title: {
      pl: "Spodnie Black Track",
      en: "Black Track Pants",
      de: "Black Track Pants",
    },
    shortDescription: {
      pl: "Czarne spodnie o czystej linii, kontrastowym pasie i prostym ciężarze.",
      en: "Black pants with a clean line, contrast stripe, and straight weight.",
      de: "Schwarze Hose mit klarer Linie, Kontraststreifen und ruhigem Gewicht.",
    },
    description: {
      pl: "Spodnie Velmère z elastycznym pasem, jasnymi liniami bocznymi i minimalistycznym brandingiem. Produkt pozostaje jako podgląd pierwszego dropu do czasu podpięcia produkcji, stanów i wysyłki.",
      en: "Velmère pants with an elastic waist, light side lines, and minimal branding. The product remains a first-drop preview until production, stock, and shipping are connected.",
      de: "Velmère Hose mit elastischem Bund, hellen Seitenlinien und minimalem Branding. Das Produkt bleibt eine Vorschau des ersten Drops, bis Produktion, Bestand und Versand verbunden sind.",
    },
    price: {
      amount: 18000,
      currency: "EUR",
    },
    images: [
      {
        url: "/products/velmere-preview/3.webp",
        alt: {
          pl: "Czarne spodnie Velmère — podgląd pierwszego dropu",
          en: "Black Velmère pants — first drop preview",
          de: "Schwarze Velmère Hose — Vorschau des ersten Drops",
        },
        width: 1024,
        height: 1024,
      },
    ],
    variants: ["S", "M", "L", "XL"].map((size) => ({
      id: `velmere-black-track-pants-${size.toLowerCase()}`,
      title: size,
      size,
      price: {
        amount: 18000,
        currency: "EUR",
      },
      available: false,
    })),
    tags: ["pants", "track", "new-drop", "coming-soon"],
    collection: "new-drop",
  },
  {
    id: "4",
    slug: "velmere-ivory-collar-tee",
    provider: "manual",
    status: "coming_soon",
    fulfilmentMode: "disabled",
    title: {
      pl: "Koszulka Ivory Collar",
      en: "Ivory Collar Tee",
      de: "Ivory Collar Tee",
    },
    shortDescription: {
      pl: "Kremowa koszulka z kołnierzem i kontrastowym wykończeniem Velmère.",
      en: "An ivory collared tee with contrast Velmère detailing.",
      de: "Ein elfenbeinfarbenes Shirt mit Kragen und kontrastierenden Velmère Details.",
    },
    description: {
      pl: "Koszulka Velmère w jasnej palecie z prążkowanym kołnierzem, kontrastowymi liniami i centralnym podpisem marki. Produkt jest tymczasowym preview, bez aktywnego checkoutu do czasu finalnej produkcji.",
      en: "A Velmère tee in an ivory palette with a ribbed collar, contrast lines, and a centered brand signature. This is a temporary preview without active checkout until final production is ready.",
      de: "Ein Velmère Shirt in elfenbeinfarbener Palette mit geripptem Kragen, Kontrastlinien und zentraler Markensignatur. Dies ist eine temporäre Vorschau ohne aktiven Checkout bis zur finalen Produktion.",
    },
    price: {
      amount: 12000,
      currency: "EUR",
    },
    images: [
      {
        url: "/products/velmere-preview/4.webp",
        alt: {
          pl: "Kremowa koszulka z kołnierzem Velmère — podgląd pierwszego dropu",
          en: "Ivory Velmère collared tee — first drop preview",
          de: "Elfenbeinfarbenes Velmère Shirt mit Kragen — Vorschau des ersten Drops",
        },
        width: 1024,
        height: 1024,
      },
    ],
    variants: ["S", "M", "L", "XL"].map((size) => ({
      id: `velmere-ivory-collar-tee-${size.toLowerCase()}`,
      title: size,
      size,
      price: {
        amount: 12000,
        currency: "EUR",
      },
      available: false,
    })),
    tags: ["tee", "collar", "new-drop", "coming-soon"],
    collection: "new-drop",
  },
];
