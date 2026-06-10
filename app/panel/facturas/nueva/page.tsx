import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getClientsFor } from "@/lib/actions";
import InvoiceForm from "@/components/InvoiceForm";

export default async function NuevaFacturaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const clients = await getClientsFor(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva factura</h1>
        <p className="text-sm text-zinc-500">
          El número se asigna automáticamente de forma correlativa.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <InvoiceForm
          clients={clients}
          defaultIva={user.default_iva}
          defaultIrpf={user.default_irpf}
        />
      </div>
    </div>
  );
}
