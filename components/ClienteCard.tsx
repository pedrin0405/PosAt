"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  ArrowRight,
  MessageSquarePlus,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import {
  ClienteCompleto,
  FinalidadeCliente,
  NivelConfianca,
  StatusRelacionamento,
} from "@/lib/segmentacao/tipos";
import NovaInteracaoModal from "./NovaInteracaoModal";
import NovaTarefaModal from "./NovaTarefaModal";
import HandoffModal from "./HandoffModal";

interface ClienteCardProps {
  cliente: ClienteCompleto;
  onAtualizado?: () => void;
}

// ─── Config maps (exported for use in Filters/Board) ───

export const finalidadeConfig: Record<
  FinalidadeCliente,
  { label: string; bg: string; text: string; border: string }
> = {
  primeiro_imovel:    { label: "Primeiro Imóvel",      bg: "bg-blue-500/15",      text: "text-blue-300",      border: "border-blue-500/30" },
  moradia:            { label: "Moradia",               bg: "bg-emerald-500/15",     text: "text-emerald-300",     border: "border-emerald-500/30" },
  investimento:       { label: "Investidor",            bg: "bg-amber-500/15",    text: "text-amber-300",    border: "border-amber-500/30" },
  possivel_investidor:{ label: "Possível Invest.",      bg: "bg-amber-500/10",    text: "text-amber-300",    border: "border-amber-500/25" },
  upgrade:            { label: "Upgrade",               bg: "bg-purple-500/15",    text: "text-purple-300",    border: "border-purple-500/30" },
  segunda_residencia: { label: "2ª Residência",         bg: "bg-teal-500/15",     text: "text-teal-300",     border: "border-teal-500/30" },
  compra_para_familiar:{ label: "Compra Familiar",       bg: "bg-indigo-500/15",  text: "text-indigo-300",  border: "border-indigo-500/30" },
  locacao:            { label: "Locação",               bg: "bg-slate-700/40",     text: "text-slate-300",     border: "border-slate-600" },
  imovel_comercial:   { label: "Comercial",             bg: "bg-orange-500/15",   text: "text-orange-300",   border: "border-orange-500/30" },
  cliente_recorrente: { label: "Recorrente",            bg: "bg-emerald-500/20",  text: "text-emerald-200",  border: "border-emerald-500/30" },
  potencial_indicacao:{ label: "Indicação",             bg: "bg-rose-500/15",     text: "text-rose-300",     border: "border-rose-500/30" },
  nao_identificado:   { label: "Sem perfil",            bg: "bg-slate-700/40",     text: "text-slate-400",     border: "border-slate-600" },
};

export const statusConfig: Record<
  StatusRelacionamento,
  { label: string; bg: string; text: string }
> = {
  novo_lead:        { label: "Novo Lead",          bg: "bg-blue-500/15",    text: "text-blue-300" },
  em_qualificacao:  { label: "Em Qualificação",    bg: "bg-amber-500/15",   text: "text-amber-300" },
  em_negociacao:    { label: "Em Negociação",      bg: "bg-indigo-500/15",  text: "text-indigo-300" },
  convertido:       { label: "Convertido",         bg: "bg-emerald-500/15", text: "text-emerald-300" },
  handoff_pendente: { label: "Handoff Pendente",   bg: "bg-rose-500/15",    text: "text-rose-300" },
  onboarding:       { label: "Onboarding",         bg: "bg-purple-500/15",  text: "text-purple-300" },
  pos_venda:        { label: "Pós-Venda",          bg: "bg-teal-500/15",    text: "text-teal-300" },
  cliente_ativo:    { label: "Ativo",              bg: "bg-emerald-500/15", text: "text-emerald-300" },
  cliente_inativo:  { label: "Inativo",            bg: "bg-slate-700/40",   text: "text-slate-400" },
  reativacao:       { label: "Reativação",         bg: "bg-yellow-500/15",  text: "text-yellow-300" },
  sem_resposta:     { label: "Sem Resposta",       bg: "bg-slate-700/40",   text: "text-slate-400" },
  encerrado:        { label: "Encerrado",          bg: "bg-slate-700/40",   text: "text-slate-300" },
};

export const confiancaConfig: Record<
  NivelConfianca,
  { label: string; bg: string; text: string }
