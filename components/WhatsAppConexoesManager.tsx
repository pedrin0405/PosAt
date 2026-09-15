"use client";

import { useEffect, useMemo, useState } from "react";
import { Smartphone, Plus, RefreshCw, QrCode, Check, Link2, Unlink, Loader2 } from "lucide-react";
import { formatarHorario } from "@/lib/whatsapp";

type StatusConexao = "conectado" | "conectando" | "desconectado" | "qr_expirado";

interface ConexaoWhatsApp {
  id: string;
  corretor: string;
  numero: string;
  sessao_id: string;
  status: StatusConexao;
  qr_code: string | null;
  qr_expira_em: string | null;
  ultimo_ping_em: string | null;
  criada_em: string;
  atualizado_em: string;
  instancia?: string | null;
  api_url?: string | null;
  api_key?: string | null;
}

const STATUS_LABEL: Record<StatusConexao, string> = {
  conectado: "Conectado",
  conectando: "Aguardando QR",
  desconectado: "Desconectado",
  qr_expirado: "QR expirado",
};

function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function matrizQr(semente: string): boolean[][] {
  const n = 25;
  const rand = mulberry32(hashString(semente));
  const matriz: boolean[][] = [];
  for (let r = 0; r < n; r++) {
    const linha: boolean[] = [];
    for (let c = 0; c < n; c++) {
      let v = rand() < 0.45;
      const marcador = (r0: number, c0: number) => {
        const dr = r - r0;
        const dc = c - c0;
        if (dr >= 0 && dr < 7 && dc >= 0 && dc < 7) {
          v = dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        }
      };
      marcador(0, 0);
      marcador(0, n - 7);
      marcador(n - 7, 0);
      if (r === 6 && c > 6 && c < n - 7) v = c % 2 === 0;
      if (c === 6 && r > 6 && r < n - 7) v = r % 2 === 0;
      linha.push(v);
    }
    matriz.push(linha);
  }
  return matriz;
}

