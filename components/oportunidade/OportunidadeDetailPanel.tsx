"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Target,
  Building2,
  UserRound,
  Calendar,
  ArrowRight,
  MessageCirclePlus,
  XCircle,
  RotateCcw,
  Sparkles,
  History,
  AlertCircle,
} from "lucide-react";
import {
  OportunidadeItem,
  HistoricoOportunidadeItem,
  AcaoHistoricoOportunidade,
} from "@/lib/segmentacao/tipos";
import {
  TIPO_LABEL,
  STATUS_LABEL,
  REGRA_LABEL,
  ORIGEM_LABEL,
  PROXIMO_PASSO_STATUS,
  grupoDeOportunidade,
  formataMoeda,
  formataData,
  ehVencida,
} from "./oportunidade-ui";

interface OportunidadeDetailPanelProps {
  oportunidade: OportunidadeItem;
  aoFechar: () => void;
  aoAvancar: () => void;
  aoConverter: () => void;
  aoRemover: () => void;
  aoReabrir: () => void;
}

const ACAO_LABEL: Record<AcaoHistoricoOportunidade, string> = {
  criada: "Oportunidade criada",
  sugerida: "Sugestão gerada",
  status_alterado: "Status atualizado",
  removida: "Removida (perdeu interesse)",
  convertida: "Convertida em novo lead",
  reativada: "Reativada",
  observacao: "Observação",
};

