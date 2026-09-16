"use client";

import { useState } from "react";
import { X, Store, Loader2 } from "lucide-react";

interface NovoVendedorModalProps {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: () => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-100";

export default function NovoVendedorModal({ aberto, aoFechar, aoSalvar }: NovoVendedorModalProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [documentoCpf, setDocumentoCpf] = useState("");
  const [creci, setCreci] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!aberto) return null;

  async function salvar() {
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/vendedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          telefone: telefone || null,
          email: email || null,
          documentoCpf: documentoCpf || null,
          creci: creci || null,
        }),
      });
      if (!res.ok) throw new Error("Falha ao cadastrar vendedor");
      setNome("");
      setTelefone("");
      setEmail("");
      setDocumentoCpf("");
      setCreci("");
      aoSalvar();
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={aoFechar} />
      <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-zinc-100">
              <Store className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Novo Vendedor / Anunciante
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Cadastro de corretor ou parceiro anunciante que atua nas oportunidades.
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
              Nome completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Carlos Andrade"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
                CREci
              </label>
              <input
                type="text"
                value={creci}
                onChange={(e) => setCreci(e.target.value)}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
                CPF
              </label>
              <input
                type="text"
                value={documentoCpf}
                onChange={(e) => setDocumentoCpf(e.target.value)}
                placeholder="Opcional"
                className={inputClass}
              />
            </div>
          </div>
          {erro && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {erro}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={aoFechar}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={enviando || !nome.trim()}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
}