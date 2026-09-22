"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
} from "lucide-react";
import { TarefaItem } from "@/lib/segmentacao/tipos";
import { finalidadeConfig } from "./ClienteCard";
import NovaTarefaModal from "./NovaTarefaModal";
import { executeGraphQL, QUERIES, MUTATIONS } from "@/lib/graphql-client";

const PRIORIDADE_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "Crítica", color: "#e05b3f" },
  2: { label: "Alta",    color: "#d97706" },
  3: { label: "Média",   color: "#6366f1" },
};

interface Coluna {
  id: string;
  titulo: string;
  statusList: string[];
  accent: string;
  badge: string;
}

const COLUNAS: Coluna[] = [
  {
    id: "pendente",
    titulo: "Pendentes",
    statusList: ["pendente"],
    accent: "#fbbf24",
    badge: "bg-amber-500/15 text-amber-300",
  },
  {
    id: "em_andamento",
    titulo: "Em Andamento",
    statusList: ["em_andamento", "reagendada"],
    accent: "#3b82f6",
    badge: "bg-blue-500/15 text-blue-300",
  },
  {
    id: "concluida",
    titulo: "Concluídas",
    statusList: ["concluida"],
    accent: "#34d399",
    badge: "bg-emerald-500/15 text-emerald-300",
  },
];

