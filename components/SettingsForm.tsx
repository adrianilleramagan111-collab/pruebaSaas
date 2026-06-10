"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/lib/actions";
import type { User } from "@/lib/db";

export default function SettingsForm({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, {});

  const field =
    "w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <form action={formAction} className="space-y-4 max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="business_name">
            Nombre fiscal / razón social
          </label>
          <input
            id="business_name"
            name="business_name"
            defaultValue={user.business_name ?? ""}
            className={field}
            placeholder="María García Pérez"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="business_nif">
            NIF / CIF
          </label>
          <input
            id="business_nif"
            name="business_nif"
            defaultValue={user.business_nif ?? ""}
            className={field}
            placeholder="12345678Z"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="business_address">
          Dirección fiscal
        </label>
        <textarea
          id="business_address"
          name="business_address"
          rows={2}
          defaultValue={user.business_address ?? ""}
          className={field}
          placeholder="Calle Mayor 1, 28001 Madrid"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="business_email">
            Email en facturas
          </label>
          <input
            id="business_email"
            name="business_email"
            type="email"
            defaultValue={user.business_email ?? ""}
            className={field}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="business_phone">
            Teléfono en facturas
          </label>
          <input
            id="business_phone"
            name="business_phone"
            defaultValue={user.business_phone ?? ""}
            className={field}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="invoice_prefix">
            Prefijo de numeración
          </label>
          <input
            id="invoice_prefix"
            name="invoice_prefix"
            defaultValue={user.invoice_prefix}
            maxLength={6}
            className={field}
            placeholder="F"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="default_iva">
            IVA por defecto (%)
          </label>
          <input
            id="default_iva"
            name="default_iva"
            type="number"
            min="0"
            step="0.1"
            defaultValue={user.default_iva}
            className={field}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="default_irpf">
            IRPF por defecto (%)
          </label>
          <input
            id="default_irpf"
            name="default_irpf"
            type="number"
            min="0"
            step="0.1"
            defaultValue={user.default_irpf}
            className={field}
          />
        </div>
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Ajustes guardados correctamente.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar ajustes"}
      </button>
    </form>
  );
}
