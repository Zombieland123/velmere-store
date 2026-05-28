import { NextResponse } from "next/server";
import { markFailed, markFulfilmentPending, markPaid } from "@/lib/orders/order-store";
import { getStripeServerClient } from "@/lib/stripe/server";
import { createPrintfulOrderDraft } from "@/lib/printful/orders";

export const runtime = "nodejs";

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
  } catch {
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderDraftId = session.metadata?.orderDraftId;
    if (!orderDraftId) {
      return NextResponse.json({ received: true, warning: "Missing orderDraftId metadata." });
    }

    const order = markPaid(orderDraftId, session.id);
    if (!order) {
      return NextResponse.json({ received: true, warning: "Order draft not found in current order store." });
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
