// Utilitários do espelhamento WhatsApp → CRM

export const LIMITE_SEM_RESPOSTA_MS = 8 * 3600000; // 8 horas

// Normaliza números no padrão internacional BR: 55 + DDD + número.
export function normalizarTelefone(telefone: string | null | undefined): string {
  const digitos = (telefone || "").replace(/\D/g, "");
  if (!digitos) return "";
  if (digitos.startsWith("55") && digitos.length >= 12 && digitos.length <= 13) {
    return digitos;
  }
  if (digitos.length >= 10 && digitos.length <= 11) {
    return "55" + digitos;
  }
  return digitos;
}

// Extrai o número de um remoteJid do WhatsApp ("5511987654321@s.whatsapp.net")
export function extrairNumeroDeJid(jid: string): string {
  const base = jid.split("@")[0] || jid;
  return base.replace(/\D/g, "");
}

export function horasDesde(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
}

export function formatarHorario(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function formatarDia(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return "";
  }
}

// Detecta se a última mensagem da conversa é do cliente e está sem resposta há muito tempo.
export function estaSemResposta(
  mensagens: { origem: string; enviado_em: string }[],
  limiteMs: number = LIMITE_SEM_RESPOSTA_MS
): { semResposta: boolean; ultimaMensagem: string | null; vencidoAposHoras: number } {
  if (!mensagens.length) {
    return { semResposta: false, ultimaMensagem: null, vencidoAposHoras: 0 };
  }
  const ordenadas = [...mensagens].sort(
    (a, b) => new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime()
  );
  const ultima = ordenadas[0];
  if (ultima.origem !== "recebida") {
    return { semResposta: false, ultimaMensagem: ultima.enviado_em, vencidoAposHoras: 0 };
  }
  const decorrido = Date.now() - new Date(ultima.enviado_em).getTime();
  return {
    semResposta: decorrido >= limiteMs,
    ultimaMensagem: ultima.enviado_em,
    vencidoAposHoras: Math.round(decorrido / 3600000),
  };
}

// Palavras-chave que disparam escalonamento para o gestor (reclamação/risco)
export const PALAVRAS_ESCALONAMENTO: { palavras: string[]; motivo: string }[] = [
  {
    palavras: ["reclama", "reclamar", "insatisfeito", "não recebi", "não recebemos"],
    motivo: "Reclamação do cliente",
  },
  {
    palavras: ["problema", "bug", "errado", "quebrado", "vazamento", "rachadura"],
    motivo: "Problema relatado",
  },
  {
    palavras: ["reembolso", "cancelamento", "desistir", "distrato", "processo", "juiz", "advogado"],
    motivo: "Risco de distrato / reembolso",
  },
];

export function detectarEscalonamento(texto: string): { motivo: string } | null {
  const lower = (texto || "").toLowerCase();
  for (const grupo of PALAVRAS_ESCALONAMENTO) {
    if (grupo.palavras.some((p) => lower.includes(p))) {
      return { motivo: grupo.motivo };
    }
  }
  return null;
}

// ---- IA heurística (sentimento, resumo e próxima ação) ----
// Sem dependência externa: análises determinísticas por palavras-chave,
// trocáveis por um modelo de linguagem no futuro.

export type SentimentoClassificacao = "satisfeito" | "neutro" | "irritado";

const PALAVRAS_NEGATIVAS = [
  "reclama", "insatisfeito", "horrível", "horrivel", "péssimo", "pessimo",
  "atraso", "atrasada", "atrasado", "errado", "errada", "buraco", "rachadura",
  "vazamento", "processo", "advogado", "juiz", "distrato", "reembolso",
  "cancele", "cancelar", "desistir", "não recebi", "nao recebi", "não recebemos",
  "decepcion", "absurdo", "mentira", "engano", "demora", "demorou",
];

const PALAVRAS_POSITIVAS = [
  "ótima", "otima", "ótimo", "otimo", "excelente", "gostei", "gostamos",
  "incrível", "incrivel", "obrigado", "obrigada", "agradeço", "agradeco",
  "muito bom", "maravilho", "parabéns", "parabens", "perfeito", "sensacional",
  "amei", "ador", "sucesso", "recomendo", "recomendo", "agradável",
];

export function analisarSentimento(
  mensagens: { origem: string; conteudo: string }[]
): SentimentoClassificacao {
  const texto = (mensagens || [])
    .map((m) => m.conteudo)
    .join(" ")
    .toLowerCase();
  let negativas = 0;
  let positivas = 0;
  for (const p of PALAVRAS_NEGATIVAS) if (texto.includes(p)) negativas += 1;
  for (const p of PALAVRAS_POSITIVAS) if (texto.includes(p)) positivas += 1;
  if (negativas > positivas) return "irritado";
  if (positivas > 0) return "satisfeito";
  return "neutro";
}

export function resumirConversa(
  mensagens: { origem: string; conteudo: string; enviado_em: string }[]
): string {
  if (!mensagens.length) return "Conversa sem mensagens.";
  const total = mensagens.length;
  const recebidas = mensagens.filter((m) => m.origem === "recebidas" || m.origem === "recebida").length;
  const enviadas = total - recebidas;
  const tempos = mensagens
    .map((m) => new Date(m.enviado_em).getTime())
    .filter((t) => !Number.isNaN(t));
  const dias = tempos.length > 1
    ? Math.max(1, Math.round((Math.max(...tempos) - Math.min(...tempos)) / 86400000))
    : 1;
  const ultima = mensagens[mensagens.length - 1] || mensagens[0];
  const trecho = (ultima.conteudo || "").slice(0, 90);
  return `Conversa com ${total} mensagens (${recebidas} do cliente, ${enviadas} do corretor) em ~${dias} dia(s). Última: "${trecho}${trecho.length > 89 ? "…" : ""}".`;
}

