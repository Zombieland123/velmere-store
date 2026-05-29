import type { Metadata } from "next";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { buildVelmereMetadata } from "@/lib/seo/metadata";
import { getLocalizedString, getProductBySlugOrId } from "@/lib/products/catalog";

export function generateMetadata({ params }: { params: { locale: string; id: string } }): Metadata {
  const product = getProductBySlugOrId(params.id);
  const title = product ? `${getLocalizedString(product.title, params.locale)} — Velmère` : "Product — Velmère";
  const description = product
    ? getLocalizedString(product.shortDescription, params.locale)
    : "Velmère product detail page.";
  return buildVelmereMetadata({ locale: params.locale, path: `/shop/${params.id}`, title, description });
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient params={params} />;
}
