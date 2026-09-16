"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Plus, Store, UserRound, PhoneCall, Mail, Building2, Target, X, ChevronRight } from "lucide-react";
import { VendedorItem, ImovelItem, OportunidadeItem } from "@/lib/segmentacao/tipos";
import NovoVendedorModal from "@/components/vendedor/NovoVendedorModal";
import { STATUS_LABEL, formataMoeda } from "@/components/oportunidade/oportunidade-ui";

function iniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<VendedorItem[]>([]);
  const [imoveis, setImoveis] = useState<ImovelItem[]>([]);
  const [oportunidades, setOportunidades] = useState<OportunidadeItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNovo, setModalNovo] = useState(false);
  const [detalhe, setDetalhe] = useState<VendedorItem | null>(null);

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
      <div className="space-y-8">
        <HeaderSection ativos={ativos} total={vendedores.length} />
        <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center text-sm text-slate-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" />
          Carregando vendedores…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <HeaderSection ativos={ativos} total={vendedores.length} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
            Anunciantes e corretores
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Vendedores
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {ativos} ativos · {vendedores.length} cadastrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => carregar()}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setModalNovo(true)}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Novo Vendedor
          </button>
        </div>
      </div>

      {vendedores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-400 dark:border-zinc-600 dark:text-zinc-500">
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
                onClick={() => setDetalhe(v)}
                className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
                      {iniciais(v.nome)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {v.nome}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {v.creci ? `CREci ${v.creci}` : "Sem CREci"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      v.status === "ativo"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {v.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-500 dark:text-zinc-400">
                  {v.telefone && (
                    <div className="flex items-center gap-1.5">
                      <PhoneCall className="h-3 w-3" />
                      {v.telefone}
                    </div>
                  )}
                  {v.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      {v.email}
                    </div>
                  )}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-zinc-700">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-zinc-700/50">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-zinc-300">
                      <strong className="block text-sm text-slate-900 dark:text-zinc-100">{totals.imoveis}</strong>
                      imóveis
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-zinc-700/50">
                    <Target className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-zinc-300">
                      <strong className="block text-sm text-slate-900 dark:text-zinc-100">{totals.oportunidades}</strong>
                      oportunidades
                    </span>
                  </div>
                </div>

                {valorOportunidades > 0 && (
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
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

      {detalhe && (
        <VendedorDetailPanel
          vendedor={detalhe}
          imoveis={imoveisDoVendedor(detalhe)}
          oportunidades={oportunidadesDoVendedor(detalhe)}
          aoFechar={() => setDetalhe(null)}
        />
      )}
    </div>
  );
}

function HeaderSection({ ativos, total }: { ativos: number; total: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">{ativos}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Vendedores ativos</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-zinc-100">{total}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Cadastrados</p>
        </div>
      </div>
    </div>
  );
}

function VendedorDetailPanel({
  vendedor: v,
  imoveis,
  oportunidades,
  aoFechar,
}: {
  vendedor: VendedorItem;
  imoveis: ImovelItem[];
  oportunidades: OportunidadeItem[];
  aoFechar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={aoFechar} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-zinc-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-700">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white dark:bg-white dark:text-zinc-900">
                {iniciais(v.nome)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-zinc-100">{v.nome}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      v.status === "ativo"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {v.status === "ativo" ? "Ativo" : "Inativo"}
                  </span>
                  {v.creci && <span>CREci {v.creci}</span>}
                </div>
              </div>
            </div>
            <button onClick={aoFechar} aria-label="Fechar" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div className="space-y-1 text-sm text-slate-600 dark:text-zinc-300">
            {v.telefone && (
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4" />
                {v.telefone}
              </div>
            )}
            {v.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {v.email}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
              <Building2 className="h-4 w-4 text-slate-500" />
              Imóveis anunciados ({imoveis.length})
            </h3>
            {imoveis.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500">Nenhum imóvel vinculado.</p>
            ) : (
              <ul className="space-y-2">
                {imoveis.map((i) => (
                  <li key={i.id} className="rounded-2xl border border-slate-100 p-3 dark:border-zinc-700">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                        {i.codigo_imovel}
                        <span className="ml-2 font-normal text-slate-500 dark:text-zinc-400">{i.empreendimento}</span>
                      </p>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                        {i.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                      {i.tipologia} · {i.bairro}, {i.cidade} · {i.regiao}
                    </p>
                    {i.tipo_negocio === "venda" && i.valor_venda ? (
                      <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {formataMoeda(i.valor_venda)}
                      </p>
                    ) : i.tipo_negocio === "locacao" && i.valor_locacao ? (
                      <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {formataMoeda(i.valor_locacao)}/mês
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
              <Target className="h-4 w-4 text-slate-500" />
              Oportunidades ({oportunidades.length})
            </h3>
            {oportunidades.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500">Nenhuma oportunidade vinculada.</p>
            ) : (
              <ul className="space-y-2">
                {oportunidades.slice(0, 8).map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/oportunidades?oportunidade=${o.id}`}
                      onClick={aoFechar}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-slate-100 p-3 transition hover:border-slate-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-slate-700 dark:text-zinc-200">
                        {o.descricao}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                          {STATUS_LABEL[o.status] || o.status}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </span>
                    </Link>
                  </li>
                ))}
                {oportunidades.length > 8 && (
                  <li className="text-xs text-slate-400 dark:text-zinc-500">
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