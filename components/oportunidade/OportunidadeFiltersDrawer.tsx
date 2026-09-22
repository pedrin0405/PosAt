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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={aoFechar}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-800/60 bg-[#0D1320] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-4 w-4 text-sky-400" />
            <h2 className="text-base font-black tracking-wide text-white">
              Filtros de oportunidades
            </h2>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar filtros"
            className="rounded-xl border border-slate-800 p-2 text-slate-400 transition hover:border-slate-700 hover:bg-slate-900/40 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Busca
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => mudar("busca", e.target.value)}
                placeholder="Cliente, imóvel, vendedor…"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Origem do registro
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => mudar("origem", "")}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  filtros.origem === ""
                    ? "border-sky-500/60 bg-blue-600 text-white"
                    : "border-slate-700/80 bg-slate-900/40 text-slate-300 hover:bg-slate-800"
                }`}
              >
                Todas
              </button>
              {ORIGENS.map((orig) => (
                <button
                  key={orig}
                  type="button"
                  onClick={() => mudar("origem", filtros.origem === orig ? "" : orig)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    filtros.origem === orig
                      ? "border-sky-500/60 bg-blue-600 text-white"
                      : "border-slate-700/80 bg-slate-900/40 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {ORIGEM_LABEL[orig]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Regra geradora
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => mudar("regra", "")}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  filtros.regra === ""
                    ? "border-sky-500/60 bg-blue-600 text-white"
                    : "border-slate-700/80 bg-slate-900/40 text-slate-300 hover:bg-slate-800"
                }`}
              >
                Todas
              </button>
              {REGRAS.map((regra) => (
                <button
                  key={regra}
                  type="button"
                  onClick={() => mudar("regra", filtros.regra === regra ? "" : regra)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    filtros.regra === regra
                      ? "border-sky-500/60 bg-blue-600 text-white"
                      : "border-slate-700/80 bg-slate-900/40 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {REGRA_LABEL[regra]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Vendedor / responsável
            </label>
            <select
              value={filtros.vendedor}
              onChange={(e) => mudar("vendedor", e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20"
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

        <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 px-6 py-4">
          <button
            onClick={() => {
              aoLimpar();
              aoFechar();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar
          </button>
          <button
            onClick={aoFechar}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            Aplicar filtros
          </button>
        </div>
      </aside>
    </div>
  );
}