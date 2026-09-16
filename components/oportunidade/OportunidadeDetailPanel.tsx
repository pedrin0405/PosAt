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
      <dt className="text-xs font-medium text-slate-400 dark:text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800 dark:text-zinc-100">{valor}</dd>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={aoFechar}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-zinc-900">
        {/* Header */}
        <div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-700">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tipo.badge}`}>
                  {tipo.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                  <Sparkles className="h-3 w-3" />
                  {ORIGEM_LABEL[o.origem] || "Outro"}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-semibold leading-snug text-slate-900 dark:text-zinc-100">
                {o.descricao}
              </h2>
            </div>
            <button
              onClick={aoFechar}
              aria-label="Fechar detalhes"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <dt className="text-xs font-medium text-slate-400 dark:text-zinc-500">Situação</dt>
              <dd className={`mt-0.5 text-sm font-bold ${o.status === "removida" ? "text-rose-600 dark:text-rose-400" : o.status === "convertida" ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-zinc-100"}`}>
                {STATUS_LABEL[o.status] || o.status}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400 dark:text-zinc-500">Valor estimado</dt>
              <dd className="mt-0.5 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                {o.valor_estimado ? formataMoeda(o.valor_estimado) : "—"}
              </dd>
            </div>
            {o.prazo_em && (
              <div>
                <dt className="text-xs font-medium text-slate-400 dark:text-zinc-500">Prazo</dt>
                <dd className={`mt-0.5 flex items-center gap-1 text-sm ${vencida ? "font-semibold text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-zinc-100"}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  {formataData(o.prazo_em)}
                  {vencida ? " (vencida)" : ""}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-slate-400 dark:text-zinc-500">Prioridade</dt>
              <dd className="mt-0.5 text-sm text-slate-800 dark:text-zinc-100">{o.prioridade}</dd>
            </div>
          </div>

          {/* Tags */}
          {(o.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(o.tags || []).map((t) => (
                <span
                  key={t}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    t === "Removido"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                      : t === "Convertido"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Cliente / Imóvel / Vendedor */}
          <dl className="space-y-3 rounded-2xl border border-slate-100 p-4 dark:border-zinc-700">
            {o.cliente?.id && (
              <Link href={`/clientes/${o.cliente.id}`} className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:underline dark:text-zinc-200">
                <Target className="h-4 w-4" />
                {o.cliente.nome || "Cliente"}
              </Link>
            )}
            {o.imovel && (
              <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-zinc-300">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {o.imovel.codigo_imovel} — {o.imovel.empreendimento}
                  {o.imovel.bairro ? ` · ${o.imovel.bairro}` : ""}
                  {o.imovel.cidade ? `, ${o.imovel.cidade}` : ""}
                </span>
              </div>
            )}
            {o.vendedor && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300">
                <UserRound className="h-4 w-4" />
                {o.vendedor.nome}
              </div>
            )}
            {leadId && (
              <Link href={`/clientes/${leadId}`} className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                <MessageCirclePlus className="h-4 w-4" />
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
              <dt className="text-xs font-medium text-slate-400 dark:text-zinc-500">Evidência / Origem do sinal</dt>
              <dd className="mt-0.5 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                {o.evidencia}
              </dd>
            </div>
          )}

          {o.proximo_passo && (
            <div>
              <dt className="text-xs font-medium text-slate-400 dark:text-zinc-500">Próximo passo</dt>
              <dd className="mt-1 rounded-xl border border-slate-100 p-3 text-sm text-slate-700 dark:border-zinc-700 dark:text-zinc-200">
                {o.proximo_passo}
              </dd>
            </div>
          )}

          {o.status === "removida" && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Motivo da remoção</p>
                <p className="mt-0.5">{o.removida_motivo}</p>
                {o.removida_em && (
                  <p className="mt-1 text-xs opacity-80">Em {formataData(o.removida_em)}</p>
                )}
              </div>
            </div>
          )}

          {o.convertida_em && (
            <div>
              <dt className="text-xs font-medium text-slate-400 dark:text-zinc-500">Convertida em</dt>
              <dd className="mt-0.5 text-sm text-slate-700 dark:text-zinc-200">
                {formatarHorario(o.convertida_em)}
              </dd>
            </div>
          )}

          {/* Histórico */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
              <History className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
              Histórico
            </h3>
            {historico.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-zinc-500">
                Nenhum registro no histórico.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-slate-200 pl-4 dark:border-zinc-700">
                {historico.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-400 dark:border-zinc-900 dark:bg-zinc-500" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                      {ACAO_LABEL[h.acao] || h.acao}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                      {formatarHorario(h.criado_em)}
                      {h.criado_por ? ` · ${h.criado_por}` : ""}
                    </p>
                    {h.observacao && (
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
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
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-4 dark:border-zinc-700">
          {grupo === "ativas" && proximo && (
            <button
              onClick={aoAvancar}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <ArrowRight className="h-4 w-4" />
              Avançar para {STATUS_LABEL[proximo]}
            </button>
          )}
          {grupo === "ativas" && o.status === "aguardando_decisao" && (
            <button
              onClick={aoConverter}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <MessageCirclePlus className="h-4 w-4" />
              Converter em novo lead
            </button>
          )}
          {grupo === "removidas" && (
            <button
              onClick={aoReabrir}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <RotateCcw className="h-4 w-4" />
              Reavaliar (reabrir)
            </button>
          )}
          {grupo === "ativas" && (
            <button
              onClick={aoRemover}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
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