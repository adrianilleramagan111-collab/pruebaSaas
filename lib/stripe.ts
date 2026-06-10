import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      (process.env.STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_NEGOCIO)
  );
}

export function priceIdFor(planId: string): string | null {
  if (planId === "pro") return process.env.STRIPE_PRICE_PRO || null;
  if (planId === "negocio") return process.env.STRIPE_PRICE_NEGOCIO || null;
  return null;
}

export function appUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}
