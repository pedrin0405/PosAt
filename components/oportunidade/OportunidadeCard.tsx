"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserRound,
  Building2,
  Calendar,
  MoreHorizontal,
  ArrowRight,
  MessageCirclePlus,
  XCircle,
  RotateCcw,
  Target,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { OportunidadeItem } from "@/lib/segmentacao/tipos";
import {
  TIPO_LABEL,
  STATUS_LABEL,
  REGRA_LABEL,
  ORIGEM_LABEL,
  PROXIMO_PASSO_STATUS,
  STAGE,
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
  const [mostrarTodasTags, setMostrarTodasTags] = useState(false);

  const grupo = grupoDeOportunidade(o.status);
  const proximo = PROXIMO_PASSO_STATUS[o.status];
  const vencida = ehVencida(o.prazo_em);
  const stage = STAGE[o.status] || STAGE.encerrada;
  const todasTags = (o.tags || []).filter((t) => t !== "Removido");
  const tagsVisiveis = mostrarTodasTags ? todasTags : todasTags.slice(0, 2);

  const evento = o.cliente?.id
    ? o.imovel?.empreendimento ||
      (o.imovel?.bairro || o.imovel?.cidade
        ? [o.imovel.bairro, o.imovel.cidade].filter(Boolean).join(", ")
        : null) ||
      o.imovel?.codigo_imovel ||
      null
    : null;

  const fecharMenu = () => setMenuAberto(false);

  return (
    <div
      onClick={aoAbrir}
      className="flex cursor-pointer flex-col gap-2.5 rounded-2xl border border-slate-800/60 bg-[#161F33] p-4 transition-all hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Linha 1: tipo + origem (secundário) · kebab */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>{TIPO_LABEL[o.tipo]?.label || "Outro"}</span>
          <span className="text-slate-600">•</span>
          <span className="normal-case tracking-normal">{ORIGEM_LABEL[o.origem] || "Outro"}</span>
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

      {/* Cliente */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-black text-sky-300">
          {(o.cliente?.nome || "Cliente")
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase() || "")
            .join("")}
        </div>
        <div className="min-w-0 flex-1">
          {o.cliente?.id ? (
            <Link
              href={`/clientes/${o.cliente.id}`}
              onClick={(e) => e.stopPropagation()}
              className="block truncate text-sm font-black text-white transition hover:text-sky-300 hover:underline"
            >
              {o.cliente.nome || "Cliente"}
            </Link>
          ) : (
            <span className="block truncate text-sm font-black text-white">{o.descricao}</span>
          )}
          {o.cliente?.id && (
            <span className="block truncate text-[11px] text-slate-500">{o.descricao}</span>
          )}
        </div>
      </div>

      {/* Empreendimento */}
      {evento && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
          <span className="truncate">{evento}</span>
        </div>
      )}

      <div className="my-1 border-t border-slate-800/70" />

      {/* Etapa (cor principal) + próximo passo */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/50 px-2.5 py-1 text-[11px] font-bold">
          <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
          <span className={stage.text}>{STATUS_LABEL[o.status] || o.status}</span>
        </span>
        {grupo === "ativas" && proximo && aoAvancar && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              aoAvancar();
            }}
            className="flex items-center gap-1 rounded-full border border-slate-700/50 px-2.5 py-1 text-[10px] font-bold text-slate-300 transition hover:border-sky-500/50 hover:text-sky-300"
          >
            Próx. {STATUS_LABEL[proximo]}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Próxima ação · Valor */}
      <div className="flex items-center justify-between gap-3">
        {o.proximo_passo ? (
          <span className="flex items-center gap-1.5 truncate text-xs text-slate-400">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
            <span className="truncate">{o.proximo_passo}</span>
          </span>
        ) : o.prazo_em ? (
          <span
            className={`flex items-center gap-1.5 text-xs ${
              vencida ? "font-bold text-rose-400" : "text-slate-400"
            }`}
          >
            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
            {formataData(o.prazo_em)}
          </span>
        ) : (
          <span />
        )}
        {o.valor_estimado ? (
          <span className="shrink-0 text-base font-extrabold text-emerald-400">
            {formataMoeda(o.valor_estimado)}
          </span>
        ) : null}
      </div>

      {/* Responsável */}
      {o.vendedor?.nome && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <UserRound className="h-3 w-3 text-slate-500" />
          {o.vendedor.nome}
        </div>
      )}

      {/* Tags colapsadas + regra geradora */}
      <div className="flex flex-wrap items-center gap-1.5">
        {tagsVisiveis.map((t) => (
          <span
            key={t}
            className="rounded-full border border-slate-700/40 bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-slate-400"
          >
            {t}
          </span>
        ))}
        {todasTags.length > 2 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMostrarTodasTags((v) => !v);
            }}
            className="flex items-center gap-0.5 rounded-full border border-slate-700/50 px-2 py-0.5 text-[10px] font-bold text-slate-400 transition hover:text-slate-200"
          >
            {mostrarTodasTags ? "menos" : `+${todasTags.length - 2}`}
            <ChevronDown className={`h-3 w-3 transition ${mostrarTodasTags ? "rotate-180" : ""}`} />
          </button>
        )}
        {o.regra_geradora !== "origem_manual" && (
          <span className="ml-auto hidden items-center gap-1 text-[10px] font-semibold text-slate-500 sm:flex">
            <Sparkles className="h-3 w-3 text-slate-600" />
            {REGRA_LABEL[o.regra_geradora] || o.regra_geradora}
          </span>
        )}
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