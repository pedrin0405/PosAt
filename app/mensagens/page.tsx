"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Send,
  Phone,
  Search,
  AlertTriangle,
  Link2,
  User,
  Zap,
  Building2,
  Download,
  Trash2,
  Star,
  Sparkles,
  Smartphone,
  LayoutDashboard,
} from "lucide-react";
import WhatsAppConexoesManager from "@/components/WhatsAppConexoesManager";
import WhatsAppGestorDashboard from "@/components/WhatsAppGestorDashboard";
import {
  formatarHorario,
  formatarDia,
  estaSemResposta,
  analisarSentimento,
  resumirConversa,
  sugerirProximaAcao,
} from "@/lib/whatsapp";

interface MensagemUI {
  id: string;
  origem: string;
  tipo: string;
  conteudo: string;
  lida: boolean;
  enviado_em: string;
}

interface ClienteVinculavel {
  id: string;
  nome: string;
  telefone: string | null;
  finalidade_principal: string;
  status: string;
}

interface ConversaUI {
  id: string;
  conexao_id: string;
  corretor: string | null;
  numero_cliente: string;
  nome_cliente: string | null;
  cliente_id: string | null;
  empreendimento: string | null;
  etapa: string | null;
  espelhando: boolean;
  privada_motivo: string | null;
  primeiro_mensagem_em: string;
  ultima_mensagem_em: string;
  mensagens: MensagemUI[];
  cliente?: {
    id: string;
    nome: string | null;
    telefone: string | null;
    finalidade_principal: string;
    status: string;
  } | null;
}

interface ConexaoUI {
  id: string;
  corretor: string;
  numero: string;
  sessao_id: string;
  status: string;
}

