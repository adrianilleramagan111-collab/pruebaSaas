import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PLANS, getPlan } from "@/lib/plans";
import { stripeConfigured } from "@/lib/stripe";
import SettingsForm from "@/components/SettingsForm";

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ pago?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const currentPlan = getPlan(user.plan);
  const billingReady = stripeConfigured();
  const { pago } = await searchParams;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-sm text-zinc-500">
          Estos datos aparecen como emisor en todas tus facturas.
        </p>
      </div>

      {pago === "ok" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ¡Pago completado! Tu plan se activará en cuanto Stripe confirme la suscripción (unos
          segundos).
        </div>
      )}
      {pago === "cancelado" && (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
          Pago cancelado. Sigues en tu plan actual.
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold mb-4">Datos de facturación</h2>
        <SettingsForm user={user} />
      </section>

      <section id="plan" className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Tu plan</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Ahora mismo estás en el plan <strong>{currentPlan.name}</strong>
          {currentPlan.priceMonthly > 0 && ` (${currentPlan.priceMonthly} €/mes)`}.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-5 flex flex-col ${
                plan.id === user.plan ? "border-emerald-600 bg-emerald-50/40" : "border-zinc-200"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-sm">
                  <span className="text-xl font-bold">{plan.priceMonthly} €</span>
                  <span className="text-zinc-500">/mes</span>
                </p>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-zinc-600 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-emerald-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                {plan.id === user.plan ? (
                  <p className="rounded-lg bg-zinc-100 px-4 py-2 text-center text-sm font-medium text-zinc-500">
                    Tu plan actual
                  </p>
                ) : plan.priceMonthly === 0 ? (
                  <p className="px-4 py-2 text-center text-sm text-zinc-400">
                    Gestiona la baja desde el portal de pago
                  </p>
                ) : (
                  <a
                    href={`/api/stripe/checkout?plan=${plan.id}`}
                    className="block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    Pasar a {plan.name}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {!billingReady && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Los pagos aún no están configurados en esta instancia. Define{" "}
            <code className="font-mono">STRIPE_SECRET_KEY</code>,{" "}
            <code className="font-mono">STRIPE_PRICE_PRO</code> y{" "}
            <code className="font-mono">STRIPE_PRICE_NEGOCIO</code> en las variables de entorno
            (ver README) para activar las suscripciones.
          </p>
        )}

        {user.stripe_customer_id && (
          <p className="mt-4 text-sm text-zinc-500">
            ¿Quieres cambiar de tarjeta, descargar recibos o cancelar?{" "}
            <a href="/api/stripe/portal" className="font-medium text-emerald-700 hover:underline">
              Abrir portal de facturación
            </a>
          </p>
        )}
      </section>
    </div>
  );
}