function QrPseudo({ sessaoId, expiraEm }: { sessaoId: string; expiraEm: string | null }) {
  const matriz = useMemo(() => matrizQr(sessaoId), [sessaoId]);
  const n = matriz.length;
  const margem = 2;
  const escala = 3;
  const box = 2;

  const [restante, setRestante] = useState<string | null>(() => {
    if (!expiraEm) return null;
    const diff = new Date(expiraEm).getTime() - Date.now();
    return diff > 0 ? `${Math.floor(diff / 60000)}:${Math.floor((diff % 60000) / 1000).toString().padStart(2, "0")}` : "expirou";
  });

  useEffect(() => {
    if (!expiraEm) return;
    const id = setInterval(() => {
      const diff = new Date(expiraEm).getTime() - Date.now();
      if (diff <= 0) {
        setRestante("expirou");
        clearInterval(id);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setRestante(`${m}:${s.toString().padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [expiraEm]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={(n + margem * 2) * escala}
        height={(n + margem * 2) * escala}
        viewBox={`0 0 ${n + margem * 2} ${n + margem * 2}`}
        className="rounded-lg border border-slate-200 bg-white dark:border-zinc-600"
      >
        {matriz.map((linha, r) =>
          linha.map((ligado, c) =>
            ligado ? (
              <rect
                key={`${r}-${c}`}
                x={c + margem}
                y={r + margem}
                width={box}
                height={box}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300">
        <QrCode className="h-3.5 w-3.5" />
        Abra o WhatsApp e escaneie
        {restante && (
          <span className="tabular-nums text-slate-400 dark:text-zinc-500">
            · expira em {restante}
          </span>
        )}
      </p>
    </div>
  );
}

export default function WhatsAppConexoesManager() {
  const [conexoes, setConexoes] = useState<ConexaoWhatsApp[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [acionando, setAcionando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [corretor, setCorretor] = useState("");
  const [numero, setNumero] = useState("");
  const [criando, setCriando] = useState(false);

  async function carregar() {
    try {
      const res = await fetch("/api/whatsapp/conexao");
      const json = await res.json();
      if (json?.conexoes) setConexoes(json.conexoes);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    fetch("/api/whatsapp/conexao")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (ativo && json?.conexoes) setConexoes(json.conexoes);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  async function acionar(id: string, acao: "conectar" | "confirmar" | "desconectar") {
    setAcionando(id);
    setErro(null);
    try {
      const res = await fetch(`/api/whatsapp/conexao/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro || "Falha ao gerenciar conexão.");
      } else if (json?.conexao) {
        setConexoes((lista) => lista.map((c) => (c.id === id ? { ...c, ...json.conexao } : c)));
      }
    } catch (e) {
      console.error(e);
      setErro("Falha de rede ao gerenciar conexão.");
    } finally {
      setAcionando(null);
    }
  }

  async function criar() {
    setErro(null);
    if (corretor.trim().length < 2 || numero.trim().length < 8) {
      setErro("Informe o nome do corretor e o número com DDD.");
      return;
    }
    setCriando(true);
    try {
      const res = await fetch("/api/whatsapp/conexao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ corretor: corretor.trim(), numero: numero.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro || "Falha ao criar conexão.");
      } else if (json?.conexao) {
        setConexoes((lista) => [...lista, json.conexao]);
        setCorretor("");
        setNumero("");
      }
    } catch (e) {
      console.error(e);
      setErro("Falha de rede ao criar conexão.");
    } finally {
      setCriando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-zinc-50">
            <Smartphone className="h-5 w-5" />
            Meu WhatsApp
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
            Conecte sua instância para receber os atendimentos no PosAt.
          </p>
        </div>
        <button
          onClick={carregar}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </button>
      </div>

      {erro && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {erro}
        </p>
      )}

      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 dark:border-zinc-600 dark:bg-zinc-800/50">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-zinc-100">
          <Plus className="h-4 w-4" />
          Nova conexão
        </h3>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1 min-w-40">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              Corretor
            </span>
            <input
              value={corretor}
              onChange={(e) => setCorretor(e.target.value)}
              placeholder="Ex.: Consultor André"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <label className="flex-1 min-w-40">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              Número WhatsApp
            </span>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="5511999999999"
              inputMode="numeric"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>
          <button
            onClick={criar}
            disabled={criando}
            className="flex h-10 items-center gap-1.5 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {criando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Criar instância
          </button>
        </div>
      </section>

      {carregando ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-sm text-slate-400 dark:text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Carregando conexões…
        </div>
      ) : conexoes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-zinc-600 dark:text-zinc-500">
          Nenhuma conexão ainda. Crie a primeira acima.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {conexoes.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      c.status === "conectado"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : c.status === "conectando"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-50">{c.corretor}</p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {c.numero} · {c.sessao_id}
                    </p>
                  </div>
                </div>
              </div>

              <StatusBadge status={c.status} />

              {c.status === "conectado" && (
                <p className="mt-2 text-[11px] text-slate-400 dark:text-zinc-500">
                  {c.ultimo_ping_em ? `Último ping: ${formatarHorario(c.ultimo_ping_em)}` : "Sem ping registrado"}
                </p>
              )}

              {c.status === "conectando" && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-zinc-700/40">
                  <QrPseudo sessaoId={c.sessao_id} expiraEm={c.qr_expira_em} />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => acionar(c.id, "confirmar")}
                      disabled={acionando === c.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {acionando === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Já conectei no celular
                    </button>
                    <button
                      onClick={() => acionar(c.id, "desconectar")}
                      disabled={acionando === c.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {c.status !== "conectando" && (
                <div className="mt-3">
                  {c.status === "conectado" ? (
                    <button
                      onClick={() => acionar(c.id, "desconectar")}
                      disabled={acionando === c.id}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {acionando === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
                      Desconectar
                    </button>
                  ) : (
                    <button
                      onClick={() => acionar(c.id, "conectar")}
                      disabled={acionando === c.id}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                    >
                      {acionando === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <QrCode className="h-3.5 w-3.5" />}
                      {c.status === "qr_expirado" ? "Gerar novo QR" : "Conectar"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: StatusConexao }) {
  const cor =
    status === "conectado"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      : status === "conectando"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        : "bg-slate-100 text-slate-500 dark:bg-zinc-700 dark:text-zinc-400";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${cor}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "conectado"
            ? "bg-emerald-500"
            : status === "conectando"
              ? "animate-pulse bg-amber-500"
              : "bg-slate-400"
        }`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}