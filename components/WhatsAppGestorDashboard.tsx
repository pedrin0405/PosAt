"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Clock,
  Star,
  ShieldAlert,
  Users,
  MessageSquare,
  Building2,
  Zap,
  FileDown,
  CheckCircle2,
  ArrowRight,
  Eye,
} from "lucide-react";
import { formatarHorario, formatarDia } from "@/lib/whatsapp";

interface SemRespostaUI {
  conversaId: string;
  nomeCliente: string | null;
  numero: string;
  corretor: string | null;
  etapa: string | null;
  vencidoAposHoras: number;
}

interface EscalonadaUI {
  conversaId: string;
  nomeCliente: string | null;
  corretor: string | null;
  numero: string;
  ultimaMensagem: string;
  motivo: string;
}

interface CorretorUI {
  corretor: string;
  conversas: number;
  mensagens: number;
  recebidas: number;
  enviadas: number;
  semResposta: number;
  tempoMedioRespostaMin: number | null;
  npsPendentes: number;
}

interface DuplicidadeUI {
  numero: string;
  mesmosCorretores: boolean;
  conversas: {
    id: string;
    corretor: string | null;
    nomeCliente: string | null;
    clienteId: string | null;
    ultimaMensagemEm: string;
  }[];
}

interface RelatorioUI {
  geradoEm: string;
  totalConversas: number;
  totalMensagens: number;
  espelhadas: number;
  semMatch: number;
  semResposta: SemRespostaUI[];
  escalonadas: EscalonadaUI[];
  porCorretor: CorretorUI[];
  porEtapa: { etapa: string; conversas: number }[];
  porEmpreendimento: { empreendimento: string | null; conversas: number }[];
  horariosPico: { hora: string; total: number }[];
  sentimento: { satisfeito: number; neutro: number; irritado: number };
  duplicidades: DuplicidadeUI[];
  nps: { media: number | null; total: number; respondidas: number; pendentes: number };
}

interface GatilhoUI {
  id: string;
  nome: string;
  etapa: string;
  prazoDias: number;
  tituloTarefa: string;
  disparaNps: boolean;
  ativo: boolean;
}

interface NpsUI {
  id: string;
  conversa_id: string;
  cliente_nome: string | null;
  etapa: string;
  status: "pendente" | "respondida";
  nota: number | null;
  comentario: string | null;
  enviada_em: string;
}

interface AcessoUI {
  id: string;
  conversa_id: string;
  cliente: string;
  usuario: string;
  acao: string;
  em: string;
}

const SENTIMENTO_COR: Record<string, string> = {
  satisfeito: "bg-emerald-500",
  neutro: "bg-amber-400",
  irritado: "bg-rose-500",
};

const SENTIMENTO_LABEL: Record<string, string> = {
  satisfeito: "Satisfeito",
  neutro: "Neutro",
  irritado: "Irritado",
};

function LinhaNps({
  nps,
  aoResponder,
}: {
  nps: NpsUI;
  aoResponder: (id: string, nota: number, comentario: string) => void;
}) {
  const [nota, setNota] = useState<number>(9);
  const [comentario, setComentario] = useState("");
  return (
    <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-zinc-700/40">
      <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
        {nps.cliente_nome || "Sem nome"} · {nps.etapa}
      </p>
      {nps.status === "respondida" ? (
        <p className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
          <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
          Nota {nps.nota}/10
          {nps.comentario ? ` — “${nps.comentario}”` : ""}
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            max={10}
            value={nota}
            onChange={(e) => setNota(Number(e.target.value))}
            className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentário opcional"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={() => aoResponder(nps.id, nota, comentario)}
            className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-zinc-900"
          >
            Responder
          </button>
        </div>
      )}
    </div>
  );
}

