"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { RefreshCw, Plus, SlidersHorizontal, X, Store } from "lucide-react";
import { executeGraphQL, QUERIES } from "@/lib/graphql-client";
import { OportunidadeItem } from "@/lib/segmentacao/tipos";
import NovaOportunidadeModal from "@/components/NovaOportunidadeModal";
import OportunidadeCard from "@/components/oportunidade/OportunidadeCard";
import OportunidadeDetailPanel from "@/components/oportunidade/OportunidadeDetailPanel";
import OportunidadeFiltersDrawer, {
  FiltrosOportunidade,
} from "@/components/oportunidade/OportunidadeFiltersDrawer";
import OportunidadeRemoverModal from "@/components/oportunidade/OportunidadeRemoverModal";
import OportunidadeConverterModal, {
  DadosConversaoLead,
} from "@/components/oportunidade/OportunidadeConverterModal";
import {
  GRUPO,
  GrupoOportunidade,
  STATUS_LABEL,
  grupoDeOportunidade,
  formataMoeda,
} from "@/components/oportunidade/oportunidade-ui";

const FILTROS_VAZIOS: FiltrosOportunidade = { busca: "", origem: "", regra: "", vendedor: "" };

export default function OportunidadesPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-400 dark:text-zinc-500">Carregando…</div>}>
      <OportunidadesContent />
    </Suspense>
  );
}

