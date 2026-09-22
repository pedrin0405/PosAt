"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VendedoresPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a view de vendedores no slider de oportunidades
    router.push("/oportunidades?view=vendedores");
  }, [router]);

  return (
    <div className="h-full flex items-center justify-center text-slate-400">
      Redirecionando para Vendedores…
    </div>
  );
}