export default function WhatsAppGestorDashboard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [relatorio, setRelatorio] = useState<RelatorioUI | null>(null);
  const [gatilhos, setGatilhos] = useState<GatilhoUI[]>([]);
  const [nps, setNps] = useState<NpsUI[]>([]);
  const [acessos, setAcessos] = useState<AcessoUI[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aplicando, setAplicando] = useState(false);
  const [avisoFollowUp, setAvisoFollowUp] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([
      fetch("/api/whatsapp/gestor").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/whatsapp/gatilhos").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/whatsapp/nps").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/whatsapp/acessos").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([g, gt, n, a]) => {
        if (!ativo) return;
        if (g?.relatorio) setRelatorio(g.relatorio);
        if (gt?.gatilhos) setGatilhos(gt.gatilhos);
        if (n?.nps) setNps(n.nps);
        if (a?.acessos) setAcessos(a.acessos);
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function refresh() {
    setCarregando(true);
    try {
      const [g, gt, n, a] = await Promise.all([
        fetch("/api/whatsapp/gestor").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/whatsapp/gatilhos").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/whatsapp/nps").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/whatsapp/acessos").then((r) => (r.ok ? r.json() : null)),
      ]);
      if (g?.relatorio) setRelatorio(g.relatorio);
      if (gt?.gatilhos) setGatilhos(gt.gatilhos);
      if (n?.nps) setNps(n.nps);
      if (a?.acessos) setAcessos(a.acessos);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  async function aplicarFollowUps() {
    setAplicando(true);
    setAvisoFollowUp(null);
    try {
      const res = await fetch("/api/whatsapp/followups/aplicar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      setAvisoFollowUp(
        json.ok
          ? `${json.tarefasCriadas.length} tarefa(s) de follow-up agendadas automaticamente · ${json.npsDisparadas} pesquisa(s) NPS disparada(s).`
          : `Erro: ${json.erro || "desconhecido"}`
      );
      await refresh();
    } catch (e) {
      console.error(e);
      setAvisoFollowUp("Falha de rede ao aplicar follow-ups.");
    } finally {
      setAplicando(false);
    }
  }

  async function responderNps(id: string, nota: number, comentario: string) {
    try {
      const res = await fetch(`/api/whatsapp/nps/${id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota, comentario: comentario || undefined }),
      });
      if (res.ok) {
        await refresh();
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (carregando && !relatorio) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-sm text-slate-400 dark:text-zinc-500">
        <RefreshCw className="h-5 w-5 animate-spin" />
        Gerando relatório do gestor…
      </div>
    );
  }

  const sentimentoTotal = relatorio
    ? relatorio.sentimento.satisfeito + relatorio.sentimento.neutro + relatorio.sentimento.irritado
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {!compact && (
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
              <BarChart3 className="h-3.5 w-3.5" />
              Gestão WhatsApp → CRM
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
              Painel do gestor
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Volume por corretor, tempo de resposta, alertas de cliente órfão, escalonamento, duplicidade e NPS.
            </p>
          </div>
        )}
        <button
          onClick={refresh}
          className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* KPIs */}
      {relatorio && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
              Conversas
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-zinc-50">
              {relatorio.totalConversas}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Espelhadas
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {relatorio.espelhadas}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              Sem resposta
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-300">
              {relatorio.semResposta.length}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Escalonadas
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
              {relatorio.escalonadas.length}
            </p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-500/30 dark:bg-violet-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
              NPS médio
            </p>
            <p className="mt-1 text-2xl font-bold text-violet-700 dark:text-violet-300">
              {relatorio.nps.media === null ? "—" : `${relatorio.nps.media}/10`}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Duplicidades
            </p>
            <p className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-300">
              {relatorio.duplicidades.length}
            </p>
          </div>
        </section>
      )}

      {/* Sentimento + horários */}
      {relatorio && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
              <CheckCircle2 className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              Sentimento das conversas
            </h2>
            <div className="space-y-3">
              {(["satisfeito", "neutro", "irritado"] as const).map((k) => {
                const total = relatorio.sentimento[k];
                const pct = sentimentoTotal > 0 ? Math.round((total / sentimentoTotal) * 100) : 0;
                return (
                  <div key={k}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-zinc-300">
                        {SENTIMENTO_LABEL[k]}
                      </span>
                      <span className="text-slate-400 dark:text-zinc-500">
                        {total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
                      <div
                        className={`h-full rounded-full ${SENTIMENTO_COR[k]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
              <Clock className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              Horários de pico
            </h2>
            <div className="space-y-1.5">
              {relatorio.horariosPico.slice(0, 8).map((h) => {
                const max = relatorio.horariosPico[0]?.total || 1;
                const pct = Math.round((h.total / max) * 100);
                return (
                  <div key={h.hora} className="flex items-center gap-2 text-xs">
                    <span className="w-10 font-medium text-slate-500 dark:text-zinc-400">{h.hora}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-slate-900 dark:bg-zinc-300"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-slate-400 dark:text-zinc-500">{h.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Ranking + view por etapa/empreendimento */}
      {relatorio && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-zinc-700">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                <Users className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                Ranking da equipe
              </h2>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                maior volume de interações primeiro
              </span>
            </div>
            {relatorio.porCorretor.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
                Nenhuma conversa espelhada ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400 dark:border-zinc-700 dark:text-zinc-500">
                      <th className="px-5 py-2.5 font-semibold">Corretor</th>
                      <th className="px-3 py-2.5 font-semibold">Conversas</th>
                      <th className="px-3 py-2.5 font-semibold">Msg (rec/env)</th>
                      <th className="px-3 py-2.5 font-semibold">Tempo resp.</th>
                      <th className="px-3 py-2.5 font-semibold">Sem resp.</th>
                      <th className="px-5 py-2.5 font-semibold">NPS pend.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.porCorretor.map((c, i) => (
                      <tr
                        key={c.corretor}
                        className={`border-b border-slate-50 last:border-0 dark:border-zinc-800 ${
                          i === 0 ? "bg-emerald-50/40 dark:bg-emerald-500/5" : ""
                        }`}
                      >
                        <td className="px-5 py-3">
                          <span className="font-semibold text-slate-800 dark:text-zinc-100">
                            {c.corretor}
                          </span>
                          {i === 0 && (
                            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                              #1
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-zinc-300">{c.conversas}</td>
                        <td className="px-3 py-3 text-slate-600 dark:text-zinc-300">
                          {c.mensagens}{" "}
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                            ({c.recebidas}⬅ / {c.enviadas}➡)
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-zinc-300">
                          {c.tempoMedioRespostaMin === null ? "—" : `${c.tempoMedioRespostaMin} min`}
                        </td>
                        <td className="px-3 py-3">
                          {c.semResposta > 0 ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                              {c.semResposta}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-500">0</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-zinc-300">{c.npsPendentes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                <Zap className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                Por etapa
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatorio.porEtapa.map((e) => (
                  <span
                    key={e.etapa}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-700 dark:text-zinc-200"
                  >
                    {e.etapa} · {e.conversas}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                <Building2 className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                Por empreendimento
              </h2>
              <div className="space-y-1.5 text-sm text-slate-600 dark:text-zinc-300">
                {relatorio.porEmpreendimento.map((e) => (
                  <div key={e.empreendimento || "sem-empreendimento"} className="flex justify-between">
                    <span>{e.empreendimento || "Sem empreendimento"}</span>
                    <span className="font-semibold">{e.conversas}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Alertas: sem resposta + escalonadas + duplicidades */}
      {relatorio && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-white p-5 dark:border-rose-500/30 dark:bg-zinc-800">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4" />
              Clientes órfãos — sem resposta há 8h+
            </h2>
            <div className="space-y-2">
              {relatorio.semResposta.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-zinc-500">Nenhum cliente órfão. 🎉</p>
              ) : (
                relatorio.semResposta.map((sr) => (
                  <Link
                    key={sr.conversaId}
                    href={`/mensagens?abrir=${sr.conversaId}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-3 py-2 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-100">
                        {sr.nomeCliente || sr.numero}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                        {sr.corretor} · {sr.etapa || "sem etapa"}
                      </span>
                    </span>
                    <span className="rounded-full bg-rose-600 px-2 py-1 text-[10px] font-bold text-white">
                      {sr.vencidoAposHoras}h
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-white p-5 dark:border-amber-500/30 dark:bg-zinc-800">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
                <ShieldAlert className="h-4 w-4" />
                Escalonamentos (reclamação / risco)
              </h2>
              <div className="space-y-2">
                {relatorio.escalonadas.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-zinc-500">Nenhum escalonamento no momento.</p>
                ) : (
                  relatorio.escalonadas.slice(0, 6).map((e, i) => (
                    <div
                      key={`${e.conversaId}-${i}`}
                      className="rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-500/10"
                    >
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
                        {e.nomeCliente || e.numero} — {e.motivo}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {e.corretor} · {formatarDia(e.ultimaMensagem)} {formatarHorario(e.ultimaMensagem)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {relatorio.duplicidades.length > 0 && (
              <div className="rounded-2xl border border-sky-200 bg-white p-5 dark:border-sky-500/30 dark:bg-zinc-800">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-sky-700 dark:text-sky-300">
                  <Users className="h-4 w-4" />
                  Duplicidade — mesmo cliente em mais de uma conversa
                </h2>
                <div className="space-y-2">
                  {relatorio.duplicidades.map((d) => (
                    <div key={d.numero} className="rounded-xl bg-sky-50 px-3 py-2 dark:bg-sky-500/10">
                      <p className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
                        {d.numero}
                        {d.mesmosCorretores ? " · mesmo corretor" : " · corretores diferentes ⚠️"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {d.conversas.map((c) => c.nomeCliente || c.corretor || c.id).join(" <> ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Follow-up automático + NPS */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
              <Zap className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              Follow-up automático
            </h2>
            <button
              onClick={aplicarFollowUps}
              disabled={aplicando}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 dark:bg-white dark:text-zinc-900"
            >
              {aplicando ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <ArrowRight className="h-3 w-3" />
              )}
              Aplicar gatilhos
            </button>
          </div>
          {avisoFollowUp && (
            <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              {avisoFollowUp}
            </p>
          )}
          <div className="space-y-2">
            {gatilhos.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-zinc-700/40"
              >
                <span>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-100">
                    {g.nome}
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                    etapa {g.etapa} · retorno em {g.prazoDias} dia(s)
                    {g.disparaNps ? " · dispara NPS" : ""}
                  </span>
                </span>
                <ChatBadge ativo={g.ativo} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
            <Star className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            Pesquisas NPS
            {relatorio && (
              <span className="ml-auto rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                média {relatorio.nps.media === null ? "—" : relatorio.nps.media}/10 · {relatorio.nps.pendentes} pendentes
              </span>
            )}
          </h2>
          <div className="space-y-2">
            {nps.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500">
                Nenhuma pesquisa. Dispare pelo painel de conversas ou ao aplicar os gatilhos.
              </p>
            ) : (
              nps.map((n) => (
                <LinhaNps key={n.id} nps={n} aoResponder={responderNps} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Prefixo export + log de acesso */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
            <Building2 className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            Além do painel
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/mensagens"
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-zinc-700 dark:text-zinc-200"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Painel de conversas
            </Link>
            <a
              href="/api/whatsapp/export?formato=csv"
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-zinc-700 dark:text-zinc-200"
            >
              <FileDown className="h-3.5 w-3.5" />
              Exportar CSV
            </a>
            <a
              href="/api/whatsapp/export?formato=json"
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-zinc-700 dark:text-zinc-200"
            >
              <FileDown className="h-3.5 w-3.5" />
              Exportar JSON
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
            <Eye className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
            Log de acesso (LGPD)
          </h2>
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {acessos.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500">Nenhum acesso registrado.</p>
            ) : (
              acessos.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-1.5 text-xs dark:bg-zinc-700/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-700 dark:text-zinc-200">
                      {a.acao.replace(/_/g, " ")}
                    </span>
                    <span className="block truncate text-[11px] text-slate-400 dark:text-zinc-500">
                      {a.usuario} · {a.cliente}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400 dark:text-zinc-500">
                    {formatarDia(a.em)} {formatarHorario(a.em)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ChatBadge({ ativo }: { ativo: boolean }) {
  return ativo ? (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
      ativo
    </span>
  ) : (
    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-zinc-600 dark:text-zinc-300">
      inativo
    </span>
  );
}