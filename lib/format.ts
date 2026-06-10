import type { Invoice, InvoiceItem } from "./db";

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(d);
}

export interface InvoiceTotals {
  base: number;
  iva: number;
  irpf: number;
  total: number;
}

export function computeTotals(
  invoice: Pick<Invoice, "iva_pct" | "irpf_pct">,
  items: Pick<InvoiceItem, "quantity" | "unit_price">[]
): InvoiceTotals {
  const base = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  const iva = base * (invoice.iva_pct / 100);
  const irpf = base * (invoice.irpf_pct / 100);
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    base: round(base),
    iva: round(iva),
    irpf: round(irpf),
    total: round(base + iva - irpf),
  };
}

export const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  pagada: "Pagada",
  vencida: "Vencida",
};

export const STATUS_STYLES: Record<string, string> = {
  borrador: "bg-zinc-100 text-zinc-700",
  enviada: "bg-blue-100 text-blue-700",
  pagada: "bg-emerald-100 text-emerald-700",
  vencida: "bg-red-100 text-red-700",
};
