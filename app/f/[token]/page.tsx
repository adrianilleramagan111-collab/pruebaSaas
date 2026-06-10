import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb, Client, Invoice, InvoiceItem, User } from "@/lib/db";
import InvoiceDocument from "@/components/InvoiceDocument";
import PrintButton from "@/components/PrintButton";

export default async function FacturaPublicaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token)) notFound();
  const db = getDb();

  const invoice = db
    .prepare("SELECT * FROM invoices WHERE share_token = ?")
    .get(token) as Invoice | undefined;
  if (!invoice) notFound();

  const issuer = db.prepare("SELECT * FROM users WHERE id = ?").get(invoice.user_id) as User;
  const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(invoice.client_id) as Client;
  const items = db
    .prepare("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY position")
    .all(invoice.id) as InvoiceItem[];

  return (
    <main className="flex-1 bg-zinc-100 print:bg-white">
      <div className="mx-auto max-w-3xl px-4 py-10 print:p-0">
        <div className="mb-6 flex items-center justify-between no-print">
          <p className="text-sm text-zinc-500">
            Factura {invoice.number} de {issuer.business_name || issuer.name}
          </p>
          <PrintButton />
        </div>
        <InvoiceDocument
          invoice={invoice}
          items={items}
          client={client}
          issuer={issuer}
          showBranding={issuer.plan === "free"}
        />
        {issuer.plan === "free" && (
          <p className="mt-8 text-center text-sm text-zinc-400 no-print">
            ¿Tú también facturas?{" "}
            <Link href="/" className="font-medium text-emerald-700 hover:underline">
              Crea facturas como esta gratis con Facturia
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
