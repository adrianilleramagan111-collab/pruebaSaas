import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <main className="flex-1">
      {/* Nav */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            factur<span className="text-emerald-600">ia</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#funciones" className="text-zinc-600 hover:text-zinc-900 hidden sm:block">
              Funciones
            </a>
            <a href="#precios" className="text-zinc-600 hover:text-zinc-900 hidden sm:block">
              Precios
            </a>
            {user ? (
              <Link
                href="/panel"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-white font-medium hover:bg-zinc-700"
              >
                Ir al panel
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-500"
                >
                  Empieza gratis
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <p className="inline-block rounded-full bg-emerald-50 text-emerald-700 px-4 py-1 text-sm font-medium mb-6">
          Para autónomos y pymes de España y Latinoamérica
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
          Factura en 30 segundos.
          <br />
          <span className="text-emerald-600">Cobra antes.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
          Facturia crea facturas profesionales con IVA e IRPF calculados automáticamente,
          numeración legal correlativa y un enlace para que tu cliente la vea y descargue en PDF.
          Sin Excel, sin plantillas rotas, sin asesoría de por medio.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/registro"
            className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
          >
            Crear mi primera factura gratis
          </Link>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Sin tarjeta de crédito · 5 facturas gratis al mes · Cancela cuando quieras
        </p>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-zinc-100 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">30 seg</p>
            <p className="text-sm text-zinc-500">de cero a factura enviada</p>
          </div>
          <div>
            <p className="text-3xl font-bold">IVA + IRPF</p>
            <p className="text-sm text-zinc-500">calculados sin errores, siempre</p>
          </div>
          <div>
            <p className="text-3xl font-bold">0 €</p>
            <p className="text-sm text-zinc-500">para empezar hoy mismo</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funciones" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center">Todo lo que necesitas para facturar</h2>
        <p className="mt-3 text-center text-zinc-600">Y nada de lo que no.</p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Facturas en segundos",
              desc: "Elige cliente, añade conceptos y listo. Numeración correlativa automática por año, como exige Hacienda.",
            },
            {
              title: "IVA e IRPF automáticos",
              desc: "Configura tus tipos por defecto una vez. Cada factura sale con la base, el IVA y la retención correctos.",
            },
            {
              title: "Enlace para tu cliente",
              desc: "Cada factura tiene un enlace privado: tu cliente la ve en el navegador y la descarga en PDF sin registrarse.",
            },
            {
              title: "Control de cobros",
              desc: "Marca facturas como enviadas, pagadas o vencidas y ve de un vistazo cuánto te deben.",
            },
            {
              title: "Tus clientes, ordenados",
              desc: "Ficha de cada cliente con NIF, dirección y email. Reutilízala en cada factura sin volver a teclear.",
            },
            {
              title: "Tus datos, tuyos",
              desc: "Exporta cuando quieras. Sin permanencia: si te vas, te llevas todo.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-200 p-6">
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-center">Precios simples y honestos</h2>
          <p className="mt-3 text-center text-zinc-600">
            Empieza gratis. Mejora cuando tu negocio lo pida.
          </p>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const highlighted = plan.id === "pro";
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border bg-white p-8 flex flex-col ${
                    highlighted
                      ? "border-emerald-600 ring-2 ring-emerald-600 shadow-xl"
                      : "border-zinc-200"
                  }`}
                >
                  {highlighted && (
                    <p className="mb-3 inline-block self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Más popular
                    </p>
                  )}
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-4">
                    <span className="text-4xl font-bold">{plan.priceMonthly} €</span>
                    <span className="text-zinc-500"> /mes</span>
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-zinc-600 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/registro"
                    className={`mt-8 rounded-xl px-6 py-3 text-center font-semibold ${
                      highlighted
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "border border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {plan.priceMonthly === 0 ? "Empezar gratis" : `Elegir ${plan.name}`}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center">Preguntas frecuentes</h2>
        <div className="mt-10 space-y-6">
          {[
            {
              q: "¿Las facturas son válidas legalmente?",
              a: "Sí. Incluyen numeración correlativa, fecha de emisión, datos fiscales de emisor y receptor, base imponible, IVA e IRPF desglosados: los requisitos del reglamento de facturación español.",
            },
            {
              q: "¿Puedo usar Facturia gratis para siempre?",
              a: "Sí. El plan Gratis incluye 5 facturas al mes sin límite de tiempo. Si necesitas más, el plan Pro cuesta menos que un menú del día.",
            },
            {
              q: "¿Cómo recibe mi cliente la factura?",
              a: "Cada factura genera un enlace privado. Se lo envías por email o WhatsApp y tu cliente la ve en el navegador y la descarga en PDF. Sin registros ni descargas raras.",
            },
            {
              q: "¿Qué pasa si me doy de baja?",
              a: "Nada dramático: tus datos siguen siendo tuyos y puedes exportarlos. No hay permanencia ni letra pequeña.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-2xl border border-zinc-200 p-6">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-zinc-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Tu próxima factura puede estar lista en 30 segundos
          </h2>
          <p className="mt-4 text-zinc-300">
            Únete gratis y deja de pelearte con plantillas de Word.
          </p>
          <Link
            href="/registro"
            className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-400"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>
            factur<span className="text-emerald-600 font-semibold">ia</span> · Facturación
            sencilla para autónomos
          </p>
          <p>© {new Date().getFullYear()} Facturia. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
