import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getInvoicesFor } from "@/lib/actions";
import { formatEUR, formatDate, computeTotals, STATUS_LABELS, STATUS_STYLES } from "@/lib/format";

export default async function FacturasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const invoices = await getInvoicesFor(user.id);

  const db = getDb();
  const allItems = db
    .prepare(
      `SELECT invoice_id, quantity, unit_price FROM invoice_items
       WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = ?)`
    )
    .all(user.id) as { invoice_id: number; quantity: number; unit_price: number }[];
  const itemsByInvoice = new Map<number, typeof allItems>();
  for (const it of allItems) {
    const list = itemsByInvoice.get(it.invoice_id) ?? [];
    list.push(it);
    itemsByInvoice.set(it.invoice_id, list);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Facturas</h1>
          <p className="text-sm text-zinc-500">Todas tus facturas, de la más reciente a la más antigua.</p>
        </div>
        <Link
          href="/panel/facturas/nueva"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500"
        >
          + Nueva factura
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        {invoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-500">
            No hay facturas todavía.{" "}
            <Link href="/panel/facturas/nueva" className="font-medium text-emerald-700 hover:underline">
              Crea la primera
            </Link>
            .
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-zinc-500">
                <th className="px-6 py-3 font-medium">Número</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Fecha</th>
                <th className="px-6 py-3 font-medium">Estado</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoices.map((inv) => {
                const totals = computeTotals(inv, itemsByInvoice.get(inv.id) ?? []);
                return (
                  <tr key={inv.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/panel/facturas/${inv.id}`}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{inv.client_name}</td>
                    <td className="px-6 py-4 hidden sm:table-cell text-zinc-500">
                      {formatDate(inv.issue_date)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[inv.status]}`}
                      >
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold tabular-nums">
                      {formatEUR(totals.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
