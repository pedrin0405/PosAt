"use client";

import { PhoneCall, Mail, Building2, Target, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { VendedorItem, ImovelItem, OportunidadeItem } from "@/lib/segmentacao/tipos";
import { STATUS_LABEL, formataMoeda } from "@/components/oportunidade/oportunidade-ui";

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

interface VendedorDetailPanelProps {
  vendedor: VendedorItem;
  imoveis: ImovelItem[];
  oportunidades: OportunidadeItem[];
  aoFechar: () => void;
}

export function VendedorDetailPanel({
  vendedor: v,
  imoveis,
  oportunidades,
  aoFechar,
}: VendedorDetailPanelProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={aoFechar} />
      <aside className="absolute right-0 top-0 flex h-screen w-full max-w-lg flex-col border-l border-slate-800/60 bg-[#0D1320] shadow-2xl">
        <div className="border-b border-slate-800/80 px-5 py-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-base font-bold text-white shadow-lg shadow-blue-900/40">
                {iniciais(v.nome)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black tracking-wide text-white">{v.nome}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                      v.status === "ativo"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-slate-700/40 text-slate-400"
                    }`}
                  >
                    {v.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                  {v.creci && <span>CREci {v.creci}</span>}
                </div>
              </div>
            </div>
            <button onClick={aoFechar} aria-label="Fechar" className="rounded-xl border border-slate-800 p-2 text-slate-400 transition hover:border-slate-700 hover:bg-slate-900/40 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 space-y-6 overflow-y-auto px-5 py-5">
          <div className="space-y-1.5 text-sm text-slate-300">
            {v.telefone && (
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-slate-500" />
                {v.telefone}
              </div>
            )}
            {v.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                {v.email}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black tracking-wide text-white">
              <Building2 className="h-4 w-4 text-sky-400" />
              Imóveis anunciados ({imoveis.length})
            </h3>
            {imoveis.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum imóvel vinculado.</p>
            ) : (
              <ul className="space-y-2">
                {imoveis.map((i) => (
                  <li key={i.id} className="rounded-2xl border border-slate-800/60 bg-[#131C2E] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black tracking-wide text-white">
                        {i.codigo_imovel}
                        <span className="ml-2 font-normal text-slate-400">{i.empreendimento}</span>
                      </p>
                      <span className="shrink-0 rounded-full border border-slate-700/60 bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                        {i.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {i.tipologia} · {i.bairro}, {i.cidade} · {i.regiao}
                    </p>
                    {i.tipo_negocio === "venda" && i.valor_venda ? (
                      <p className="mt-1 text-xs font-extrabold text-emerald-400">
                        {formataMoeda(i.valor_venda)}
                      </p>
                    ) : i.tipo_negocio === "locacao" && i.valor_locacao ? (
                      <p className="mt-1 text-xs font-extrabold text-emerald-400">
                        {formataMoeda(i.valor_locacao)}/mês
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black tracking-wide text-white">
              <Target className="h-4 w-4 text-sky-400" />
              Oportunidades ({oportunidades.length})
            </h3>
            {oportunidades.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma oportunidade vinculada.</p>
            ) : (
              <ul className="space-y-2">
                {oportunidades.slice(0, 8).map((o) => (
                  <li key={o.id}>
                    <button
                      onClick={() => {
                        aoFechar();
                        router.push(`/oportunidades?oportunidade=${o.id}`);
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-800/60 bg-[#131C2E] p-3 transition hover:border-slate-700/80 text-left"
                    >
                      <span className="min-w-0 truncate text-sm font-semibold text-slate-200">
                        {o.descricao}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          {STATUS_LABEL[o.status] || o.status}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </span>
                    </button>
                  </li>
                ))}
                {oportunidades.length > 8 && (
                  <li className="text-xs text-slate-500">
                    +{oportunidades.length - 8} outra(s)…
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}