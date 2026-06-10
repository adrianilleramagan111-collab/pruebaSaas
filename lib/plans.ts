export interface Plan {
  id: "free" | "pro" | "negocio";
  name: string;
  priceMonthly: number; // EUR
  invoicesPerMonth: number | null; // null = ilimitadas
  features: string[];
  stripePriceEnv?: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratis",
    priceMonthly: 0,
    invoicesPerMonth: 5,
    features: [
      "5 facturas al mes",
      "Clientes ilimitados",
      "Cálculo automático de IVA e IRPF",
      "Enlace público y PDF de cada factura",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    invoicesPerMonth: null,
    features: [
      "Facturas ilimitadas",
      "Todo lo del plan Gratis",
      "Sin marca Facturia en tus facturas",
      "Numeración con prefijo personalizado",
      "Soporte prioritario por email",
    ],
    stripePriceEnv: "STRIPE_PRICE_PRO",
  },
  {
    id: "negocio",
    name: "Negocio",
    priceMonthly: 49,
    invoicesPerMonth: null,
    features: [
      "Todo lo del plan Pro",
      "Hasta 5 miembros de equipo",
      "Exportación contable trimestral",
      "Soporte dedicado",
    ],
    stripePriceEnv: "STRIPE_PRICE_NEGOCIO",
  },
];

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function invoiceLimitFor(planId: string): number | null {
  return getPlan(planId).invoicesPerMonth;
}
