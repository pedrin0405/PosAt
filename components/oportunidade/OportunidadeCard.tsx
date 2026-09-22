"use client";

import { useState } from "react";
import Link from "next/link";
import {
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
      className="flex cursor-pointer flex-col gap-3 rounded-3xl border border-slate-800/60 bg-[#161F33] p-5 transition-all hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest text-white ${tipo.badge}`}>
            {tipo.label}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
            <Sparkles className="h-3 w-3 text-sky-400" />
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
            className="rounded-lg border border-transparent p-1.5 text-slate-400 transition hover:border-slate-700/80 hover:bg-slate-900/40 hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuAberto && (
            <div
              className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0D1320] py-1.5 text-sm shadow-2xl shadow-black/40"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  fecharMenu();
                  aoAbrir();
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                <Target className="h-3.5 w-3.5 text-sky-400" />
                Abrir detalhes
              </button>
              {grupo === "ativas" && proximo && aoAvancar && (
                <button
                  onClick={() => {
                    fecharMenu();
                    aoAvancar();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-sky-400" />
                  Avançar para {STATUS_LABEL[proximo]}
                </button>
              )}
              {grupo === "ativas" && o.status === "aguardando_decisao" && aoConverter && (
                <button
                  onClick={() => {
                    fecharMenu();
                    aoConverter();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
                >
                  <MessageCirclePlus className="h-3.5 w-3.5 text-emerald-400" />
                  Converter em novo lead
                </button>
              )}
              {grupo === "ativas" && aoRemover && (
                <button
                  onClick={() => {
                    fecharMenu();
                    aoRemover();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-rose-300 transition hover:bg-rose-500/10"
                >
                  <XCircle className="h-3.5 w-3.5 text-rose-400" />
                  Perdeu interesse…
                </button>
              )}
              {grupo === "removidas" && aoReabrir && (
                <button
                  onClick={() => {
                    fecharMenu();
                    aoReabrir();
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-sky-400" />
                  Reavaliar (reabrir)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Título */}
      <h3 className="text-base font-black tracking-wide leading-snug text-white">
        {o.descricao}
      </h3>

      {/* Valor */}
      {o.valor_estimado ? (
        <span className="text-xl font-extrabold text-emerald-400">
          {formataMoeda(o.valor_estimado)}
        </span>
      ) : null}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-700/40 bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-300"
            >
              {t}
            </span>
          ))}
          {(o.tags || []).filter((t) => t !== "Removido").length > 3 && (
            <span className="text-[11px] font-semibold text-slate-500">
              +{(o.tags || []).filter((t) => t !== "Removido").length - 3}
            </span>
          )}
        </div>
      )}

      {/* Sub-container de Metadados */}
      <div className="my-3 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-3.5 pointer-events-none">
        <div className="space-y-2 text-sm text-slate-300">
          {o.cliente?.id && (
            <Link
              href={`/clientes/${o.cliente.id}`}
              className="flex items-center gap-2 font-semibold text-slate-200 hover:text-white hover:underline pointer-events-auto"
            >
              <Target className="h-3.5 w-3.5 text-sky-400" />
              {o.cliente.nome || "Cliente"}
            </Link>
          )}
          {o.vendedor && (
            <div className="flex items-center gap-2 pointer-events-auto">
              <UserRound className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium text-slate-200">{o.vendedor.nome}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            o.status === "removida"
              ? "bg-rose-500/15 text-rose-300"
              : o.status === "convertida"
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-blue-500/15 text-blue-300"
          }`}
        >
          {STATUS_LABEL[o.status] || o.status}
        </span>
        <div className="flex items-center gap-3">
          {o.regra_geradora !== "origem_manual" && (
            <span className="hidden items-center gap-1.5 sm:flex">
              <Sparkles className="h-3 w-3 text-slate-500" />
              {REGRA_LABEL[o.regra_geradora] || o.regra_geradora}
            </span>
          )}
          {o.prazo_em && (
            <span className={`flex items-center gap-1.5 ${vencida ? "font-bold text-rose-400" : ""}`}>
              <Calendar className="h-3 w-3 text-slate-500" />
              {formataData(o.prazo_em)}
            </span>
          )}
        </div>
      </div>

      {/* Nota de remoção */}
      {o.status === "removida" && o.removida_motivo && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-300">
          {o.removida_motivo}
        </p>
      )}
    </div>
  );
}