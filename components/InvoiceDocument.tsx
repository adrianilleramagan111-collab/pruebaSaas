import type { Client, Invoice, InvoiceItem, User } from "@/lib/db";
import { computeTotals, formatDate, formatEUR } from "@/lib/format";

export default function InvoiceDocument({
  invoice,
  items,
  client,
  issuer,
  showBranding,
}: {
  invoice: Invoice;
  items: InvoiceItem[];
  client: Client;
  issuer: User;
  showBranding: boolean;
}) {
  const totals = computeTotals(invoice, items);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10 print:border-0 print:p-0">
      <div className="flex flex-wrap justify-between gap-6">
        <div>
          <p className="text-2xl font-bold">{issuer.business_name || issuer.name}</p>
          <div className="mt-1 text-sm text-zinc-500 whitespace-pre-line">
            {[issuer.business_nif, issuer.business_address, issuer.business_email, issuer.business_phone]
              .filter(Boolean)
              .join("\n")}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm uppercase tracking-wide text-zinc-400">Factura</p>
          <p className="text-xl font-bold">{invoice.number}</p>
          <p className="mt-1 text-sm text-zinc-500">Emitida: {formatDate(invoice.issue_date)}</p>
          {invoice.due_date && (
            <p className="text-sm text-zinc-500">Vence: {formatDate(invoice.due_date)}</p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-zinc-50 p-4 print:bg-transparent print:border print:border-zinc-200">
        <p className="text-xs uppercase tracking-wide text-zinc-400">Facturar a</p>
        <p className="mt-1 font-semibold">{client.name}</p>
        <div className="text-sm text-zinc-500 whitespace-pre-line">
          {[client.nif, client.address, client.email].filter(Boolean).join("\n")}
        </div>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-zinc-500">
            <th className="py-2 font-medium">Concepto</th>
            <th className="py-2 font-medium text-right">Cant.</th>
            <th className="py-2 font-medium text-right">Precio</th>
            <th className="py-2 font-medium text-right">Importe</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {items.map((it) => (
            <tr key={it.id}>
              <td className="py-3 pr-4">{it.description}</td>
              <td className="py-3 text-right tabular-nums">{it.quantity}</td>
              <td className="py-3 text-right tabular-nums">{formatEUR(it.unit_price)}</td>
              <td className="py-3 text-right tabular-nums">
                {formatEUR(it.quantity * it.unit_price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Base imponible</span>
            <span className="tabular-nums">{formatEUR(totals.base)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">IVA ({invoice.iva_pct}%)</span>
            <span className="tabular-nums">+{formatEUR(totals.iva)}</span>
          </div>
          {invoice.irpf_pct > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Retención IRPF ({invoice.irpf_pct}%)</span>
              <span className="tabular-nums">−{formatEUR(totals.irpf)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
            <span>Total</span>
            <span className="tabular-nums">{formatEUR(totals.total)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 text-sm text-zinc-500">
          <p className="text-xs uppercase tracking-wide text-zinc-400">Notas</p>
          <p className="mt-1 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {showBranding && (
        <p className="mt-10 text-center text-xs text-zinc-300">
          Factura creada con facturia
        </p>
      )}
    </div>
  );
}
