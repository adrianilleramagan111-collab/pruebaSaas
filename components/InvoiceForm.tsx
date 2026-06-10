"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createInvoiceAction } from "@/lib/actions";
import { formatEUR } from "@/lib/format";
import type { Client } from "@/lib/db";

interface Line {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function InvoiceForm({
  clients,
  defaultIva,
  defaultIrpf,
}: {
  clients: Client[];
  defaultIva: number;
  defaultIrpf: number;
}) {
  const [state, formAction, pending] = useActionState(createInvoiceAction, {});
  const [lines, setLines] = useState<Line[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [ivaPct, setIvaPct] = useState(defaultIva);
  const [irpfPct, setIrpfPct] = useState(defaultIrpf);

  const updateLine = (i: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };

  const base = lines.reduce((s, l) => s + (l.quantity || 0) * (l.unit_price || 0), 0);
  const iva = base * (ivaPct / 100);
  const irpf = base * (irpfPct / 100);
  const total = base + iva - irpf;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items_json" value={JSON.stringify(lines)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="client_id">
            Cliente *
          </label>
          <select
            id="client_id"
            name="client_id"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Selecciona un cliente…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="mt-1 text-xs text-amber-700">
              No tienes clientes todavía.{" "}
              <Link href="/panel/clientes/nuevo" className="underline">
                Crea uno primero
              </Link>
              .
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="issue_date">
              Fecha de emisión
            </label>
            <input
              id="issue_date"
              name="issue_date"
              type="date"
              required
              defaultValue={today}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="due_date">
              Vencimiento
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Conceptos *</p>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                value={line.description}
                onChange={(e) => updateLine(i, { description: e.target.value })}
                placeholder="Descripción del servicio o producto"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                min="0"
                step="any"
                value={line.quantity}
                onChange={(e) => updateLine(i, { quantity: Number(e.target.value) })}
                className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Cantidad"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.unit_price}
                onChange={(e) => updateLine(i, { unit_price: Number(e.target.value) })}
                className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Precio unitario (€)"
              />
              <button
                type="button"
                onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={lines.length === 1}
                className="rounded-lg px-3 py-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30"
                aria-label="Eliminar línea"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLines((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }])}
          className="mt-2 text-sm font-medium text-emerald-700 hover:underline"
        >
          + Añadir concepto
        </button>
        <p className="mt-1 text-xs text-zinc-400">Columnas: descripción · cantidad · precio unitario (€)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="iva_pct">
              IVA (%)
            </label>
            <input
              id="iva_pct"
              name="iva_pct"
              type="number"
              min="0"
              step="0.1"
              value={ivaPct}
              onChange={(e) => setIvaPct(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="irpf_pct">
              IRPF (%)
            </label>
            <input
              id="irpf_pct"
              name="irpf_pct"
              type="number"
              min="0"
              step="0.1"
              value={irpfPct}
              onChange={(e) => setIrpfPct(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-500">Base imponible</span>
            <span className="tabular-nums">{formatEUR(base)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">IVA ({ivaPct}%)</span>
            <span className="tabular-nums">+{formatEUR(iva)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">IRPF ({irpfPct}%)</span>
            <span className="tabular-nums">−{formatEUR(irpf)}</span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-1 font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatEUR(total)}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="notes">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Forma de pago, IBAN, condiciones…"
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || clients.length === 0}
        className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Creando factura…" : "Crear factura"}
      </button>
    </form>
  );
}