export function tempoMedioRespostaMin(
  mensagens: { origem: string; enviado_em: string }[]
): number | null {
  const ordenadas = [...(mensagens || [])].sort(
    (a, b) => new Date(a.enviado_em).getTime() - new Date(b.enviado_em).getTime()
  );
  const tempos: number[] = [];
  for (let i = 0; i < ordenadas.length; i++) {
    if (ordenadas[i].origem !== "recebida") continue;
    const proximaEnviada = ordenadas
      .slice(i + 1)
      .find((m) => m.origem === "enviada");
    if (!proximaEnviada) continue;
    const gap = new Date(proximaEnviada.enviado_em).getTime() - new Date(ordenadas[i].enviado_em).getTime();
    if (gap >= 0) tempos.push(gap);
  }
  if (!tempos.length) return null;
  return Math.round(tempos.reduce((s, t) => s + t, 0) / tempos.length / 60000);
}

export function sugerirProximaAcao(input: {
  clienteId: string | null;
  etapa: string | null;
  sentimento: SentimentoClassificacao;
  semResposta: boolean;
  semRespostaHoras?: number;
}): string | null {
  if (!input.clienteId) return "Vincular a conversa a um atendimento ativo no CRM.";
  if (input.semResposta) {
    return `Cliente sem resposta há ${input.semRespostaHoras || 8}h — retornar em definitivo para evitar cliente órfão.`;
  }
  if (input.sentimento === "irritado") {
    return "Sentimento negativo detectado — sinalizar o gestor e agendar contato de apaziguamento.";
  }
  if (input.etapa === "visita") return "Cobrar impressão da visita e enviar proposta.";
  if (input.etapa === "proposta") return "Cobrar retorno sobre a proposta enviada.";
  if (input.etapa === "assinatura") return "Acompanhar documentação (vistoria/financiamento/escritura).";
  if (input.etapa === "entrega_chaves") return "Confirmar satisfação na entrega e disparar pesquisa NPS.";
  return "Manter nutrição até a próxima etapa do funil.";
}

// ---- NPS ----

// Interpreta respostas como "9", "nps 9", "nota 9", "9/10".
export function interpretarRespostaNps(texto: string): number | null {
  const t = (texto || "").trim().toLowerCase();
  if (!t) return null;
  const match = t.match(/^(?:nps|nota|avalia)[\s:\-#.]*(10|[0-9])(?:\s*[\/\-]\s*10)?/);
  const n = match ? Number(match[1]) : null;
  if (n !== null && Number.isInteger(n) && n >= 0 && n <= 10) return n;
  const puro = t.match(/^(10|[0-9])[\s.\-,]*(?:de)?\s*10?$/);
  if (puro) {
    const v = Number(puro[1]);
    if (Number.isInteger(v) && v >= 0 && v <= 10) return v;
  }
  return null;
}

// ---- Gatilhos de follow-up automático (pós-atendimento) ----

export interface GatilhoFollowUpConfig {
  id: string;
  nome: string;
  etapa: string;
  prazoDias: number;
  tituloTarefa: string;
  descricaoTarefa: string;
  responsavelPadrao: string | null;
  disparaNps: boolean;
  ativo: boolean;
}

export const GATILHOS_FOLLOW_UP: GatilhoFollowUpConfig[] = [
  {
    id: "gf-visita",
    nome: "Follow-up pós-visita",
    etapa: "visita",
    prazoDias: 1,
    tituloTarefa: "Retornar cliente após a visita",
    descricaoTarefa: "Follow-up automático: verificar impressão da visita e agendar envio de proposta.",
    responsavelPadrao: null,
    disparaNps: false,
    ativo: true,
  },
  {
    id: "gf-proposta",
    nome: "Retorno de proposta",
    etapa: "proposta",
    prazoDias: 3,
    tituloTarefa: "Cobrar retorno da proposta",
    descricaoTarefa: "Follow-up automático: cobrar retorno sobre a proposta enviada e esclarecer dúvidas.",
    responsavelPadrao: null,
    disparaNps: false,
    ativo: true,
  },
  {
    id: "gf-assinatura",
    nome: "Combo de documentos pós-assinatura",
    etapa: "assinatura",
    prazoDias: 7,
    tituloTarefa: "Acompanhar documentação pós-assinatura",
    descricaoTarefa: "Follow-up automático: vistoria, financiamento/escritura e agendamento de repasse.",
    responsavelPadrao: null,
    disparaNps: false,
    ativo: true,
  },
  {
    id: "gf-entrega",
    nome: "Satisfação após entrega de chaves",
    etapa: "entrega_chaves",
    prazoDias: 1,
    tituloTarefa: "Confirmar satisfação após a entrega de chaves",
    descricaoTarefa: "Follow-up automático: confirmar satisfação e disparar pesquisa de satisfação (NPS).",
    responsavelPadrao: null,
    disparaNps: true,
    ativo: true,
  },
];

export function marcadorFollowUp(gatilhoId: string): string {
  return `[follow-up:${gatilhoId}]`;
}