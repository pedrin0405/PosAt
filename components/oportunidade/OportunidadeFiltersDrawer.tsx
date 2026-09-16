"use client";

import {
  X,
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { REGRA_LABEL, ORIGEM_LABEL } from "./oportunidade-ui";

export interface FiltrosOportunidade {
  busca: string;
  origem: string;
  regra: string;
  vendedor: string;
}

interface OportunidadeFiltersDrawerProps {
  aberto: boolean;
  aoFechar: () => void;
  filtros: FiltrosOportunidade;
  setFiltros: (f: FiltrosOportunidade) => void;
  vendedores: { id: string; nome: string }[];
  aoLimpar: () => void;
}

const ORIGENS = ["crm", "manual", "whatsapp", "formulario", "planilha"] as const;
const REGRAS = [
  "venda_recente",
  "locacao_recente",
  "base_retrabalho",
  "origem_manual",
] as const;

export default function OportunidadeFiltersDrawer({
  aberto,
  aoFechar,
  filtros,
  setFiltros,
  vendedores,
  aoLimpar,
}: OportunidadeFiltersDrawerProps) {
  if (!aberto) return null;

  const mudar = (campo: keyof FiltrosOportunidade, valor: string) => {
    setFiltros({ ...filtros, [campo]: valor });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={aoFechar}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
              Filtros de oportunidades
            </h2>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar filtros"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
              Busca
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => mudar("busca", e.target.value)}
                placeholder="Cliente, imóvel, vendedor…"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
              Origem do registro
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => mudar("origem", "")}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                style={{
                  background: filtros.origem === "" ? "var(--text-primary)" : "var(--surface)",
                  color: filtros.origem === "" ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                Todas
              </button>
              {ORIGENS.map((orig) => (
                <button
                  key={orig}
                  type="button"
                  onClick={() => mudar("origem", filtros.origem === orig ? "" : orig)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    background: filtros.origem === orig ? "var(--text-primary)" : "var(--surface)",
                    color: filtros.origem === orig ? "#fff" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {ORIGEM_LABEL[orig]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
              Regra geradora
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => mudar("regra", "")}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                style={{
                  background: filtros.regra === "" ? "var(--text-primary)" : "var(--surface)",
                  color: filtros.regra === "" ? "#fff" : "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                Todas
              </button>
              {REGRAS.map((regra) => (
                <button
                  key={regra}
                  type="button"
                  onClick={() => mudar("regra", filtros.regra === regra ? "" : regra)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    background: filtros.regra === regra ? "var(--text-primary)" : "var(--surface)",
                    color: filtros.regra === regra ? "#fff" : "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {REGRA_LABEL[regra]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-zinc-400">
              Vendedor / responsável
            </label>
            <select
              value={filtros.vendedor}
              onChange={(e) => mudar("vendedor", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-100"
            >
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-zinc-700">
          <button
            onClick={() => {
              aoLimpar();
              aoFechar();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar
          </button>
          <button
            onClick={aoFechar}
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Aplicar filtros
          </button>
        </div>
      </aside>
    </div>
  );
}