import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDb, Client } from "@/lib/db";
import ClientForm from "@/components/ClientForm";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const client = getDb()
    .prepare("SELECT * FROM clients WHERE id = ? AND user_id = ?")
    .get(Number(id), user.id) as Client | undefined;
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar cliente</h1>
        <p className="text-sm text-zinc-500">{client.name}</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <ClientForm client={client} />
      </div>
    </div>
  );
}
