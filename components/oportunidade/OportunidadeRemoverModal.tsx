"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { OportunidadeItem } from "@/lib/segmentacao/tipos";

interface OportunidadeRemoverModalProps {
  oportunidade: OportunidadeItem;
  aoFechar: () => void;
  aoConfirmar: (motivo: string) => void;
}

export default function OportunidadeRemoverModal({
  aoFechar,
  aoConfirmar,
}: OportunidadeRemoverModalProps) {
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const confirmar = () => {
    setEnviando(true);
    aoConfirmar(motivo);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={aoFechar}
      />
      <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-rose-700 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              Perdeu interesse
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              A oportunidade será movida para &ldquo;Removidas&rdquo; com o motivo registrado
              para reavaliação futura.
            </p>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
            Motivo
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Ex.: sem resposta após 2 tentativas, cliente não demonstrou interesse…"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-rose-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            Motivo fica visível no card e no histórico da oportunidade.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={aoFechar}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={enviando || !motivo.trim()}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}