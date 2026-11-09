import Link from "next/link";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/jogadores", label: "Jogadores" },
  { href: "/treinadores", label: "Treinadores" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/historico", label: "Histórico" },
  { href: "/inspiracao", label: "Inspiração" },
  { href: "/prospecao", label: "Prospeção" },
  { href: "/agencias", label: "Agências" },
  { href: "/erros", label: "Erros" },
  { href: "/definicoes", label: "Definições" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-10 px-8">
          <Link href="/" className="font-display text-xl tracking-wide">
            GAMEDAY<span className="text-blue-600">.</span>
          </Link>
          <nav className="flex gap-1 text-sm">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-md px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/criar" className="btn ml-auto">
            + Nova edit
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-8 py-12">{children}</main>
    </div>
  );
}
