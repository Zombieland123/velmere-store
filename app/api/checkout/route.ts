import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getCheckoutReadiness } from "@/lib/checkout/config";
import { createOrderDraft, markCheckoutStarted, type OrderLineItem } from "@/lib/orders/order-store";
import { formatMoney, getLocalizedString, getProductBySlugOrId, isProductCustomerPurchasable } from "@/lib/products/catalog";
import { getStripeServerClient } from "@/lib/stripe/server";

type CheckoutCartItem = {
  productId: string;
  variantId?: string;
  size?: string;
  quantity?: number;
};

export const runtime = "nodejs";

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function POST(req: Request) {
  const readiness = getCheckoutReadiness();
  if (readiness.mode !== "stripe" || !readiness.enabled) {
    return jsonError("Checkout is disabled until Stripe and store readiness are configured.", 503, readiness.reasons);
  }

  if (process.env.STORE_COMMERCIAL_READY !== "true") {
    return jsonError(
      "Checkout is disabled until legal, shipping, returns, tax, contact, and fulfilment data are finalized.",
      503,
    );
  }

  const body = (await req.json().catch(() => null)) as { items?: CheckoutCartItem[]; locale?: string } | null;
  const items = body?.items ?? [];
  const locale = body?.locale === "en" || body?.locale === "de" || body?.locale === "pl" ? body.locale : "pl";
  if (items.length === 0) return jsonError("Cart is empty.");

  const orderItems: OrderLineItem[] = [];

  for (const item of items) {
    const product = getProductBySlugOrId(item.productId);
    if (!product) return jsonError("A product in the cart is no longer available.", 404);
    if (!isProductCustomerPurchasable(product)) {
      return jsonError(`${getLocalizedString(product.title, locale)} is not available for checkout yet.`, 409);
    }

    const variant =
      product.variants.find((entry) => entry.id === item.variantId) ??
      product.variants.find((entry) => entry.size === item.size);
    if (!variant) return jsonError(`${getLocalizedString(product.title, locale)} requires a valid variant.`, 409);

    const quantity = Math.max(1, Math.min(10, Math.floor(item.quantity ?? 1)));
    const variantPrice = variant.price ?? product.price;
    const providerVariantId = variant.providerVariantId ?? product.providerVariantIds?.[variant.id];
    orderItems.push({
      productId: product.id,
      variantId: variant.id,
      quantity,
      title: `${getLocalizedString(product.title, locale)} / ${variant.title}`,
      amount: variantPrice.amount,
      currency: variantPrice.currency,
      provider: product.provider,
      fulfilmentMode: product.fulfilmentMode,
      providerVariantId,
    });
  }

  const cartHash = createHash("sha256").update(JSON.stringify(orderItems)).digest("hex");
  const order = createOrderDraft({ locale, cartHash, lineItems: orderItems });
  const stripe = getStripeServerClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/${locale}/checkout/cancel?order=${order.id}`,
    line_items: orderItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: item.currency.toLowerCase(),
        unit_amount: item.amount,
        product_data: {
          name: item.title,
        },
      },
    })),
    metadata: {
      orderDraftId: order.id,
      locale,
      providerIds: orderItems.map((item) => `${item.provider}:${item.providerVariantId ?? "manual"}`).join(",").slice(0, 450),
      cartHash,
    },
  });

  if (!session.id || !session.url) return jsonError("Stripe did not return a checkout URL.", 502);

  markCheckoutStarted(order.id, session.id);

  return NextResponse.json({
    url: session.url,
    orderDraftId: order.id,
    subtotal: formatMoney(
      {
        amount: orderItems.reduce((sum, item) => sum + item.amount * item.quantity, 0),
        currency: orderItems[0].currency,
      },
      locale,
    ),
  });
}
