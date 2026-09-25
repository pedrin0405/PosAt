"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  DollarSign,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { ClienteCompleto, TermometroCX } from "@/lib/segmentacao/tipos";
import ClienteCard from "@/components/ClienteCard";
import ClienteFilters from "@/components/ClienteFilters";
import NovoClienteModal from "@/components/NovoClienteModal";

function inferirTermometroCX(cliente: ClienteCompleto): TermometroCX {
  if (cliente.termometro_cx) return cliente.termometro_cx;
  if (cliente.alerta_distrato_ativo || cliente.nivel_confianca === "revisao_necessaria") {
    return "insatisfeito_distrato";
  }
  if (
    cliente.e_investidor_confirmado ||
    cliente.finalidade_principal === "investimento" ||
    cliente.finalidade_principal === "potencial_indicacao"
  ) {
    return "promotor_mgm";
  }
  return "neutro_nutricao";
}

function ClientesContent() {
  const searchParams = useSearchParams();

  const [clientes, setClientes] = useState<ClienteCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);

  const [busca, setBusca] = useState("");
  const [finalidade, setFinalidade] = useState(searchParams.get("finalidade") || "");
  const [confianca, setConfianca] = useState(searchParams.get("confianca") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [completudeMaxima, setCompletudeMaxima] = useState(searchParams.get("completude_maxima") || "");
  const [origemFluxo, setOrigemFluxo] = useState<string>("");
  const [termometroCX, setTermometroCX] = useState<string>("");
  const [empreendimento, setEmpreendimento] = useState<string>("");
  const [corretor, setCorretor] = useState<string>("");
  const [analistaCS, setAnalistaCS] = useState<string>("");

  const [segmento, setSegmento] = useState<string>("ativos");

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (finalidade) params.set("finalidade", finalidade);
      if (confianca) params.set("confianca", confianca);
      if (status) params.set("status", status);
      if (completudeMaxima) params.set("completude_maxima", completudeMaxima);
      if (origemFluxo) params.set("origem_fluxo", origemFluxo);
      if (termometroCX) params.set("termometro_cx", termometroCX);
      if (empreendimento) params.set("empreendimento", empreendimento);
      if (corretor) params.set("corretor", corretor);
      if (analistaCS) params.set("analista_cs", analistaCS);

      const res = await fetch(`/api/clientes?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const rawClientes: ClienteCompleto[] = json.clientes || json.dados || [];
        const normalizados = rawClientes.map((c) => ({
          ...c,
          termometro_cx: inferirTermometroCX(c),
          origem_fluxo: c.origem_fluxo || (c.pessoa?.origem === "crm" || c.pessoa?.origem === "planilha" ? "re_trabalho" : "tempo_real"),
          empreendimento: c.empreendimento || (c.regiao_interesse ? `Condomínio ${c.regiao_interesse}` : "Lançamento Residencial"),
          corretor_original_nome: c.corretor_original_nome || "Equipe Comercial",
          analista_cs_nome: c.analista_cs_nome || "Mariana (CS)",
        }));
        setClientes(normalizados);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }, [busca, finalidade, confianca, status, completudeMaxima, origemFluxo, termometroCX, empreendimento, corretor, analistaCS]);

  useEffect(() => { carregarClientes(); }, [carregarClientes]);

  function handleLimparFiltros() {
    setBusca(""); setFinalidade(""); setConfianca(""); setStatus("");
    setCompletudeMaxima(""); setOrigemFluxo(""); setTermometroCX("");
    setEmpreendimento(""); setCorretor(""); setAnalistaCS("");
  }

  const totalRiscoDistrato = clientes.filter(
    (c) => c.termometro_cx === "insatisfeito_distrato" || c.alerta_distrato_ativo
  ).length;

  const totalPromotoresMGM = clientes.filter((c) => c.termometro_cx === "promotor_mgm").length;

  const totalEmRepasse = clientes.filter(
    (c) => c.status === "em_negociacao" || c.status === "convertido"
  ).length;

  const clientesExibidos = useMemo(() => {
    if (segmento === "risco") {
      return clientes.filter(
        (c) => c.termometro_cx === "insatisfeito_distrato" || c.alerta_distrato_ativo
      );
    }
    if (segmento === "repasse") {
      return clientes.filter((c) => c.status === "em_negociacao" || c.status === "convertido");
    }
    if (segmento === "promotores") {
      return clientes.filter((c) => c.termometro_cx === "promotor_mgm");
    }
    return clientes;
  }, [clientes, segmento]);

  const segmentos = [
    { id: "ativos", label: "Clientes ativos", count: clientes.length, icon: Users },
    { id: "risco", label: "Em risco", count: totalRiscoDistrato, icon: ShieldAlert, cor: "var(--danger)" },
    { id: "repasse", label: "Em repasse", count: totalEmRepasse, icon: DollarSign, cor: "var(--warning)" },
    { id: "promotores", label: "Promotores", count: totalPromotoresMGM, icon: Sparkles, cor: "var(--success)" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Clientes & Leads
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Base de pós-atendimento e nutrição de relacionamento
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={carregarClientes}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface)]"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setModalNovoAberto(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Cadastro</span>
          </button>
        </div>
      </div>

      {/* ── Segment tabs ── */}
      <div className="flex w-fit max-w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--inset)] p-1">
        {segmentos.map((s) => {
          const Icon = s.icon;
          const ativo = segmento === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSegmento(s.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                ativo
                  ? "bg-[var(--white)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: ativo ? s.cor : undefined }} />
              {s.label}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: ativo ? "var(--inset)" : "var(--surface)", color: "var(--text-muted)" }}
              >
                {s.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <ClienteFilters
        busca={busca}
        setBusca={setBusca}
        finalidade={finalidade}
        setFinalidade={setFinalidade}
        confianca={confianca}
        setConfianca={setConfianca}
        status={status}
        setStatus={setStatus}
        completudeMaxima={completudeMaxima}
        setCompletudeMaxima={setCompletudeMaxima}
        origemFluxo={origemFluxo}
        setOrigemFluxo={setOrigemFluxo}
        termometroCX={termometroCX}
        setTermometroCX={setTermometroCX}
        empreendimento={empreendimento}
        setEmpreendimento={setEmpreendimento}
        corretor={corretor}
        setCorretor={setCorretor}
        analistaCS={analistaCS}
        setAnalistaCS={setAnalistaCS}
        onFiltrar={carregarClientes}
        onLimpar={handleLimparFiltros}
      />

      {/* ── Grid ── */}
      {carregando ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] py-16 text-center text-sm text-[var(--text-muted)]">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--accent)]" />
          Carregando base de clientes…
        </div>
      ) : clientesExibidos.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {clientesExibidos.map((cliente) => (
            <ClienteCard key={cliente.id} cliente={cliente} onAtualizado={carregarClientes} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--white)] p-12 text-center">
          <SlidersHorizontal className="mx-auto mb-3 h-10 w-10 text-[var(--text-muted)]" />
          <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
            Nenhum cliente encontrado
          </h3>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Tente ajustar os filtros aplicados ou o segmento selecionado.
          </p>
          <button
            onClick={() => { setSegmento("ativos"); handleLimparFiltros(); }}
            className="rounded-xl bg-[var(--text-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      <NovoClienteModal
        aberto={modalNovoAberto}
        aoFechar={() => setModalNovoAberto(false)}
        aoSalvar={() => { setModalNovoAberto(false); carregarClientes(); }}
      />
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-[var(--text-muted)]">Carregando…</div>}>
      <ClientesContent />
    </Suspense>
  );
}