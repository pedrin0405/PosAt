"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, Clock, RefreshCw, User, Sparkles } from "lucide-react";
import { HandoffItem } from "@/lib/segmentacao/tipos";
import { finalidadeConfig } from "@/components/ClienteCard";

export default function HandoffsPage() {
  const [handoffs, setHandoffs] = useState<HandoffItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarHandoffs() {
    setCarregando(true);
    try {
      const res = await fetch("/api/handoffs");
      if (res.ok) {
        const json = await res.json();
        setHandoffs(json.handoffs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarHandoffs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800/60 bg-[#161F33] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/40">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">Handoff: Vendas &rarr; Atendimento</h1>
            <p className="text-sm text-slate-400">
              Acompanhamento de passagens de bastão, alinhamento de expectativas e checklists de onboarding
            </p>
          </div>
        </div>

        <button
          onClick={carregarHandoffs}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/40 px-3.5 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 text-sky-400" />
          <span>Atualizar</span>
        </button>
      </div>

      {carregando ? (
        <div className="rounded-3xl border border-slate-800/60 bg-[#161F33] py-16 text-center text-sm text-slate-400">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-sky-400" />
          Carregando handoffs...
        </div>
      ) : handoffs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {handoffs.map((h) => {
            const cliente = h.cliente;
            const finalidade = cliente ? finalidadeConfig[cliente.finalidade_principal] : null;

            return (
              <article
                key={h.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-800/60 bg-[#161F33] p-6 shadow-sm transition hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-2 border-b border-slate-800/80 pb-4">
                    <div>
                      <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-300">
                        {h.status.replace(/_/g, " ")}
                      </span>
                      <h2 className="mt-2.5 text-lg font-black tracking-wide text-white">
                        {cliente?.pessoa?.nome || "Cliente"}
                      </h2>
                    </div>

                    {finalidade && (
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${finalidade.bg} ${finalidade.text} ${finalidade.border}`}>
                        {finalidade.label}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Motivo do Handoff:</strong>
                      <p className="leading-relaxed text-slate-300">{h.motivo}</p>
                    </div>

                    {h.resumo && (
                      <div className="rounded-2xl border border-slate-800/60 bg-[#131C2E] p-3.5">
                        <strong className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">Resumo da Negociação:</strong>
                        <p className="leading-relaxed text-slate-300">{h.resumo}</p>
                      </div>
                    )}

                    {h.expectativa_cliente && (
                      <div>
                        <strong className="mb-0.5 block text-xs font-black uppercase tracking-wider text-slate-500">Expectativa do Cliente:</strong>
                        <p className="text-slate-300">{h.expectativa_cliente}</p>
                      </div>
                    )}

                    {h.pendencias && h.pendencias.length > 0 && (
                      <div className="border-t border-slate-800/80 pt-2.5">
                        <strong className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-500">Checklist de Passagem:</strong>
                        <ul className="space-y-1.5">
                          {h.pendencias.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-sky-400" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-4 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Enviado em {new Date(h.criado_em).toLocaleDateString("pt-BR")}
                  </span>

                  {h.cliente_id && (
                    <Link
                      href={`/clientes/${h.cliente_id}`}
                      className="flex items-center gap-1 font-bold text-white hover:text-sky-300"
                    >
                      Acessar Perfil 360° <User className="h-3.5 w-3.5" /> &rarr;
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800/60 bg-[#161F33] p-12 text-center">
          <ArrowRightLeft className="mx-auto mb-3 h-12 w-12 text-slate-600" />
          <h3 className="text-lg font-black tracking-wide text-white">Nenhum handoff registrado</h3>
          <p className="mt-1 text-sm text-slate-400">
            Quando um lead for convertido em venda ou necessitar de onboarding, inicie a transição no perfil do cliente.
          </p>
        </div>
      )}
    </div>
  );
}