import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb, Client, Invoice, InvoiceItem } from "@/lib/db";
import { setInvoiceStatusAction, deleteInvoiceAction } from "@/lib/actions";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/format";
import InvoiceDocument from "@/components/InvoiceDocument";
import CopyLinkButton from "@/components/CopyLinkButton";
import PrintButton from "@/components/PrintButton";

export default async function FacturaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const db = getDb();

  const invoice = db
    .prepare("SELECT * FROM invoices WHERE id = ? AND user_id = ?")
    .get(Number(id), user.id) as Invoice | undefined;
  if (!invoice) notFound();

  const client = db
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(invoice.client_id) as Client;
  const items = db
    .prepare("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY position")
    .all(invoice.id) as InvoiceItem[];

  const statuses: Invoice["status"][] = ["borrador", "enviada", "pagada", "vencida"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{invoice.number}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[invoice.status]}`}
          >
            {STATUS_LABELS[invoice.status]}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyLinkButton path={`/f/${invoice.share_token}`} />
          <PrintButton />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 no-print">
        <span className="text-sm text-zinc-500">Marcar como:</span>
        {statuses
          .filter((s) => s !== invoice.status)
          .map((s) => (
            <form key={s} action={setInvoiceStatusAction}>
              <input type="hidden" name="id" value={invoice.id} />
              <input type="hidden" name="status" value={s} />
              <button className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50">
                {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
        <form action={deleteInvoiceAction} className="ml-auto">
          <input type="hidden" name="id" value={invoice.id} />
          <button className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
            Eliminar factura
          </button>
        </form>
      </div>

      <InvoiceDocument
        invoice={invoice}
        items={items}
        client={client}
        issuer={user}
        showBranding={user.plan === "free"}
      />
    </div>
  );
}
