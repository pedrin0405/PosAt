"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  UserRound,
  Calendar,
  MoreHorizontal,
  ArrowRight,
  MessageCirclePlus,
  XCircle,
  RotateCcw,
  Target,
  Sparkles,
} from "lucide-react";
import { OportunidadeItem } from "@/lib/segmentacao/tipos";
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

interface OportunidadeCardProps {
  oportunidade: OportunidadeItem;
  aoAbrir: () => void;
  aoAvancar?: () => void;
  aoConverter?: () => void;
  aoRemover?: () => void;
  aoReabrir?: () => void;
}

export default function OportunidadeCard({
  oportunidade: o,
  aoAbrir,
  aoAvancar,
  aoConverter,
  aoRemover,
  aoReabrir,
}: OportunidadeCardProps) {
  const [menuAberto, setMenuAberto] = useState(false);
  const tipo = TIPO_LABEL[o.tipo] || TIPO_LABEL.outro;
  const grupo = grupoDeOportunidade(o.status);
  const proximo = PROXIMO_PASSO_STATUS[o.status];
  const vencida = ehVencida(o.prazo_em);
  const tags = (o.tags || []).filter((t) => t !== "Removido").slice(0, 3);

  const fecharMenu = () => setMenuAberto(false);

  return (
    <div
      onClick={aoAbrir}
      className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tipo.badge}`}>
            {tipo.label}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
            <Sparkles className="h-3 w-3" />
            {ORIGEM_LABEL[o.origem] || "Outro"}
          </span>
        </div>
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuAberto(!menuAberto);
            }}
            aria-label="Ações da oportunidade"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuAberto && (
            <div
              className="absolute right-0 top-9 z-20 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-600 dark:bg-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  fecharMenu();
                  aoAbrir();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Target className="h-3.5 w-3.5" />
                Abrir detalhes
              </button>
              {grupo === "ativas" && proximo && aoAvancar && (
                <button
                  onClick={() => {
                    fecharMenu();
                    aoAvancar();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Avançar para {STATUS_LABEL[proximo]}
                </button>
              )}
              {grupo === "ativas" && o.status === "aguardando_decisao" && aoConverter && (
                <button
                  onClick={() => {
                    fecharMenu();
                    aoConverter();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                >
                  <MessageCirclePlus className="h-3.5 w-3.5" />
                  Converter em novo lead
                </button>
              )}
              {grupo === "ativas" && aoRemover && (
                <button
                  onClick={() => {
                    fecharMenu();
                    aoRemover();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Perdeu interesse…
                </button>
              )}
              {grupo === "removidas" && aoReabrir && (
                <button
                  onClick={() => {
                    fecharMenu();
                    aoReabrir();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reavaliar (reabrir)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Título */}
      <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-zinc-100">
        {o.descricao}
      </h3>

      {/* Valor */}
      {o.valor_estimado ? (
        <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
          {formataMoeda(o.valor_estimado)}
        </span>
      ) : null}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300"
            >
              {t}
            </span>
          ))}
          {(o.tags || []).filter((t) => t !== "Removido").length > 3 && (
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
              +{(o.tags || []).filter((t) => t !== "Removido").length - 3}
            </span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="space-y-1 text-xs text-slate-500 dark:text-zinc-400">
        {o.cliente?.id && (
          <Link
            href={`/clientes/${o.cliente.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 font-semibold text-slate-700 hover:underline dark:text-zinc-200"
          >
            <Target className="h-3 w-3" />
            {o.cliente.nome || "Cliente"}
          </Link>
        )}
        {o.imovel && (
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3 w-3" />
            {o.imovel.codigo_imovel} · {o.imovel.empreendimento}
          </div>
        )}
        {o.vendedor && (
          <div className="flex items-center gap-1.5">
            <UserRound className="h-3 w-3" />
            {o.vendedor.nome}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
        <span className="font-semibold">{STATUS_LABEL[o.status] || o.status}</span>
        <div className="flex items-center gap-2">
          {o.regra_geradora !== "origem_manual" && (
            <span className="hidden items-center gap-1 sm:flex">
              <Sparkles className="h-3 w-3" />
              {REGRA_LABEL[o.regra_geradora] || o.regra_geradora}
            </span>
          )}
          {o.prazo_em && (
            <span className={`flex items-center gap-1 ${vencida ? "font-semibold text-rose-600 dark:text-rose-400" : ""}`}>
              <Calendar className="h-3 w-3" />
              {formataData(o.prazo_em)}
            </span>
          )}
        </div>
      </div>

      {/* Nota de remoção */}
      {o.status === "removida" && o.removida_motivo && (
        <p className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] leading-relaxed text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {o.removida_motivo}
        </p>
      )}
    </div>
  );
}