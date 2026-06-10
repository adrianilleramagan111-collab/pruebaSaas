import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatEUR, formatDate, STATUS_LABELS, STATUS_STYLES, computeTotals } from "@/lib/format";
import { invoiceLimitFor } from "@/lib/plans";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const db = getDb();

  const invoices = db
    .prepare(
      `SELECT i.*, c.name AS client_name FROM invoices i
       JOIN clients c ON c.id = i.client_id
       WHERE i.user_id = ? ORDER BY i.created_at DESC, i.id DESC`
    )
    .all(user.id) as (import("@/lib/db").Invoice & { client_name: string })[];

  const itemsByInvoice = new Map<number, { quantity: number; unit_price: number }[]>();
  if (invoices.length > 0) {
    const allItems = db
      .prepare(
        `SELECT invoice_id, quantity, unit_price FROM invoice_items
         WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = ?)`
      )
      .all(user.id) as { invoice_id: number; quantity: number; unit_price: number }[];
    for (const it of allItems) {
      const list = itemsByInvoice.get(it.invoice_id) ?? [];
      list.push(it);
      itemsByInvoice.set(it.invoice_id, list);
    }
  }

  const totalOf = (inv: (typeof invoices)[number]) =>
    computeTotals(inv, itemsByInvoice.get(inv.id) ?? []).total;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const paidThisMonth = invoices
    .filter((i) => i.status === "pagada" && i.issue_date.startsWith(thisMonth))
    .reduce((s, i) => s + totalOf(i), 0);
  const pending = invoices
    .filter((i) => i.status === "enviada" || i.status === "vencida")
    .reduce((s, i) => s + totalOf(i), 0);
  const clientCount = (
    db.prepare("SELECT COUNT(*) AS n FROM clients WHERE user_id = ?").get(user.id) as { n: number }
  ).n;

  const createdThisMonth = invoices.filter((i) => i.created_at.startsWith(thisMonth)).length;
  const limit = invoiceLimitFor(user.plan);
  const recent = invoices.slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Hola, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-zinc-500">Esto es lo que está pasando con tu facturación.</p>
        </div>
        <Link
          href="/panel/facturas/nueva"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500"
        >
          + Nueva factura
        </Link>
      </div>

      {limit !== null && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            createdThisMonth >= limit
              ? "border-amber-300 bg-amber-50 text-amber-800"
              : "border-zinc-200 bg-white text-zinc-600"
          }`}
        >
          Has creado <strong>{createdThisMonth} de {limit}</strong> facturas de tu plan Gratis este
          mes.{" "}
          <Link href="/panel/ajustes#plan" className="font-semibold text-emerald-700 hover:underline">
            Pásate a Pro
          </Link>{" "}
          para facturar sin límites.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Cobrado este mes</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{formatEUR(paidThisMonth)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Pendiente de cobro</p>
          <p className="mt-2 text-3xl font-bold">{formatEUR(pending)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Clientes</p>
          <p className="mt-2 text-3xl font-bold">{clientCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="font-semibold">Últimas facturas</h2>
          <Link href="/panel/facturas" className="text-sm text-emerald-700 hover:underline">
            Ver todas
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-500">
            Todavía no has creado ninguna factura.{" "}
            <Link href="/panel/facturas/nueva" className="font-medium text-emerald-700 hover:underline">
              Crea la primera
            </Link>{" "}
            — tardas 30 segundos.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {recent.map((inv) => (
              <li key={inv.id}>
                <Link
                  href={`/panel/facturas/${inv.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-zinc-50"
                >
                  <div>
                    <p className="font-medium">{inv.number}</p>
                    <p className="text-sm text-zinc-500">
                      {inv.client_name} · {formatDate(inv.issue_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[inv.status]}`}
                    >
                      {STATUS_LABELS[inv.status]}
                    </span>
                    <span className="font-semibold tabular-nums">{formatEUR(totalOf(inv))}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