export default function PosAtendimentoBoard() {
  const [tarefas, setTarefas] = useState<TarefaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);

  // Drag & drop state
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [overColuna, setOverColuna] = useState<string | null>(null);
  const dragCounter = useRef<number>(0);

  async function carregarTarefas() {
    setCarregando(true);
    try {
      try {
        const data = await executeGraphQL<{ tarefas: any[] }>(QUERIES.GET_TAREFAS);
        if (data?.tarefas) {
          const normalizadas = data.tarefas.map((t) => ({
            ...t,
            cliente_id: t.clienteId || t.cliente_id,
            prazo_em: t.prazoEm || t.prazo_em,
            concluido_em: t.concluidoEm || t.concluido_em,
            criado_em: t.criadoEm || t.criado_em,
            cliente: t.cliente
              ? { ...t.cliente, finalidade_principal: t.cliente.finalidadePrincipal || t.cliente.finalidade_principal }
              : undefined,
          }));
          setTarefas(normalizadas as TarefaItem[]);
          return;
        }
      } catch { /* fallback */ }

      const res = await fetch("/api/tarefas");
      if (res.ok) {
        const json = await res.json();
        setTarefas(json.tarefas || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarTarefas(); }, []);

  async function atualizarStatus(tarefaId: string, novoStatus: string) {
    try {
      try {
        await executeGraphQL(MUTATIONS.ATUALIZAR_TAREFA, { input: { id: tarefaId, status: novoStatus } });
        carregarTarefas();
        return;
      } catch { /* fallback */ }

      const res = await fetch(`/api/tarefas/${tarefaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus }),
      });
      if (res.ok) carregarTarefas();
    } catch (e) {
      console.error(e);
    }
  }

  function handleDragStart(id: string) {
    setArrastandoId(id);
  }

  function handleDragEnd() {
    dragCounter.current = 0;
    setArrastandoId(null);
    setOverColuna(null);
  }

  function handleDragOverColuna(colunaId: string, e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverColuna(colunaId);
  }

  function handleDropColuna(coluna: Coluna, e: React.DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setOverColuna(null);
    if (!arrastandoId) return;

    const tarefa = tarefas.find((t) => t.id === arrastandoId);
    if (!tarefa) return;
    const alvo = coluna.statusList[0];
    if (tarefa.status === alvo) return;

    atualizarStatus(tarefa.id, alvo);
    setArrastandoId(null);
  }

  const tarefasFiltradas = filtroPrioridade
    ? tarefas.filter((t) => t.prioridade === Number(filtroPrioridade))
    : tarefas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-sky-400">
            Operacional
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Fila de Pós-Atendimento
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {tarefas.length} tarefa{tarefas.length !== 1 ? "s" : ""} no total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="h-11 rounded-xl border border-slate-700/80 bg-slate-900/40 px-3 text-sm font-semibold text-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
          >
            <option value="">Todas as prioridades</option>
            <option value="1">Crítica</option>
            <option value="2">Alta</option>
            <option value="3">Média</option>
          </select>
          <button
            onClick={carregarTarefas}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/40 px-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 text-sky-400" />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="rounded-3xl border border-slate-800/60 bg-[#161F33] py-16 text-center text-sm text-slate-400">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-sky-400" />
          Carregando tarefas…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {COLUNAS.map((col) => {
            const items = tarefasFiltradas.filter((t) => col.statusList.includes(t.status));
            const isOver = overColuna === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOverColuna(col.id, e)}
                onDragLeave={() => {
                  dragCounter.current -= 1;
                  if (dragCounter.current <= 0) {
                    dragCounter.current = 0;
                    setOverColuna(null);
                  }
                }}
                onDrop={(e) => handleDropColuna(col, e)}
                className={`flex flex-col gap-3 rounded-3xl border p-3 transition-colors ${
                  isOver
                    ? "border-sky-500/50 bg-slate-900/60 ring-2 ring-sky-500/20"
                    : "border-slate-800/60 bg-[#0D1320]"
                }`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 px-2 pb-2.5 pt-1">
                  <h2 className="text-sm font-black uppercase tracking-wide text-white">
                    {col.titulo}
                  </h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${col.badge}`}>
                    {items.length}
                  </span>
                </div>

                {/* Task cards */}
                <div className="flex min-h-[60px] flex-col gap-3">
                  {items.map((tarefa) => {
                    const prio = PRIORIDADE_LABEL[tarefa.prioridade] ?? { label: `P${tarefa.prioridade}`, color: "var(--text-muted)" };
                    const finalidadeItem = tarefa.cliente?.finalidade_principal
                      ? finalidadeConfig[tarefa.cliente.finalidade_principal]
                      : null;
                    const isVencida = tarefa.prazo_em && new Date(tarefa.prazo_em) < new Date() && tarefa.status !== "concluida";
                    const estaArrastando = arrastandoId === tarefa.id;

                    return (
                      <div
                        key={tarefa.id}
                        draggable
                        onDragStart={() => handleDragStart(tarefa.id)}
                        onDragEnd={handleDragEnd}
                        className={`relative flex cursor-grab flex-col gap-3 overflow-hidden rounded-3xl border bg-[#161F33] p-4 pl-5 shadow-sm transition active:cursor-grabbing ${
                          estaArrastando
                            ? "rotate-1 scale-[1.01] opacity-40 shadow-lg"
                            : "hover:shadow-lg hover:shadow-black/20 hover:border-slate-700/80"
                        } ${isVencida ? "border-rose-500/60" : "border-slate-800/60"}`}
                      >
                        {/* Status indicator stripe (column color) */}
                        <span
                          className="absolute bottom-0 left-0 top-0 w-1"
                          style={{ background: col.accent }}
                        />
                        {/* Priority dot + title */}
                        <div className="flex items-start gap-2">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                            style={{ background: prio.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-black tracking-wide leading-snug text-white">
                              {tarefa.titulo}
                            </h3>
                            {tarefa.descricao && (
                              <p className="mt-1 text-xs line-clamp-2 text-slate-400">
                                {tarefa.descricao}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-3">
                            {tarefa.prazo_em && (
                              <span
                                className="flex items-center gap-1"
                                style={{ color: isVencida ? "#f87171" : "" }}
                              >
                                <Clock className="h-3 w-3 text-slate-500" />
                                {new Date(tarefa.prazo_em).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                            {tarefa.cliente && (
                              <span className="max-w-[100px] truncate font-semibold text-slate-200">
                                {tarefa.cliente.pessoa?.nome || "Cliente"}
                              </span>
                            )}
                          </div>
                          {finalidadeItem && (
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${finalidadeItem.bg} ${finalidadeItem.text} ${finalidadeItem.border}`}>
                              {finalidadeItem.label}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5">
                          {tarefa.cliente?.id ? (
                            <Link
                              href={`/clientes/${tarefa.cliente.id}`}
                              className="flex items-center gap-1 text-xs font-bold text-white hover:text-sky-300"
                            >
                              Ver perfil <ArrowRight className="h-3 w-3" />
                            </Link>
                          ) : <span />}

                          <div className="flex items-center gap-1">
                            {tarefa.status !== "pendente" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "pendente")}
                                className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition hover:bg-amber-500/25"
                              >
                                Fila
                              </button>
                            )}
                            {tarefa.status !== "em_andamento" && tarefa.status !== "concluida" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "em_andamento")}
                                className="rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-blue-500"
                              >
                                Iniciar
                              </button>
                            )}
                            {tarefa.status !== "concluida" && (
                              <button
                                onClick={() => atualizarStatus(tarefa.id, "concluida")}
                                className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-500/25"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                OK
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div
                      className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition-colors ${
                        isOver
                          ? "border-sky-500/50 bg-slate-900/60 text-slate-300"
                          : "border-slate-700 text-slate-500"
                      }`}
                    >
                      {isOver ? "Solte aqui" : "Nenhuma tarefa aqui."}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NovaTarefaModal
        aberto={modalAberto}
        clienteId=""
        nomeCliente=""
        aoFechar={() => setModalAberto(false)}
        aoSalvar={() => { setModalAberto(false); carregarTarefas(); }}
      />
    </div>
  );
}
