import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getStripe, priceIdFor, appUrl } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", appUrl()));

  const plan = req.nextUrl.searchParams.get("plan") || "pro";
  const stripe = getStripe();
  const priceId = priceIdFor(plan);

  if (!stripe || !priceId) {
    return NextResponse.redirect(new URL("/panel/ajustes?pago=cancelado#plan", appUrl()));
  }

  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.business_name || user.name,
      metadata: { facturia_user_id: String(user.id) },
    });
    customerId = customer.id;
    getDb()
      .prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?")
      .run(customerId, user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl()}/panel/ajustes?pago=ok#plan`,
    cancel_url: `${appUrl()}/panel/ajustes?pago=cancelado#plan`,
    metadata: { facturia_user_id: String(user.id), plan },
    subscription_data: {
      metadata: { facturia_user_id: String(user.id), plan },
    },
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