interface MetricaUI {
  totalConversas: number;
  espelhadas: number;
  semMatch: number;
  privadas: number;
  semResposta: {
    conversaId: string;
    nomeCliente: string | null;
    vencidoAposHoras: number;
  }[];
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

function AbaConteudo({
  ativa,
  onClick,
  icone,
  label,
}: {
  ativa: boolean;
  onClick: () => void;
  icone: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        ativa
          ? "bg-slate-900 text-white dark:bg-white dark:text-zinc-900"
          : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      }`}
    >
      {icone}
      {label}
    </button>
  );
}

export default function MensagensPage() {
  const [conversas, setConversas] = useState<ConversaUI[]>([]);
  const [clientes, setClientes] = useState<ClienteVinculavel[]>([]);
  const [conexoes, setConexoes] = useState<ConexaoUI[]>([]);
  const [metricas, setMetricas] = useState<MetricaUI | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [visao, setVisao] = useState<"conversas" | "conexoes" | "gestor">("conversas");
  const [busca, setBusca] = useState("");
  const [novoTexto, setNovoTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<string | null>(null);
  const [vinculoBusca, setVinculoBusca] = useState("");
  const [nps, setNps] = useState<NpsUI[]>([]);
  const [respostaNps, setRespostaNps] = useState(9);
  const [comentarioNps, setComentarioNps] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([
      fetch("/api/whatsapp/mensagens").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/whatsapp/conexao").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/whatsapp/metricas").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([msg, con, met]) => {
        if (!ativo) return;
        if (msg?.conversas) setConversas(msg.conversas);
        if (msg?.clientes) setClientes(msg.clientes);
        if (msg?.nps) setNps(msg.nps);
        if (con?.conexoes) setConexoes(con.conexoes);
        if (met?.metricas) setMetricas(met.metricas);
        const abrir = new URLSearchParams(window.location.search).get("abrir");
        if (abrir && msg?.conversas?.some((c: { id: string }) => c.id === abrir)) {
          setSelecionada(abrir);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (threadRef.current && selecionada) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [selecionada, conversas]);

  async function refresh() {
    setCarregando(true);
    try {
      const [msg, con, met] = await Promise.all([
        fetch("/api/whatsapp/mensagens").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/whatsapp/conexao").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/whatsapp/metricas").then((r) => (r.ok ? r.json() : null)),
      ]);
      if (msg?.conversas) setConversas(msg.conversas);
      if (msg?.clientes) setClientes(msg.clientes);
      if (msg?.nps) setNps(msg.nps);
      if (con?.conexoes) setConexoes(con.conexoes);
      if (met?.metricas) setMetricas(met.metricas);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  async function toggleEspelhamento(conversa: ConversaUI) {
    const proximo = !conversa.espelhando;
    setConversas((prev) =>
      prev.map((c) =>
        c.id === conversa.id
          ? {
              ...c,
              espelhando: proximo,
              privada_motivo: proximo ? null : c.privada_motivo,
            }
          : c
      )
    );
    try {
      await fetch(`/api/whatsapp/mensagens/${conversa.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          espelhando: proximo,
          privadaMotivo: proximo ? undefined : "Conversa marcada como particular",
        }),
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function vincularConversa(conversaId: string, clienteId: string) {
    try {
      await fetch(`/api/whatsapp/mensagens/${conversaId}/vincular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId }),
      });
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function dispararNps(conversaId: string) {
    try {
      const res = await fetch("/api/whatsapp/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversaId }),
      });
      if (res.ok) setUltimoResultado("Pesquisa NPS disparada para a conversa.");
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function responderNpsDaConversa(id: string) {
    try {
      const res = await fetch(`/api/whatsapp/nps/${id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nota: Number(respostaNps),
          comentario: comentarioNps || undefined,
        }),
      });
      if (res.ok) {
        setUltimoResultado(`Resposta NPS (${respostaNps}/10) registrada na pesquisa.`);
        setComentarioNps("");
      }
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function excluirConversa(conversaId: string) {
    if (
      !window.confirm(
        "Excluir esta conversa e todos os registros vinculados? (Direito de exclusão — LGPD)"
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/whatsapp/mensagens/${conversaId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUltimoResultado("Conversa excluída (LGPD). Histórico e referências removidos.");
        setSelecionada(null);
        await refresh();
      } else {
        setUltimoResultado("Erro ao excluir a conversa.");
      }
    } catch (e) {
      console.error(e);
      setUltimoResultado("Falha de rede ao excluir a conversa.");
    }
  }

  async function enviarMensagem(direcao: "enviada" | "recebida") {
    if (!selecionada || !novoTexto.trim()) return;
    setEnviando(true);
    try {
      if (direcao === "enviada") {
        const res = await fetch(`/api/whatsapp/mensagens/${selecionada}/responder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conteudo: novoTexto.trim() }),
        });
        const json = await res.json();
        setUltimoResultado(
          json.ok
            ? `Enviada no WhatsApp${json.enviadoViaEvolution ? " via Evolution API" : " (simulação)"} · ${json.registradoNoCrm ? "registrada no CRM" : "sem registro no CRM"}`
            : `Erro: ${json.erro || "desconhecido"}`
        );
        setNovoTexto("");
        await refresh();
        return;
      }

      if (!selecionadaLograda) {
        setUltimoResultado("Selecione uma conversa com conexão ativa para simular a resposta do cliente.");
        return;
      }
      const res = await fetch("/api/whatsapp/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessaoId: selecionadaLograda.sessaoId,
          numero: selecionadaLograda.numero,
          direction: "recebida",
          texto: novoTexto.trim(),
          nomeContato: selecionadaLograda.nomeCliente || undefined,
        }),
      });
      const json = await res.json();
      setUltimoResultado(
        json.ok
          ? `Resposta do cliente espelhada${json.matchCliente ? " · match com cliente" : " · sem match no CRM"}${json.registradoNoCrm ? " · registrada na ficha" : ""}`
          : `Erro: ${json.erro || "desconhecido"}`
      );
      setNovoTexto("");
      await refresh();
    } catch (e) {
      console.error(e);
      setUltimoResultado("Falha de rede ao processar webhook.");
    } finally {
      setEnviando(false);
    }
  }

  const conversaSelecionada = conversas.find((c) => c.id === selecionada) || null;

  const sentimentoConversa = conversaSelecionada
    ? analisarSentimento(conversaSelecionada.mensagens)
    : null;

  const resumoConversa = conversaSelecionada
    ? resumirConversa(conversaSelecionada.mensagens)
    : "";

  const semRespostaConversa = conversaSelecionada
    ? estaSemResposta(conversaSelecionada.mensagens)
    : null;

  const proximaAcaoConversa =
    conversaSelecionada && sentimentoConversa && semRespostaConversa
      ? sugerirProximaAcao({
          clienteId: conversaSelecionada.cliente_id,
          etapa: conversaSelecionada.etapa,
          sentimento: sentimentoConversa,
          semResposta: semRespostaConversa.semResposta,
          semRespostaHoras: semRespostaConversa.vencidoAposHoras,
        })
      : null;

  const npsDaConversa = conversaSelecionada
    ? nps.find((n) => n.conversa_id === conversaSelecionada.id) || null
    : null;
  const sessaoDaConversa = conversaSelecionada
    ? conexoes.find((cx) => cx.id === conversaSelecionada.conexao_id) || null
    : null;
  const selecionadaLograda = conversaSelecionada && sessaoDaConversa
    ? {
        sessaoId: sessaoDaConversa.sessao_id,
        numero: conversaSelecionada.numero_cliente,
        nomeCliente: conversaSelecionada.nome_cliente,
      }
    : null;

  const filtradas = conversas.filter((c) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      c.nome_cliente?.toLowerCase().includes(termo) ||
      c.numero_cliente.includes(termo) ||
      c.corretor?.toLowerCase().includes(termo) ||
      c.empreendimento?.toLowerCase().includes(termo)
    );
  });

  const clientesFiltrados = clientes.filter((c) => {
    if (!vinculoBusca.trim()) return true;
    const termo = vinculoBusca.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      (c.telefone || "").includes(termo)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
            Integração WhatsApp → CRM
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Conversas espelhadas
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Toda conversa do WhatsApp dos corretores vira histórico estruturado no CRM —
            {metricas
              ? ` ${metricas.espelhadas} de ${metricas.totalConversas} conversas espelhadas`
              : " carregando…"}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>

      {/* Abas de visualização */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-800">
        <AbaConteudo
          ativa={visao === "conversas"}
          onClick={() => setVisao("conversas")}
          icone={<MessageSquare className="h-4 w-4" />}
          label="Conversas"
        />
        <AbaConteudo
          ativa={visao === "conexoes"}
          onClick={() => setVisao("conexoes")}
          icone={<Smartphone className="h-4 w-4" />}
          label="Meu WhatsApp"
        />
        <AbaConteudo
          ativa={visao === "gestor"}
          onClick={() => setVisao("gestor")}
          icone={<LayoutDashboard className="h-4 w-4" />}
          label="Painel do gestor"
        />
      </div>

      {visao === "conexoes" ? (
        <WhatsAppConexoesManager />
      ) : visao === "gestor" ? (
        <WhatsAppGestorDashboard compact />
      ) : (
        <>
      {ultimoResultado && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {ultimoResultado}
        </div>
      )}

      {/* Mosaico de métricas rápidas */}
      {metricas && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
              Conversas
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-zinc-50">
              {metricas.totalConversas}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Espelhadas no CRM
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {metricas.espelhadas}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Sem match
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300">
              {metricas.semMatch}
            </p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              Sem resposta (8h+)
            </p>
            <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-300">
              {metricas.semResposta.length}
            </p>
          </div>
        </section>
      )}

      {/* Lista + Detalhe */}
      {carregando ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center text-sm text-slate-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
          <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" />
          Carregando conversas…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* Lista de conversas */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-slate-100 p-3 dark:border-zinc-700">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por cliente, número ou corretor…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                />
              </div>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {filtradas.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-slate-400 dark:text-zinc-500">
                  Nenhuma conversa encontrada.
                </p>
              ) : (
                filtradas.map((c) => {
                  const estado = estaSemResposta(c.mensagens);
                  const semMatch = !c.cliente_id;
                  const privada = !c.espelhando;
                  const ultima = [...c.mensagens].sort(
                    (a, b) => new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime()
                  )[0];
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelecionada(c.id)}
                      className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-700/40 ${
                        selecionada === c.id ? "bg-slate-100 dark:bg-zinc-700/60" : "bg-white dark:bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          semMatch
                            ? "bg-slate-200 text-slate-600 dark:bg-zinc-600 dark:text-zinc-300"
                            : "bg-slate-900 text-white dark:bg-white dark:text-zinc-900"
                        }`}
                      >
                        {(c.nome_cliente || "?").charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {c.nome_cliente || "Número desconhecido"}
                          </span>
                          <span className="shrink-0 text-[11px] text-slate-400 dark:text-zinc-500">
                            {formatarHorario(ultima?.enviado_em)}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                          <span className="truncate">{ultima?.conteudo || "Sem mensagens"}</span>
                        </span>
                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-zinc-700 dark:text-zinc-400">
                            {c.corretor}
                          </span>
                          {estado.semResposta && (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                              Sem resposta · {estado.vencidoAposHoras}h
                            </span>
                          )}
                          {semMatch && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                              Sem match
                            </span>
                          )}
                          {privada && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                              Não espelhar
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Detalhe da conversa */}
          {conversaSelecionada ? (
            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              {/* Cabeçalho da conversa */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                    {(conversaSelecionada.nome_cliente || "?").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {conversaSelecionada.nome_cliente || "Número desconhecido"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {conversaSelecionada.numero_cliente} · {conversaSelecionada.corretor}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {conversaSelecionada.cliente?.id && (
                    <Link
                      href={`/clientes/${conversaSelecionada.cliente.id}`}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-zinc-700 dark:text-zinc-200"
                    >
                      <User className="h-3 w-3" />
                      Ficha do cliente
                    </Link>
                  )}
                  {conversaSelecionada.cliente && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      Match · {conversaSelecionada.cliente.status}
                    </span>
                  )}
                  {conversaSelecionada.espelhando ? (
                    <button
                      onClick={() => toggleEspelhamento(conversaSelecionada)}
                      className="flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      Espelhando
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleEspelhamento(conversaSelecionada)}
                      className="flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-300 dark:bg-zinc-600 dark:text-zinc-300"
                    >
                      <ShieldOff className="h-3 w-3" />
                      Não espelhar
                    </button>
                  )}
                  <a
                    href={`/api/whatsapp/export?conversaId=${conversaSelecionada.id}&formato=csv`}
                    className="flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-300 dark:bg-zinc-600 dark:text-zinc-300"
                  >
                    <Download className="h-3 w-3" />
                    CSV
                  </a>
                  <button
                    onClick={() => excluirConversa(conversaSelecionada.id)}
                    className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-300"
                  >
                    <Trash2 className="h-3 w-3" />
                    Excluir
                  </button>
                </div>
              </div>

              {/* Aviso de conversa privada */}
              {!conversaSelecionada.espelhando && (
                <div className="flex items-start gap-2 border-b border-violet-100 bg-violet-50 px-4 py-2 text-xs text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                  <ShieldOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {conversaSelecionada.privada_motivo ||
                    "Esta conversa não é espelhada para o CRM (LGPD)."}
                </div>
              )}

              {/* Sem match → vincular manualmente */}
              {!conversaSelecionada.cliente_id && (
                <div className="flex flex-col gap-2 border-b border-amber-100 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Nenhum atendimento ativo correspondeu a {conversaSelecionada.numero_cliente}.
                    Vincule manualmente para o histórico constar no CRM:
                  </p>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-500" />
                    <input
                      value={vinculoBusca}
                      onChange={(e) => setVinculoBusca(e.target.value)}
                      placeholder="Buscar cliente para vincular (nome ou telefone)…"
                      className="w-full rounded-xl border border-amber-200 bg-white py-2 pl-9 pr-3 text-sm outline-none dark:border-amber-500/30 dark:bg-zinc-700 dark:text-zinc-100"
                    />
                  </div>
                  <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
                    {clientesFiltrados.slice(0, 8).map((cl) => (
                      <div
                        key={cl.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 dark:bg-zinc-700"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-slate-800 dark:text-zinc-100">
                            {cl.nome}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                            {cl.telefone || "sem telefone"} · {cl.status}
                          </span>
                        </span>
                        <button
                          onClick={() => vincularConversa(conversaSelecionada.id, cl.id)}
                          className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-zinc-900"
                        >
                          <Link2 className="h-3 w-3" />
                          Vincular
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Análise heurística (IA local) */}
              {sentimentoConversa && (
                <div className="space-y-2 border-b border-slate-100 px-4 py-3 dark:border-zinc-700">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                    <Sparkles className="h-3 w-3" />
                    Análise heurística (sem IA em nuvem — LGPD)
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        sentimentoConversa === "irritado"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                          : sentimentoConversa === "satisfeito"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                      }`}
                    >
                      Sentimento: {sentimentoConversa}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {conversaSelecionada.etapa
                        ? `etapa: ${conversaSelecionada.etapa}`
                        : "sem etapa definida"}
                    </span>
                  </div>
                  {resumoConversa && (
                    <p className="text-xs text-slate-600 dark:text-zinc-300">
                      <span className="font-semibold text-slate-700 dark:text-zinc-200">Resumo: </span>
                      {resumoConversa}
                    </p>
                  )}
                  {proximaAcaoConversa && (
                    <p className="text-xs text-sky-700 dark:text-sky-300">
                      <span className="font-semibold">Próxima ação sugerida: </span>
                      {proximaAcaoConversa}
                    </p>
                  )}
                </div>
              )}

              {/* NPS */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100 bg-violet-50/60 px-4 py-3 dark:border-violet-500/20 dark:bg-violet-500/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-800 dark:text-violet-300">
                  <Star className="h-3.5 w-3.5" />
                  Pesquisa NPS
                  {npsDaConversa && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {npsDaConversa.status === "respondida"
                        ? `${npsDaConversa.nota}/10`
                        : "pendente"}
                    </span>
                  )}
                </div>
                {npsDaConversa?.status === "respondida" && npsDaConversa.comentario && (
                  <span className="text-[11px] text-violet-600 dark:text-violet-300">
                    “{npsDaConversa.comentario}”
                  </span>
                )}
                {npsDaConversa?.status === "pendente" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={respostaNps}
                      onChange={(e) => setRespostaNps(Number(e.target.value))}
                      className="w-16 rounded-lg border border-violet-200 bg-white px-2 py-1 text-sm outline-none dark:border-violet-500/30 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <input
                      value={comentarioNps}
                      onChange={(e) => setComentarioNps(e.target.value)}
                      placeholder="Comentário (opcional)"
                      className="w-40 rounded-lg border border-violet-200 bg-white px-2 py-1 text-xs outline-none dark:border-violet-500/30 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <button
                      onClick={() => responderNpsDaConversa(npsDaConversa.id)}
                      className="rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-violet-500"
                    >
                      Registrar resposta
                    </button>
                  </div>
                )}
                {!npsDaConversa && conversaSelecionada.cliente_id && (
                  <button
                    onClick={() => dispararNps(conversaSelecionada.id)}
                    className="rounded-lg bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-200 dark:bg-violet-500/15 dark:text-violet-300"
                  >
                    Disparar pesquisa NPS
                  </button>
                )}
              </div>

              {/* Thread */}
              <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-zinc-900/40">
                {conversaSelecionada.mensagens.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
                    Nenhuma mensagem nesta conversa ainda.
                  </p>
                ) : (
                  [...conversaSelecionada.mensagens]
                    .sort((a, b) => new Date(a.enviado_em).getTime() - new Date(b.enviado_em).getTime())
                    .map((m) => {
                      const ehEnviada = m.origem === "enviada";
                      return (
                        <div key={m.id} className={`flex ${ehEnviada ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                              ehEnviada
                                ? "rounded-br-md bg-slate-900 text-white dark:bg-white dark:text-zinc-900"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {m.conteudo}
                            </p>
                            <p
                              className={`mt-1 text-right text-[10px] ${
                                ehEnviada
                                  ? "text-slate-400 dark:text-zinc-400"
                                  : "text-slate-400 dark:text-zinc-500"
                              }`}
                            >
                              {formatarDia(m.enviado_em)} {formatarHorario(m.enviado_em)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Simulador espelho (webhook) */}
              <div className="border-t border-slate-100 p-3 dark:border-zinc-700">
                <div className="flex items-center gap-1.5 pb-2 text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
                  <Zap className="h-3 w-3" />
                  Simulador do webhook (Evolution API) — a mensagem é processada e espelhada como se chegasse pelo WhatsApp
                </div>
                <div className="flex items-end gap-2">
                  <input
                    value={novoTexto}
                    onChange={(e) => setNovoTexto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void enviarMensagem("enviada");
                    }}
                    placeholder="Digite a mensagem a ser espelhada…"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                  />
                  <button
                    onClick={() => enviarMensagem("enviada")}
                    disabled={enviando || !novoTexto.trim()}
                    className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900"
                  >
                    <Send className="h-4 w-4" />
                    Enviar
                  </button>
                  <button
                    onClick={() => enviarMensagem("recebida")}
                    disabled={enviando || !novoTexto.trim()}
                    title="Simular cliente respondendo"
                    className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                  >
                    <Phone className="h-4 w-4" />
                    Receber
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-24 text-center dark:border-zinc-600">
              <MessageSquare className="mb-3 h-8 w-8 text-slate-300 dark:text-zinc-600" />
              <p className="max-w-xs text-sm text-slate-400 dark:text-zinc-500">
                Selecione uma conversa para ver o histórico espelhado, alternar privacidade ou vincular ao cliente.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legenda de fluxo */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
          <Building2 className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
          Como funciona o espelhamento
        </h2>
        <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 dark:text-zinc-400 md:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-700/40">
            <b className="block text-slate-700 dark:text-zinc-200">1. Conexão</b>
            O corretor conecta o WhatsApp via QR Code (Evolution API) — status aparece acima.
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-700/40">
            <b className="block text-slate-700 dark:text-zinc-200">2. Evento</b>
            Cada mensagem recebida/enviada dispara um webhook para <code className="font-mono">/api/whatsapp/webhook</code>.
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-700/40">
            <b className="block text-slate-700 dark:text-zinc-200">3. Cruzamento</b>
            O número é normalizado (55 + DDD) e cruzado com atendimentos ativos no CRM.
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-700/40">
            <b className="block text-slate-700 dark:text-zinc-200">4. Registro</b>
            A mensagem vira interação na ficha, separando recebidas/enviadas — sem trabalho manual.
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}