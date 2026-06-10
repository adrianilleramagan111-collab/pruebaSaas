import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Falta la firma" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Firma no válida" }, { status: 400 });
  }

  const db = getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = Number(session.metadata?.facturia_user_id);
      const plan = session.metadata?.plan;
      if (userId && (plan === "pro" || plan === "negocio")) {
        db.prepare(
          "UPDATE users SET plan = ?, stripe_subscription_id = ? WHERE id = ?"
        ).run(plan, String(session.subscription ?? ""), userId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      const userId = Number(sub.metadata?.facturia_user_id);
      if (userId) {
        db.prepare(
          "UPDATE users SET plan = 'free', stripe_subscription_id = NULL WHERE id = ?"
        ).run(userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
