"use client";

import { useActionState } from "react";
import { createClientAction, updateClientAction } from "@/lib/actions";
import type { Client } from "@/lib/db";

export default function ClientForm({ client }: { client?: Client }) {
  const action = client ? updateClientAction : createClientAction;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {client && <input type="hidden" name="id" value={client.id} />}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name">
          Nombre o razón social *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={client?.name ?? ""}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Acme S.L."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="nif">
            NIF / CIF
          </label>
          <input
            id="nif"
            name="nif"
            defaultValue={client?.nif ?? ""}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="B12345678"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="facturas@acme.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="address">
          Dirección fiscal
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={client?.address ?? ""}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Calle Mayor 1, 28001 Madrid"
        />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Guardando…" : client ? "Guardar cambios" : "Crear cliente"}
      </button>
    </form>
  );
}
