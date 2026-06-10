import ClientForm from "@/components/ClientForm";

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo cliente</h1>
        <p className="text-sm text-zinc-500">
          Solo el nombre es obligatorio; el resto lo puedes completar después.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <ClientForm />
      </div>
    </div>
  );
}
