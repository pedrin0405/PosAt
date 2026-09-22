import {
  TipoOportunidade,
  RegraGeradoraOportunidade,
} from "@/lib/segmentacao/tipos";

export const TIPO_LABEL: Record<TipoOportunidade, { label: string; badge: string }> = {
  recompra: {
    label: "Recompra",
    badge: "bg-sky-500/15",
  },
  upgrade: {
    label: "Upgrade",
    badge: "bg-indigo-500/15",
  },
  investimento_novo: {
    label: "Investimento",
    badge: "bg-emerald-500/15",
  },
  indicacao: {
    label: "Indicação",
    badge: "bg-violet-500/15",
  },
  servicos: {
    label: "Serviços",
    badge: "bg-amber-500/15",
  },
  outro: {
    label: "Outro",
    badge: "bg-slate-700/60",
  },
};

export const STATUS_LABEL: Record<string, string> = {
  identificada: "Identificada",
  em_andamento: "Em andamento",
  aguardando_decisao: "Aguardando decisão",
  em_avaliacao: "Em avaliação",
  proposta_enviada: "Proposta enviada",
  negociacao: "Negociação",
  convertida: "Convertida",
  removida: "Removida",
  encerrada: "Encerrada",
  ganha: "Ganha",
  perdida: "Perdida",
  arquivada: "Arquivada",
};

export const REGRA_LABEL: Record<RegraGeradoraOportunidade, string> = {
  base_retrabalho: "Retrabalho da base",
  venda_recente: "Venda recente",
  locacao_recente: "Locação recente",
  origem_manual: "Registro manual",
  outra: "Outra",
};

export const ORIGEM_LABEL: Record<string, string> = {
  crm: "CRM",
  manual: "Manual",
  formulario: "Formulário",
  whatsapp: "WhatsApp",
  site: "Site",
  supabase: "Supabase",
  planilha: "Planilha",
  outro: "Outro",
};

export const STATUS_ATIVAS = new Set([
  "identificada",
  "em_andamento",
  "aguardando_decisao",
  "em_avaliacao",
  "proposta_enviada",
  "negociacao",
]);
export const STATUS_REMOVIDAS = new Set(["removida"]);
export const STATUS_CONVERTIDAS = new Set(["convertida"]);
export const STATUS_ENCERRADAS = new Set(["encerrada", "ganha", "perdida", "arquivada"]);

export const PROXIMO_PASSO_STATUS: Record<string, string | null> = {
  identificada: "em_andamento",
  em_andamento: "aguardando_decisao",
  aguardando_decisao: null,
  em_avaliacao: "proposta_enviada",
  proposta_enviada: "negociacao",
  negociacao: null,
};

export type GrupoOportunidade = "ativas" | "removidas" | "convertidas" | "encerradas";

export const GRUPO: { id: GrupoOportunidade; label: string }[] = [
  { id: "ativas", label: "Em andamento" },
  { id: "removidas", label: "Removidas" },
  { id: "convertidas", label: "Convertidas" },
  { id: "encerradas", label: "Encerradas" },
];

export function grupoDeOportunidade(status: string): GrupoOportunidade {
  if (STATUS_CONVERTIDAS.has(status)) return "convertidas";
  if (STATUS_REMOVIDAS.has(status)) return "removidas";
  if (STATUS_ENCERRADAS.has(status)) return "encerradas";
  return "ativas";
}

export function formataMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

export function formataData(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ehVencida(prazoEm?: string | null) {
  return Boolean(prazoEm) && new Date(prazoEm as string).getTime() < Date.now();
}