function OportunidadesContent() {
  const searchParams = useSearchParams();
  const opIdInicial = useRef(searchParams.get("oportunidade"));
  const [oportunidades, setOportunidades] = useState<OportunidadeItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNova, setModalNova] = useState(false);
  const [grupo, setGrupo] = useState<GrupoOportunidade>("ativas");
  const [filtrosAberto, setFiltrosAberto] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosOportunidade>(FILTROS_VAZIOS);
  const [detalhe, setDetalhe] = useState<OportunidadeItem | null>(null);
  const [removerModal, setRemoverModal] = useState<OportunidadeItem | null>(null);
  const [converterModal, setConverterModal] = useState<OportunidadeItem | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; ok: boolean } | null>(null);
  const [vendedores, setVendedores] = useState<{ id: string; nome: string }[]>([]);

  function mostrarAviso(texto: string, ok = true) {
    setAviso({ texto, ok });
    setTimeout(() => setAviso(null), 4500);
  }

  function obterDados() {
    return (async () => {
      try {
        let lista: OportunidadeItem[] | null = null;
        try {
          const data = await executeGraphQL<{ oportunidades: OportunidadeItem[] }>(QUERIES.GET_OPORTUNIDADES);
          if (data?.oportunidades) lista = data.oportunidades;
        } catch { /* fallback REST */ }

        if (!lista) {
          const res = await fetch("/api/oportunidades");
          if (res.ok) {
            const json = await res.json();
            lista = json.oportunidades || [];
          }
        }

        const resV = await fetch("/api/vendedores");
        const jsonV = resV.ok ? await resV.json() : { vendedores: [] };

        return { oportunidades: lista || [], vendedores: jsonV.vendedores || [] };
      } catch (e) {
        console.error(e);
        return { oportunidades: [], vendedores: [] };
      }
    })();
  }

  function carregar() {
    setCarregando(true);
    obterDados()
      .then((dados) => {
        setOportunidades(dados.oportunidades);
        setVendedores(dados.vendedores);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    let ativo = true;
    obterDados().then((dados) => {
      if (ativo) {
        setOportunidades(dados.oportunidades);
        setVendedores(dados.vendedores);
        setCarregando(false);
        const opId = opIdInicial.current;
        if (opId) {
          const alvo = dados.oportunidades.find((o) => o.id === opId);
          if (alvo) {
            setGrupo(grupoDeOportunidade(alvo.status));
            setDetalhe(alvo);
          }
        }
      }
    });
    return () => { ativo = false; };
  }, []);

  function recarregar() { carregar(); }

  /* ---------- Mutations ---------- */

  async function avancarStatus(op: OportunidadeItem) {
    const proximo = ((): string | null => {
      if (op.status === "identificada") return "em_andamento";
      if (op.status === "em_andamento") return "aguardando_decisao";
      if (op.status === "em_avaliacao") return "proposta_enviada";
      if (op.status === "proposta_enviada") return "negociacao";
      return null;
    })();
    if (!proximo) return;
    setOportunidades((prev) => prev.map((o) => (o.id === op.id ? { ...o, status: proximo as OportunidadeItem["status"] } : o)));
    try {
      await fetch(`/api/oportunidades/${op.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: proximo }),
      });
      mostrarAviso(`Status alterado para ${STATUS_LABEL[proximo]}`);
    } catch { mostrarAviso("Falha ao atualizar status", false); }
  }

  async function reabrir(op: OportunidadeItem) {
    setOportunidades((prev) => prev.map((o) => (o.id === op.id ? { ...o, status: "identificada" as OportunidadeItem["status"] } : o)));
    try {
      await fetch(`/api/oportunidades/${op.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "identificada" }),
      });
      mostrarAviso("Oportunidade reaberta");
    } catch { mostrarAviso("Falha ao reabrir", false); }
  }

  async function removerOp(op: OportunidadeItem, motivo: string) {
    setOportunidades((prev) => prev.map((o) => (o.id === op.id ? { ...o, status: "removida" as OportunidadeItem["status"], removida_motivo: motivo, removida_em: new Date().toISOString(), tags: [...(o.tags || []), "Removido"] } : o)));
    setRemoverModal(null);
    try {
      await fetch(`/api/oportunidades/${op.id}/remover`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      mostrarAviso("Oportunidade removida (perdeu interesse)");
    } catch { mostrarAviso("Falha ao remover", false); }
  }

  async function converterOp(op: OportunidadeItem, dados: DadosConversaoLead) {
    setConverterModal(null);
    try {
      const res = await fetch(`/api/oportunidades/${op.id}/converter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.erro || "Falha ao converter");
      }
      const json = await res.json();
      const leadId = json.lead?.id || null;
      setOportunidades((prev) => prev.map((o) => (o.id === op.id ? {
        ...o,
        status: "convertida" as OportunidadeItem["status"],
        convertida_em: new Date().toISOString(),
        lead_criado_id: json.duplicado ? null : leadId,
        lead_duplicado_id: json.duplicado ? leadId : null,
        tarefa_primeiro_contato_id: json.tarefa?.id || null,
        tags: [...(o.tags || []), "Convertido"],
      } : o)));
      mostrarAviso(
        json.duplicado
          ? "Cadastro deduplicado — tarefa de primeiro contato criada"
          : "Lead criado com tarefa de primeiro contato"
      );
    } catch (e: unknown) {
      mostrarAviso(e instanceof Error ? e.message : "Falha ao converter", false);
    }
  }

  /* ---------- Filtering ---------- */

  function correspondeFiltros(o: OportunidadeItem) {
    const busca = filtros.busca.toLowerCase();
    if (busca) {
      const alvo = `${o.descricao} ${o.cliente?.nome || ""} ${o.vendedor?.nome || ""} ${o.imovel?.codigo_imovel || ""} ${o.imovel?.empreendimento || ""}`.toLowerCase();
      if (!alvo.includes(busca)) return false;
    }
    if (filtros.origem && o.origem !== filtros.origem) return false;
    if (filtros.regra && o.regra_geradora !== filtros.regra) return false;
    if (filtros.vendedor && o.vendedor_id !== filtros.vendedor) return false;
    return true;
  }

  const filtradas = oportunidades.filter((o) => grupoDeOportunidade(o.status) === grupo && correspondeFiltros(o));
  const contagem = Object.fromEntries(GRUPO.map((g) => [g.id, oportunidades.filter((o) => grupoDeOportunidade(o.status) === g.id).length])) as Record<GrupoOportunidade, number>;
  const totalValorAtivas = oportunidades.filter((o) => grupoDeOportunidade(o.status) === "ativas").reduce((s, o) => s + (o.valor_estimado || 0), 0);

  const filtresAtivos = filtros.busca || filtros.origem || filtros.regra || filtros.vendedor;

  return (
    <div className="space-y-6">
      {aviso && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition dark:border-zinc-600"
          style={{
            background: aviso.ok ? "var(--surface, #fff)" : "var(--surface, #fff)",
            color: aviso.ok ? "var(--text-primary)" : "var(--text-primary)",
            borderColor: aviso.ok ? "var(--accent, #10b981)" : "var(--error, #ef4444)",
          }}
        >
          <span>{aviso.texto}</span>
          <button onClick={() => setAviso(null)} className="ml-1 rounded p-1 text-slate-400 hover:bg-slate-100 dark:text-zinc-500 dark:hover:bg-zinc-800">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">Crescimento</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">Oportunidades</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {contagem.ativas} em andamento · {formataMoeda(totalValorAtivas)} em jogo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/vendedores"
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Vendedores</span>
          </Link>
          <button onClick={recarregar} className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button onClick={() => setModalNova(true)} className="flex h-11 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Plus className="h-4 w-4" />
            Nova Oportunidade
          </button>
        </div>
      </div>

      {/* Tabs + filtro */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 rounded-2xl bg-slate-100 p-1 dark:bg-zinc-800">
          {GRUPO.map((g) => (
            <button
              key={g.id}
              onClick={() => setGrupo(g.id)}
              className={`flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                grupo === g.id
                  ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {g.label}
              <span className="ml-1 text-[11px] opacity-60">{contagem[g.id]}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setFiltrosAberto(true)}
          className={`flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 ${
            filtresAtivos
              ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-white dark:text-white"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {filtresAtivos && (
            <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white dark:bg-zinc-600">
              {[filtros.busca, filtros.origem, filtros.regra, filtros.vendedor].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Cards */}
      {carregando ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center text-sm text-slate-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" />
          Carregando oportunidades…
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400 dark:border-zinc-600 dark:text-zinc-500">
          {filtresAtivos ? "Nenhuma oportunidade encontrada com esses filtros." : "Nenhuma oportunidade nesta aba."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((op) => (
            <OportunidadeCard
              key={op.id}
              oportunidade={op}
              aoAbrir={() => setDetalhe(op)}
              aoAvancar={() => avancarStatus(op)}
              aoConverter={() => setConverterModal(op)}
              aoRemover={() => setRemoverModal(op)}
              aoReabrir={() => reabrir(op)}
            />
          ))}
        </div>
      )}

      {/* Modais / Panels */}
      <NovaOportunidadeModal
        aberto={modalNova}
        aoFechar={() => setModalNova(false)}
        aoSalvar={() => { setModalNova(false); recarregar(); mostrarAviso("Oportunidade criada"); }}
      />

      <OportunidadeFiltersDrawer
        aberto={filtrosAberto}
        aoFechar={() => setFiltrosAberto(false)}
        filtros={filtros}
        setFiltros={setFiltros}
        vendedores={vendedores}
        aoLimpar={() => setFiltros(FILTROS_VAZIOS)}
      />

      {detalhe && (
        <OportunidadeDetailPanel
          key={detalhe.id}
          oportunidade={detalhe}
          aoFechar={() => setDetalhe(null)}
          aoAvancar={() => { avancarStatus(detalhe); setDetalhe(null); }}
          aoConverter={() => { setConverterModal(detalhe); setDetalhe(null); }}
          aoRemover={() => { setRemoverModal(detalhe); setDetalhe(null); }}
          aoReabrir={() => { reabrir(detalhe); setDetalhe(null); }}
        />
      )}

      {removerModal && (
        <OportunidadeRemoverModal
          key={removerModal.id}
          oportunidade={removerModal}
          aoFechar={() => setRemoverModal(null)}
          aoConfirmar={(motivo) => removerOp(removerModal, motivo)}
        />
      )}

      {converterModal && (
        <OportunidadeConverterModal
          key={converterModal.id}
          oportunidade={converterModal}
          aoFechar={() => setConverterModal(null)}
          aoConfirmar={(dados) => converterOp(converterModal, dados)}
        />
      )}
    </div>
  );
}