import type { Metadata } from "next";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { buildVelmereMetadata, absoluteUrl } from "@/lib/seo/metadata";
import { safeJsonLd } from "@/lib/seo/json-ld";
import { getLocalizedString, getProductBySlugOrId, isProductCustomerPurchasable } from "@/lib/products/catalog";

export function generateMetadata({ params }: { params: { locale: string; id: string } }): Metadata {
  const product = getProductBySlugOrId(params.id);
  const title = product ? `${getLocalizedString(product.title, params.locale)} — Velmère` : "Product — Velmère";
  const description = product
    ? getLocalizedString(product.shortDescription, params.locale)
    : "Velmère product detail page.";
  return buildVelmereMetadata({ locale: params.locale, path: `/shop/${params.id}`, title, description });
}

export default function ProductPage({ params }: { params: { locale: string; id: string } }) {
  const product = getProductBySlugOrId(params.id);
  const title = product ? getLocalizedString(product.title, params.locale) : "Velmère product";
  const description = product ? getLocalizedString(product.shortDescription, params.locale) : "Velmère product detail page.";
  const productUrl = absoluteUrl(`/${params.locale}/shop/${params.id}`);
  const inStock = product ? isProductCustomerPurchasable(product) : false;
  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: title,
        description,
        image: product.images.map((image) => image.url),
        sku: product.id,
        brand: { "@type": "Brand", name: "Velmère" },
        offers: {
          "@type": "Offer",
          priceCurrency: product.price.currency,
          price: (product.price.amount / 100).toFixed(2),
          availability: inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
          url: productUrl,
          itemCondition: "https://schema.org/NewCondition",
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: { "@type": "DefinedRegion", addressCountry: ["DE", "PL", "EU"] },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "DAY" },
            },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: ["DE", "PL"],
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 14,
            returnMethod: "https://schema.org/ReturnByMail",
          },
        },
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      ) : null}
      <ProductDetailClient params={params} />
    </>
  );
}
