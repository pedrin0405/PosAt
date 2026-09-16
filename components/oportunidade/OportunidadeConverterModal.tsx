"use client";

import { useState } from "react";
import { X, MessageCirclePlus, Loader2 } from "lucide-react";
import { OportunidadeItem } from "@/lib/segmentacao/tipos";

export interface DadosConversaoLead {
  nome?: string;
  telefone?: string;
  email?: string;
  documento?: string;
}

interface OportunidadeConverterModalProps {
  oportunidade: OportunidadeItem;
  aoFechar: () => void;
  aoConfirmar: (dados: DadosConversaoLead) => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100";

export default function OportunidadeConverterModal({
  oportunidade: o,
  aoFechar,
  aoConfirmar,
}: OportunidadeConverterModalProps) {
  const [nome, setNome] = useState(o.cliente?.nome || "");
  const [telefone, setTelefone] = useState(o.cliente?.telefone || "");
  const [email, setEmail] = useState(o.cliente?.email || "");
  const [documento, setDocumento] = useState("");
  const [enviando, setEnviando] = useState(false);

  const confirmar = () => {
    setEnviando(true);
    aoConfirmar({
      nome: nome || undefined,
      telefone: telefone || undefined,
      email: email || undefined,
      documento: documento || undefined,
    });
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
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-zinc-100">
              <MessageCirclePlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Converter em novo lead
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              A oportunidade será encerrada como &ldquo;convertida&rdquo; e um novo lead
              será criado com um primeiro contato agendado.
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

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
              Nome do lead
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
                CPF / Doc.
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
          </div>
          <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs leading-relaxed text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            Na conversão, cadastros com mesmo telefone, e-mail ou documento são
            reutilizados (o lead não é duplicado).
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
            disabled={enviando || !nome.trim()}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Converter
          </button>
        </div>
      </div>
    </div>
  );
}