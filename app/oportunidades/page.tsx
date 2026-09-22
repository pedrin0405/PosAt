"use client";

import { Suspense } from "react";
import OportunidadesVendedoresSlider from "@/components/OportunidadesVendedoresSlider";

export default function OportunidadesPage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-sm text-slate-400">Carregando…</div>}>
      <OportunidadesVendedoresSlider />
    </Suspense>
  );
}