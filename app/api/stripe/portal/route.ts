import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, appUrl } from "@/lib/stripe";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", appUrl()));

  const stripe = getStripe();
  if (!stripe || !user.stripe_customer_id) {
    return NextResponse.redirect(new URL("/panel/ajustes#plan", appUrl()));
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${appUrl()}/panel/ajustes#plan`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
