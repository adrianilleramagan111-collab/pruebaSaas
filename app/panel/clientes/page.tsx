import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getClientsFor, deleteClientAction } from "@/lib/actions";

export default async function ClientesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const clients = await getClientsFor(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-zinc-500">Las personas y empresas a las que facturas.</p>
        </div>
        <Link
          href="/panel/clientes/nuevo"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500"
        >
          + Nuevo cliente
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white">
        {clients.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-zinc-500">
            Aún no tienes clientes.{" "}
            <Link href="/panel/clientes/nuevo" className="font-medium text-emerald-700 hover:underline">
              Crea el primero
            </Link>{" "}
            para empezar a facturar.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {clients.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-zinc-500 truncate">
                    {[c.nif, c.email].filter(Boolean).join(" · ") || "Sin datos fiscales"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/panel/clientes/${c.id}`}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
                  >
                    Editar
                  </Link>
                  <form action={deleteClientAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                      Borrar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-zinc-400">
        Los clientes con facturas no se pueden borrar, para mantener tu numeración legal intacta.
      </p>
    </div>
  );
}
