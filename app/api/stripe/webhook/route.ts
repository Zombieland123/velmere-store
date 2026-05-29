import { NextResponse } from "next/server";
import { markFailed, markFulfilmentPending, markPaid } from "@/lib/orders/order-store";
import { persistStripeCheckoutOrder, type PersistOrderItemInput } from "@/lib/db/order-service";
import { getStripeServerClient } from "@/lib/stripe/server";
import { createPrintfulOrderDraft } from "@/lib/printful/orders";

export const runtime = "nodejs";

type CompactMetadataItem = {
  id?: unknown;
  q?: unknown;
  size?: unknown;
};

function parseMetadataOrderItems(value: string | null | undefined): PersistOrderItemInput[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item): PersistOrderItemInput[] => {
      const entry = item as CompactMetadataItem;
      if (typeof entry.id !== "string") return [];
      return [
        {
          productId: entry.id,
          quantity: Number.isFinite(Number(entry.q)) ? Math.max(1, Math.floor(Number(entry.q))) : 1,
          selectedSize: typeof entry.size === "string" ? entry.size : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET on server." }, { status: 500 });
  }

  const stripe = getStripeServerClient();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderDraftId = session.metadata?.orderDraftId;
    const metadataOrderItems = parseMetadataOrderItems(session.metadata?.orderItems);
    const walletAddress = session.metadata?.walletAddress || null;
    const locale = session.metadata?.locale || "en";

    const order = orderDraftId ? markPaid(orderDraftId, session.id) : null;
    const persisted = await persistStripeCheckoutOrder({
      session,
      locale,
      walletAddress,
      orderItems: order?.lineItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        title: item.title,
        unitAmount: item.amount,
        currency: item.currency,
        provider: item.provider,
        providerVariantId: item.providerVariantId,
      })) ?? metadataOrderItems,
      fallbackOrder: order,
    });

    if (!orderDraftId) {
      return NextResponse.json({ received: true, persisted, warning: "Missing orderDraftId metadata; persisted from Stripe metadata only." });
    }

    if (!order) {
      return NextResponse.json({ received: true, persisted, warning: "Order draft not found in current memory store; persisted from Stripe metadata." });
    }

    try {
      const hasPrintfulItems = order.lineItems.some(
        (item) => item.provider === "printful" && item.fulfilmentMode === "automatic",
      );
      if (hasPrintfulItems) {
        const fulfilment = await createPrintfulOrderDraft(order, session);
        if (fulfilment.created) {
          markFulfilmentPending(orderDraftId);
        } else {
          markFailed(orderDraftId, fulfilment.warning);
        }
      } else {
        markFulfilmentPending(orderDraftId);
      }
    } catch (error) {
      markFailed(orderDraftId, error instanceof Error ? error.message : "Printful fulfilment failed.");
    }
  }

  return NextResponse.json({ received: true });
}