function formatarHorario(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OportunidadeDetailPanel({
  oportunidade: o,
  aoFechar,
  aoAvancar,
  aoConverter,
  aoRemover,
  aoReabrir,
}: OportunidadeDetailPanelProps) {
  const [historico, setHistorico] = useState<HistoricoOportunidadeItem[]>([]);
  const tipo = TIPO_LABEL[o.tipo] || TIPO_LABEL.outro;
  const grupo = grupoDeOportunidade(o.status);
  const proximo = PROXIMO_PASSO_STATUS[o.status];
  const vencida = ehVencida(o.prazo_em);
  const leadId = o.lead_criado_id || o.lead_duplicado_id;

  useEffect(() => {
    let ativo = true;
    fetch(`/api/oportunidades/${o.id}/historico`)
      .then((r) => (r.ok ? r.json() : { historico: [] }))
      .then((json) => {
        if (ativo) setHistorico(json.historico || []);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [o.id]);

  const linha = ({
    label,
    valor,
  }: {
    label: string;
    valor: React.ReactNode;
  }) => (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{valor}</dd>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={aoFechar}
      />
      <aside className="absolute right-0 top-0 flex h-screen w-full max-w-lg flex-col border-l border-slate-800/60 bg-[#0D1320] shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-800/80 px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest text-white ${tipo.badge}`}>
                  {tipo.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <Sparkles className="h-3 w-3 text-sky-400" />
                  {ORIGEM_LABEL[o.origem] || "Outro"}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-black tracking-wide leading-snug text-white">
                {o.descricao}
              </h2>
            </div>
            <button
              onClick={aoFechar}
              aria-label="Fechar detalhes"
              className="shrink-0 rounded-xl border border-slate-800 p-2 text-slate-400 transition hover:border-slate-700 hover:bg-slate-900/40 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 space-y-7 overflow-y-auto px-6 py-6">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-5">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Situação</dt>
              <dd className={`mt-1 text-sm font-extrabold ${o.status === "removida" ? "text-rose-400" : o.status === "convertida" ? "text-emerald-400" : "text-sky-400"}`}>
                {STATUS_LABEL[o.status] || o.status}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Valor estimado</dt>
              <dd className="mt-1 text-sm font-extrabold text-emerald-400">
                {o.valor_estimado ? formataMoeda(o.valor_estimado) : "—"}
              </dd>
            </div>
            {o.prazo_em && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prazo</dt>
                <dd className={`mt-1 flex items-center gap-1.5 text-sm ${vencida ? "font-bold text-rose-400" : "text-slate-200"}`}>
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {formataData(o.prazo_em)}
                  {vencida ? " (vencida)" : ""}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prioridade</dt>
              <dd className="mt-1 text-sm text-slate-200">{o.prioridade}</dd>
            </div>
          </div>

          {/* Tags */}
          {(o.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(o.tags || []).map((t) => (
                <span
                  key={t}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    t === "Removido"
                      ? "bg-rose-500/15 text-rose-300"
                      : t === "Convertido"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-slate-900/80 text-slate-300"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Cliente / Imóvel / Vendedor */}
          <dl className="space-y-3.5 rounded-2xl border border-slate-800/60 bg-[#131C2E] p-5">
            {o.cliente?.id && (
              <Link href={`/clientes/${o.cliente.id}`} className="flex items-center gap-2.5 text-sm font-semibold text-slate-200 hover:text-white hover:underline">
                <Target className="h-4 w-4 text-sky-400" />
                {o.cliente.nome || "Cliente"}
              </Link>
            )}
            {o.imovel && (
              <div className="flex items-start gap-2.5 text-sm text-slate-400">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span>
                  {o.imovel.codigo_imovel} — {o.imovel.empreendimento}
                  {o.imovel.bairro ? ` · ${o.imovel.bairro}` : ""}
                  {o.imovel.cidade ? `, ${o.imovel.cidade}` : ""}
                </span>
              </div>
            )}
            {o.vendedor && (
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <UserRound className="h-4 w-4 text-slate-500" />
                {o.vendedor.nome}
              </div>
            )}
            {leadId && (
              <Link href={`/clientes/${leadId}`} className="flex items-center gap-2.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:underline">
                <MessageCirclePlus className="h-4 w-4 text-emerald-400" />
                {o.lead_criado_id ? "Lead criado nesta conversão" : "Cadastro deduplicado"} — ver lead
              </Link>
            )}
          </dl>

          {linha({
            label: "Regra geradora",
            valor: REGRA_LABEL[o.regra_geradora] || o.regra_geradora,
          })}

          {o.evidencia && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evidência / Origem do sinal</dt>
              <dd className="mt-1.5 rounded-xl border border-slate-800/60 bg-[#131C2E] p-3.5 text-sm leading-relaxed text-slate-300">
                {o.evidencia}
              </dd>
            </div>
          )}

          {o.proximo_passo && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Próximo passo</dt>
              <dd className="mt-1.5 rounded-xl border border-slate-800/60 bg-[#131C2E] p-3.5 text-sm text-slate-300">
                {o.proximo_passo}
              </dd>
            </div>
          )}

          {o.status === "removida" && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <div>
                <p className="font-bold">Motivo da remoção</p>
                <p className="mt-0.5">{o.removida_motivo}</p>
                {o.removida_em && (
                  <p className="mt-1 text-xs opacity-80">Em {formataData(o.removida_em)}</p>
                )}
              </div>
            </div>
          )}

          {o.convertida_em && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Convertida em</dt>
              <dd className="mt-1 text-sm text-slate-300">
                {formatarHorario(o.convertida_em)}
              </dd>
            </div>
          )}

          {/* Histórico */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-black tracking-wide text-white">
              <History className="h-4 w-4 text-slate-500" />
              Histórico
            </h3>
            {historico.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nenhum registro no histórico.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-slate-800 pl-4">
                {historico.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0D1320] bg-sky-400" />
                    <p className="text-sm font-bold text-slate-200">
                      {ACAO_LABEL[h.acao] || h.acao}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatarHorario(h.criado_em)}
                      {h.criado_por ? ` · ${h.criado_por}` : ""}
                    </p>
                    {h.observacao && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {h.observacao}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-800/80 px-6 py-4">
          {grupo === "ativas" && proximo && (
            <button
              onClick={aoAvancar}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              <ArrowRight className="h-4 w-4" />
              Avançar para {STATUS_LABEL[proximo]}
            </button>
          )}
          {grupo === "ativas" && o.status === "aguardando_decisao" && (
            <button
              onClick={aoConverter}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
            >
              <MessageCirclePlus className="h-4 w-4" />
              Converter em novo lead
            </button>
          )}
          {grupo === "removidas" && (
            <button
              onClick={aoReabrir}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              <RotateCcw className="h-4 w-4" />
              Reavaliar (reabrir)
            </button>
          )}
          {grupo === "ativas" && (
            <button
              onClick={aoRemover}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-slate-900/40 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
            >
              <XCircle className="h-4 w-4" />
              Perdeu interesse
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}