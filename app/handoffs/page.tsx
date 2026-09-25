"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, Clock, RefreshCw, User, Sparkles, ChevronDown } from "lucide-react";
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--accent)]">
            <ArrowRightLeft className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Handoff: Vendas &rarr; Atendimento
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Passagens de bastão, alinhamento de expectativas e checklist de onboarding
            </p>
          </div>
        </div>

        <button
          onClick={carregarHandoffs}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--white)] px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--inset)] hover:text-[var(--text-primary)]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {carregando ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--white)] py-16 text-center text-sm text-[var(--text-muted)]">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-[var(--accent)]" />
          Carregando handoffs...
        </div>
      ) : handoffs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {handoffs.map((h) => {
            const cliente = h.cliente;
            const finalidade = cliente ? finalidadeConfig[cliente.finalidade_principal] : null;

            return (
              <details
                key={h.id}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--white)] transition hover:border-[var(--border-strong)]"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--inset)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
                        {h.status.replace(/_/g, " ")}
                      </span>
                      {finalidade && (
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${finalidade.bg} ${finalidade.text} ${finalidade.border}`}>
                          {finalidade.label}
                        </span>
                      )}
                    </div>
                    <h2 className="truncate text-lg font-black tracking-wide text-[var(--text-primary)]">
                      {cliente?.pessoa?.nome || "Cliente"}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{h.motivo}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      Enviado em {new Date(h.criado_em).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-180" />
                </summary>

                <div className="space-y-4 border-t border-[var(--border)] p-5 text-sm">
                  {h.resumo && (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--inset)] p-3.5">
                      <strong className="mb-1 block text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                        Resumo da Negociação
                      </strong>
                      <p className="leading-relaxed text-[var(--text-primary)]">{h.resumo}</p>
                    </div>
                  )}

                  {h.expectativa_cliente && (
                    <div>
                      <strong className="mb-0.5 block text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                        Expectativa do Cliente
                      </strong>
                      <p className="text-[var(--text-secondary)]">{h.expectativa_cliente}</p>
                    </div>
                  )}

                  {h.pendencias && h.pendencias.length > 0 && (
                    <div className="border-t border-[var(--border)] pt-3">
                      <strong className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                        Checklist de Passagem
                      </strong>
                      <ul className="space-y-1.5">
                        {h.pendencias.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {h.cliente_id && (
                    <div className="border-t border-[var(--border)] pt-3">
                      <Link
                        href={`/clientes/${h.cliente_id}`}
                        className="inline-flex items-center gap-1 font-bold text-[var(--accent)] hover:underline"
                      >
                        Acessar Perfil 360° <User className="h-3.5 w-3.5" /> &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--white)] p-12 text-center">
          <ArrowRightLeft className="mx-auto mb-3 h-12 w-12 text-[var(--text-muted)]" />
          <h3 className="text-lg font-black tracking-wide text-[var(--text-primary)]">
            Nenhum handoff registrado
          </h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Quando um lead for convertido em venda ou necessitar de onboarding, inicie a transição no perfil do cliente.
          </p>
        </div>
      )}
    </div>
  );
}