> = {
  alta:              { label: "Alta",             bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",  text: "text-emerald-300" },
  media:             { label: "Média",            bg: "bg-amber-500/15 text-amber-300 border-amber-500/30",          text: "text-amber-300" },
  baixa:             { label: "Baixa",            bg: "bg-slate-700/40 text-slate-300 border-slate-600",             text: "text-slate-300" },
  revisao_necessaria:{ label: "Revisão",          bg: "bg-rose-500/15 text-rose-300 border-rose-500/30",             text: "text-rose-300" },
};

export const termometroCXConfig: Record<
  string,
  { label: string; dot: string; bg: string; text: string; border: string }
> = {
  promotor_mgm:        { label: "Promotor / MGM",   dot: "bg-emerald-400", bg: "bg-emerald-500/15",   text: "text-emerald-200",   border: "border-emerald-500/30" },
  neutro_nutricao:     { label: "Neutro",            dot: "bg-amber-400",   bg: "bg-amber-500/15",     text: "text-amber-200",     border: "border-amber-500/30" },
  insatisfeito_distrato: { label: "Risco de Distrato", dot: "bg-rose-500",  bg: "bg-rose-500/15",     text: "text-rose-200",     border: "border-rose-500/30" },
};

// ─── Avatar helper ───
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function avatarColor(name: string): string {
  const colors = [
    "#e05b3f","#00a699","#d97706","#6366f1","#0ea5e9","#84cc16","#ec4899"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Component ───
export default function ClienteCard({ cliente, onAtualizado }: ClienteCardProps) {
  const [modalInteracaoAberto, setModalInteracaoAberto] = useState(false);
  const [modalTarefaAberto, setModalTarefaAberto] = useState(false);
  const [modalHandoffAberto, setModalHandoffAberto] = useState(false);

  const nome = cliente.pessoa?.nome || "Lead Sem Nome";
  const telefone = cliente.pessoa?.telefone;
  const status = statusConfig[cliente.status] ?? { label: cliente.status, bg: "bg-slate-700/40", text: "text-slate-300" };
  const cx = cliente.termometro_cx ? termometroCXConfig[cliente.termometro_cx] : null;
  const finalidade = finalidadeConfig[cliente.finalidade_principal] ?? finalidadeConfig.nao_identificado;

  const empreendimento =
    cliente.empreendimento ||
    (cliente.pessoa?.dados_originais?.empreendimento as string) ||
    (cliente.regiao_interesse ? `Condomínio ${cliente.regiao_interesse}` : null);

  const isDistrato = cliente.termometro_cx === "insatisfeito_distrato" || cliente.alerta_distrato_ativo;

  return (
    <>
      <article
        className="group flex flex-col overflow-hidden rounded-3xl border bg-[#161F33] transition-all duration-200"
        style={{
          borderColor: isDistrato ? "rgba(244,63,94,0.5)" : "rgba(30,41,59,0.6)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = isDistrato ? "rgba(244,63,94,0.7)" : "rgba(51,65,85,0.8)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = isDistrato ? "rgba(244,63,94,0.5)" : "rgba(30,41,59,0.6)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {/* Distrato alert stripe */}
        {isDistrato && (
          <div className="h-1 w-full" style={{ background: "var(--danger)" }} />
        )}

        <div className="flex flex-col flex-1 p-5">
          {/* Top row: avatar + name + badges */}
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg shadow-black/20"
              style={{ background: avatarColor(nome) }}
            >
              {initials(nome)}
            </div>

            {/* Name + Empreendimento */}
            <div className="flex-1 min-w-0">
              <h2 className="text-[15px] font-black tracking-wide leading-tight truncate text-white">
                <Link
                  href={`/clientes/${cliente.id}`}
                  className="hover:text-sky-300"
                >
                  {nome}
                </Link>
              </h2>
              {empreendimento && (
                <p className="flex items-center gap-1.5 text-sm mt-0.5 truncate text-slate-400">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                  <span className="truncate">{empreendimento}{cliente.unidade ? ` · ${cliente.unidade}` : ""}</span>
                </p>
              )}
            </div>

            {/* Status badge */}
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${status.bg} ${status.text}`}
            >
              {status.label}
            </span>
          </div>

          {/* CX pill + Finalidade */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {cx && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${cx.bg} ${cx.text} ${cx.border}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${cx.dot}`} />
                {cx.label}
              </span>
            )}
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-bold ${finalidade.bg} ${finalidade.text} ${finalidade.border}`}
            >
              {finalidade.label}
            </span>
            {cliente.oportunidade_upsell && (
              <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-[11px] font-bold text-purple-300">
                Up-Sell ✦
              </span>
            )}
          </div>

          {/* Meta: Corretor + Telefone */}
          {(cliente.corretor_original_nome || telefone) && (
            <div
              className="mt-3 flex items-center gap-4 text-sm text-slate-400"
            >
              {cliente.corretor_original_nome && (
                <span>Corretor: <strong className="text-slate-200">{cliente.corretor_original_nome}</strong></span>
              )}
              {telefone && (
                <span className="truncate">{telefone}</span>
              )}
            </div>
          )}

          {/* Próxima ação (se houver) — very compact */}
          {cliente.proxima_acao && (
            <p
              className="mt-3 text-xs leading-relaxed line-clamp-2 pl-2 text-slate-400"
              style={{ borderLeft: "2px solid var(--border-strong)" }}
            >
              {cliente.proxima_acao}
            </p>
          )}
        </div>

        {/* Footer: actions */}
        <div
          className="flex items-center justify-between gap-2 px-5 py-3 border-t border-slate-800/80 bg-[#0B0F17]"
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => setModalInteracaoAberto(true)}
              title="Registrar Interação"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Interação</span>
            </button>
            <button
              onClick={() => setModalTarefaAberto(true)}
              title="Criar Tarefa"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tarefa</span>
            </button>
            <button
              onClick={() => setModalHandoffAberto(true)}
              title="Passagem de Bastão"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Handoff</span>
            </button>
          </div>

          <Link
            href={`/clientes/${cliente.id}`}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-500"
          >
            Ver perfil
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>

      <NovaInteracaoModal
        aberto={modalInteracaoAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalInteracaoAberto(false)}
        aoSalvar={() => { setModalInteracaoAberto(false); onAtualizado?.(); }}
      />
      <NovaTarefaModal
        aberto={modalTarefaAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalTarefaAberto(false)}
        aoSalvar={() => { setModalTarefaAberto(false); onAtualizado?.(); }}
      />
      <HandoffModal
        aberto={modalHandoffAberto}
        clienteId={cliente.id}
        nomeCliente={nome}
        aoFechar={() => setModalHandoffAberto(false)}
        aoSalvar={() => { setModalHandoffAberto(false); onAtualizado?.(); }}
      />
    </>
  );
}