import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-zinc-50 px-6 py-16">
      <Link href="/" className="text-2xl font-bold tracking-tight mb-8">
        factur<span className="text-emerald-600">ia</span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        {children}
      </div>
    </main>
  );
}
