import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { getPlan } from "@/lib/plans";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const plan = getPlan(user.plan);

  const nav = [
    { href: "/panel", label: "Resumen" },
    { href: "/panel/facturas", label: "Facturas" },
    { href: "/panel/clientes", label: "Clientes" },
    { href: "/panel/ajustes", label: "Ajustes" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white no-print">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/panel" className="text-lg font-bold tracking-tight">
              factur<span className="text-emerald-600">ia</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span
              className={`hidden sm:inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                plan.id === "free"
                  ? "bg-zinc-100 text-zinc-600"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              Plan {plan.name}
            </span>
            {plan.id === "free" && (
              <Link
                href="/panel/ajustes#plan"
                className="hidden sm:inline-block rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Mejorar a Pro
              </Link>
            )}
            <span className="hidden md:inline text-zinc-500">{user.email}</span>
            <form action={logoutAction}>
              <button className="rounded-lg px-3 py-1.5 text-zinc-600 hover:bg-zinc-100">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
