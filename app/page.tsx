import { appConfig } from "@/lib/config";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-6">
      <div>
        <p className="text-sm font-semibold text-primary">{appConfig.businessName}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Inventory UI Kit</h1>
        <p className="mt-2 text-muted">Start here while the real screens are being built.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href="/ui-kit" className="rounded-lg border border-line bg-surface p-5 shadow-sm transition-colors hover:border-primary">
          <p className="font-bold">UI kit showcase →</p>
          <p className="mt-1 text-sm text-muted">Every component with live examples.</p>
        </a>
        <a href="/inventory" className="rounded-lg border border-line bg-surface p-5 shadow-sm transition-colors hover:border-primary">
          <p className="font-bold">Example: Inventory →</p>
          <p className="mt-1 text-sm text-muted">A full screen built with the kit.</p>
        </a>
      </div>
    </main>
  );
}
