"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/lib/actions";

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState(registerAction, {});

  return (
    <>
      <h1 className="text-xl font-semibold">Crea tu cuenta gratis</h1>
      <p className="mt-1 text-sm text-zinc-500">5 facturas al mes gratis, para siempre.</p>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Tu nombre o el de tu negocio
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="María García · Diseño"
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
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {pending ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Entra aquí
        </Link>
      </p>
    </>
  );
}
