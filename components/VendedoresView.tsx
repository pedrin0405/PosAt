"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus, Store, UserRound, PhoneCall, Mail, Building2, Target } from "lucide-react";
import { VendedorItem, ImovelItem, OportunidadeItem } from "@/lib/segmentacao/tipos";
import NovoVendedorModal from "@/components/vendedor/NovoVendedorModal";
import { formataMoeda } from "@/components/oportunidade/oportunidade-ui";

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export function VendedoresView({ onOpenDetail }: { onOpenDetail: (detalhe: { vendedor: VendedorItem; imoveis: ImovelItem[]; oportunidades: OportunidadeItem[] }) => void }) {
  const [vendedores, setVendedores] = useState<VendedorItem[]>([]);
  const [imoveis, setImoveis] = useState<ImovelItem[]>([]);
  const [oportunidades, setOportunidades] = useState<OportunidadeItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNovo, setModalNovo] = useState(false);

  function carregar() {
    let ativo = true;

    (async () => {
      try {
        const [resV, resI, resO] = await Promise.all([
          fetch("/api/vendedores"),
          fetch("/api/imoveis"),
          fetch("/api/oportunidades"),
        ]);
        const [jsonV, jsonI, jsonO] = await Promise.all([
          resV.ok ? resV.json() : { vendedores: [] },
          resI.ok ? resI.json() : { imoveis: [] },
          resO.ok ? resO.json() : { oportunidades: [] },
        ]);
        if (ativo) {
          setVendedores(jsonV.vendedores || []);
          setImoveis(jsonI.imoveis || []);
          setOportunidades(jsonO.oportunidades || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    return () => { ativo = false; };
  }

  useEffect(() => {
    const cleanup = carregar();
    return cleanup;
  }, []);

  const ativos = vendedores.filter((v) => v.status === "ativo").length;

  const imoveisDoVendedor = (v: VendedorItem) => imoveis.filter((i) => i.vendedor_id === v.id);
  const oportunidadesDoVendedor = (v: VendedorItem) =>
    oportunidades.filter((o) => o.vendedor_id === v.id);

  if (carregando) {
    return (
      <div className="space-y-8 h-full">
        <HeaderSection ativos={ativos} total={vendedores.length} />
        <div className="rounded-3xl border border-slate-800/60 bg-[#161F33] py-16 text-center text-sm text-slate-400">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-sky-400" />
          Carregando vendedores…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full">
      <HeaderSection ativos={ativos} total={vendedores.length} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-sky-400">
            Anunciantes e corretores
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Vendedores
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {ativos} ativos · {vendedores.length} cadastrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => carregar()}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/40 px-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 text-sky-400" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setModalNovo(true)}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Novo Vendedor
          </button>
        </div>
      </div>

      {vendedores.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700/80 py-12 text-center text-sm text-slate-500">
          Nenhum vendedor cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendedores.map((v) => {
            const totals = {
              imoveis: imoveisDoVendedor(v).length,
              oportunidades: oportunidadesDoVendedor(v).length,
            };
            const valorOportunidades = oportunidadesDoVendedor(v)
              .filter((o) => o.status !== "removida" && o.status !== "convertida" && o.status !== "encerrada")
              .reduce((s, o) => s + (o.valor_estimado || 0), 0);
            return (
              <div
                key={v.id}
                onClick={() => onOpenDetail({
                  vendedor: v,
                  imoveis: imoveisDoVendedor(v),
                  oportunidades: oportunidadesDoVendedor(v)
                })}
                className="flex cursor-pointer flex-col gap-4 rounded-3xl border border-slate-800/60 bg-[#161F33] p-5 shadow-sm transition-all hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-900/40">
                      {iniciais(v.nome)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black tracking-wide text-white">
                        {v.nome}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {v.creci ? `CREci ${v.creci}` : "Sem CREci"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                      v.status === "ativo"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-slate-700/40 text-slate-400"
                    }`}
                  >
                    {v.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-slate-400">
                  {v.telefone && (
                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-3.5 w-3.5 text-slate-500" />
                      {v.telefone}
                    </div>
                  )}
                  {v.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      {v.email}
                    </div>
                  )}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800/60 bg-[#0D1320] px-3 py-2.5">
                    <Building2 className="h-4 w-4 text-sky-400" />
                    <span className="text-xs text-slate-400">
                      <strong className="block text-sm font-extrabold text-white">{totals.imoveis}</strong>
                      imóveis
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-800/60 bg-[#0D1320] px-3 py-2.5">
                    <Target className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-slate-400">
                      <strong className="block text-sm font-extrabold text-white">{totals.oportunidades}</strong>
                      oportunidades
                    </span>
                  </div>
                </div>

                {valorOportunidades > 0 && (
                  <p className="text-xs font-extrabold text-emerald-400">
                    {formataMoeda(valorOportunidades)} em jogo
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NovoVendedorModal
        aberto={modalNovo}
        aoFechar={() => setModalNovo(false)}
        aoSalvar={() => {
          setModalNovo(false);
          carregar();
        }}
      />
    </div>
  );
}

function HeaderSection({ ativos, total }: { ativos: number; total: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-3xl border border-slate-800/60 bg-[#161F33] p-4 transition hover:border-slate-700/80">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xl font-extrabold text-white">{ativos}</p>
          <p className="text-xs text-slate-400">Vendedores ativos</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-3xl border border-slate-800/60 bg-[#161F33] p-4 transition hover:border-slate-700/80">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xl font-extrabold text-white">{total}</p>
          <p className="text-xs text-slate-400">Cadastrados</p>
        </div>
      </div>
    </div>
  );
}