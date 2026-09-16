export type FinalidadeCliente =
  | "primeiro_imovel"
  | "moradia"
  | "investimento"
  | "possivel_investidor"
  | "upgrade"
  | "segunda_residencia"
  | "compra_para_familiar"
  | "locacao"
  | "imovel_comercial"
  | "cliente_recorrente"
  | "potencial_indicacao"
  | "nao_identificado";

export type NivelConfianca =
  | "alta"
  | "media"
  | "baixa"
  | "revisao_necessaria";

export type StatusRelacionamento =
  | "novo_lead"
  | "em_qualificacao"
  | "em_negociacao"
  | "convertido"
  | "handoff_pendente"
  | "onboarding"
  | "pos_venda"
  | "cliente_ativo"
  | "cliente_inativo"
  | "reativacao"
  | "sem_resposta"
  | "encerrado";

export type OrigemPessoa =
  | "crm"
  | "formulario"
  | "whatsapp"
  | "site"
  | "supabase"
  | "planilha"
  | "manual"
  | "outro";

export type TipoInteracao =
  | "ligacao"
  | "whatsapp"
  | "email"
  | "visita"
  | "proposta"
  | "chamado"
  | "pesquisa"
  | "observacao"
  | "outro";

export type StatusTarefa =
  | "pendente"
  | "em_andamento"
  | "concluida"
  | "nao_realizada"
  | "reagendada"
  | "sem_resposta";

export type OrigemFluxo = "re_trabalho" | "tempo_real";

export type TermometroCX =
  | "promotor_mgm"          // 🟢 Promotor / MGM
  | "neutro_nutricao"       // 🟡 Neutro / Nutrição
  | "insatisfeito_distrato"; // 🔴 Risco de Distrato

export type EtapaJornadaCS =
  | "handoff"
  | "onboarding"
  | "repasse_financeiro"
  | "vistoria"
  | "pos_entrega";

export type StatusRepasse =
  | "em_analise_credito"
  | "documentacao_pendente"
  | "aprovado"
  | "contrato_assinado"
  | "recurso_liberado";

export interface DonoLead {
  corretorOriginalId?: string;
  corretorOriginalNome?: string;
  analistaCsId?: string;
  analistaCsNome?: string;
}

// ---- Oportunidades (Pós-Venda / Recompra) ----

export type TipoOportunidade =
  | "recompra"
  | "upgrade"
  | "investimento_novo"
  | "indicacao"
  | "servicos"
  | "outro";

export type StatusOportunidade =
  | "identificada"
  | "em_andamento"
  | "aguardando_decisao"
  | "em_avaliacao"
  | "proposta_enviada"
  | "negociacao"
  | "convertida"
  | "removida"
  | "encerrada"
  | "ganha"
  | "perdida"
  | "arquivada";

export type RegraGeradoraOportunidade =
  | "base_retrabalho"
  | "venda_recente"
  | "locacao_recente"
  | "origem_manual"
  | "outra";

export interface OportunidadeItem {
  id: string;
  cliente_id: string;
  tipo: TipoOportunidade;
  descricao: string;
  valor_estimado: number | null;
  status: StatusOportunidade;
  prioridade: number;
  evidencia: string | null;
  criado_por: string | null;
  responsavel_id: string | null;
  prazo_em: string | null;
  proximo_passo: string | null;
  ganha_em: string | null;
  perdida_em: string | null;
  motivo_perda: string | null;
  // Nova camada (sugestões / vendedores / anunciantes)
  vendedor_id: string | null;
  imovel_id: string | null;
  regra_geradora: RegraGeradoraOportunidade;
  tags: string[];
  origem: OrigemPessoa;
  removida_motivo: string | null;
  removida_em: string | null;
  convertida_em: string | null;
  lead_criado_id: string | null;
  lead_duplicado_id: string | null;
  tarefa_primeiro_contato_id: string | null;
  criado_em: string;
  atualizado_em: string;
  cliente?: {
    id: string;
    nome: string | null;
    telefone: string | null;
    email: string | null;
    finalidade_principal: FinalidadeCliente;
    status: StatusRelacionamento;
    nivel_confianca: NivelConfianca;
  };
  vendedor?: {
    id: string;
    nome: string | null;
  };
  imovel?: {
    id: string;
    codigo_imovel: string | null;
    empreendimento: string | null;
    bairro: string | null;
    cidade: string | null;
    regiao: string | null;
    tipo_negocio: string | null;
    valor_venda: number | null;
  };
}

export type AcaoHistoricoOportunidade =
  | "criada"
  | "sugerida"
  | "status_alterado"
  | "removida"
  | "convertida"
  | "reativada"
  | "observacao";

export interface HistoricoOportunidadeItem {
  id: string;
  oportunidade_id: string;
  acao: AcaoHistoricoOportunidade;
  de: string | null;
  para: string | null;
  observacao: string | null;
  criado_por: string | null;
  criado_em: string;
}

export interface VendedorItem {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  documento_cpf: string | null;
  creci: string | null;
  status: "ativo" | "inativo";
  origem: OrigemPessoa;
  criado_em: string;
  atualizado_em: string;
}

export interface ImovelItem {
  id: string;
  codigo_imovel: string;
  empreendimento: string;
  bairro: string;
  cidade: string;
  regiao: string;
  tipologia: string;
  padrao: string | null;
  tipo_negocio: "venda" | "locacao" | "ambos";
  valor_venda: number | null;
  valor_locacao: number | null;
  status: "disponivel" | "reservado" | "vendido" | "locado";
  caracteristicas: string[];
  vendedor_id: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface PromessaVenda {
  id: string;
  descricao: string;
  categoria: "desconto" | "prazo" | "brinde_mobiliario" | "documentacao" | "outro";
  cumprida: boolean;
}

export interface RepasseFinanceiro {
  status: StatusRepasse;
  bancoFinanciador?: string;
  valorFinanciado?: number;
  dataPrevisaoRepasse?: string;
  pendenciasDocumentais: string[];
}

export interface DadosCliente {
  nome?: string | null;
  telefone?: string | null;
  email?: string | null;

  finalidadeDeclarada?: string | null;
  observacoes?: string | null;

  regiaoInteresse?: string | null;
  cidadeInteresse?: string | null;
  bairroInteresse?: string | null;

  tipoImovel?: string | null;
  padraoImovel?: string | null;

  valorMinimo?: number | null;
  valorMaximo?: number | null;

  prazoCompra?: string | null;
  formaPagamento?: string | null;
  precisaFinanciamento?: boolean | null;

  jaPossuiImovel?: boolean | null;
  eInvestidorConfirmado?: boolean | null;
  quantidadeImoveis?: number | null;

  interacoesRecentes?: number;
  visitasRealizadas?: number;
  propostasEnviadas?: number;
}

export interface ResultadoClassificacao {
  finalidadePrincipal: FinalidadeCliente;
  finalidadesSecundarias: FinalidadeCliente[];
  nivelConfianca: NivelConfianca;
  sinais: string[];
  camposFaltantes: string[];
  proximaAcao: string;
}

export interface PessoaCompleta {
  id: string;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  documento?: string | null;
  origem: OrigemPessoa;
  id_externo?: string | null;
  dados_originais?: Record<string, unknown>;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ClienteCompleto {
  id: string;
  pessoa_id: string;
  status: StatusRelacionamento;
  finalidade_principal: FinalidadeCliente;
  finalidades_secundarias: FinalidadeCliente[];
  regiao_interesse: string | null;
  cidade_interesse: string | null;
  bairro_interesse: string | null;
  tipo_imovel: string | null;
  padrao_imovel: string | null;
  valor_minimo: number | null;
  valor_maximo: number | null;
  prazo_compra: string | null;
  forma_pagamento: string | null;
  precisa_financiamento: boolean | null;
  ja_possui_imovel: boolean | null;
  e_investidor_confirmado: boolean;
  indice_completude: number;
  nivel_confianca: NivelConfianca;
  campos_faltantes: string[];
  sinais_classificacao: string[];
  responsavel_id?: string | null;
  ultima_interacao_em?: string | null;
  proxima_acao?: string | null;
  proxima_acao_em?: string | null;
  criado_em: string;
  atualizado_em: string;
  // CS Extended properties
  origem_fluxo?: OrigemFluxo;
  termometro_cx?: TermometroCX;
  etapa_jornada?: EtapaJornadaCS;
  empreendimento?: string | null;
  unidade?: string | null;
  corretor_original_nome?: string | null;
  analista_cs_nome?: string | null;
  promessas_venda?: PromessaVenda[];
  repasse_financeiro?: RepasseFinanceiro;
  oportunidade_upsell?: boolean;
  indice_saude_score?: number;
  alerta_distrato_ativo?: boolean;
  pessoa?: PessoaCompleta;
  interacoes?: InteracaoItem[];
  tarefas?: TarefaItem[];
  handoffs?: HandoffItem[];
}

export interface InteracaoItem {
  id: string;
  cliente_id: string;
  tipo: TipoInteracao;
  canal?: string | null;
  descricao: string;
  resultado?: string | null;
  criado_por?: string | null;
  ocorreu_em: string;
  dados_extra?: Record<string, unknown>;
}

export interface TarefaItem {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao?: string | null;
  status: StatusTarefa;
  prioridade: number;
  responsavel_id?: string | null;
  prazo_em?: string | null;
  concluida_em?: string | null;
  criado_em: string;
  atualizado_em?: string;
  cliente?: {
    id: string;
    finalidade_principal: FinalidadeCliente;
    status: StatusRelacionamento;
    pessoa?: {
      nome: string | null;
      telefone: string | null;
      email: string | null;
    };
  };
}

export interface HandoffItem {
  id: string;
  cliente_id: string;
  responsavel_origem?: string | null;
  responsavel_destino?: string | null;
  status: string;
  motivo?: string | null;
  resumo?: string | null;
  pendencias: string[];
  expectativa_cliente?: string | null;
  enviado_em?: string | null;
  recebido_em?: string | null;
  concluido_em?: string | null;
  criado_em: string;
  cliente?: ClienteCompleto;
}

// ---- WhatsApp (Espelhamento de Conversas) ----

export type OrigemMensagemItem = "recebida" | "enviada";

export type StatusConexaoWhatsAppItem =
  | "conectado"
  | "conectando"
  | "desconectado"
  | "qr_expirado";

export interface ConexaoWhatsAppItem {
  id: string;
  corretor: string;
  numero: string;
  sessao_id: string;
  status: StatusConexaoWhatsAppItem;
  qr_code: string | null;
  qr_expira_em: string | null;
  ultimo_ping_em: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface MensagemWhatsAppItem {
  id: string;
  conversa_id: string;
  origem: OrigemMensagemItem;
  tipo: string;
  conteudo: string;
  anexo_url: string | null;
  lida: boolean;
  enviado_em: string;
  criado_em: string;
}

export interface ConversaWhatsAppItem {
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
  consentimento_lgpd: string | null;
  primeiro_mensagem_em: string;
  ultima_mensagem_em: string;
  criado_em: string;
  atualizado_em: string;
  mensagens: MensagemWhatsAppItem[];
  cliente?: {
    id: string;
    nome: string | null;
    telefone: string | null;
    finalidade_principal: FinalidadeCliente;
    status: StatusRelacionamento;
  } | null;
}

// ---- Pós-atendimento / Inteligência / LGPD (camadas 5.2–5.6) ----

export type SentimentoWhatsAppItem = "satisfeito" | "neutro" | "irritado";

export interface AnaliseConversaWhatsAppItem {
  conversaId: string;
  sentimento: SentimentoWhatsAppItem;
  resumo: string;
  proximaAcao: string | null;
}

export interface GatilhoFollowUpItem {
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

export interface TarefaFollowUpCriadaItem {
  gatilhoId: string;
  gatilhoNome: string;
  clienteId: string;
  clienteNome: string | null;
  conversaId: string;
  tarefaId: string;
  titulo: string;
  prazoEm: string;
}

export interface PesquisaNpsItem {
  id: string;
  conversa_id: string;
  cliente_id: string | null;
  cliente_nome: string | null;
  etapa: string;
  status: "pendente" | "respondida";
  nota: number | null;
  comentario: string | null;
  enviada_em: string;
  respondida_em: string | null;
}

export interface RegistroAcessoWhatsAppItem {
  id: string;
  conversa_id: string;
  cliente: string;
  usuario: string;
  acao: string;
  em: string;
}

export interface DuplicidadeWhatsAppItem {
  numero: string;
  mesmosCorretores: boolean;
  conversas: {
    id: string;
    corretor: string | null;
    nomeCliente: string | null;
    clienteId: string | null;
    ultimaMensagemEm: string;
  }[];
}

export interface RelatorioGestorWhatsAppItem {
  geradoEm: string;
  totalConversas: number;
  totalMensagens: number;
  espelhadas: number;
  semMatch: number;
  semResposta: {
    conversaId: string;
    nomeCliente: string | null;
    numero: string;
    corretor: string | null;
    etapa: string | null;
    ultimaMensagem: string | null;
    vencidoAposHoras: number;
  }[];
  escalonadas: {
    conversaId: string;
    nomeCliente: string | null;
    corretor: string | null;
    numero: string;
    ultimaMensagem: string;
    motivo: string;
  }[];
  porCorretor: {
    corretor: string;
    conversas: number;
    mensagens: number;
    recebidas: number;
    enviadas: number;
    semResposta: number;
    tempoMedioRespostaMin: number | null;
    npsPendentes: number;
  }[];
  porEtapa: { etapa: string; conversas: number }[];
  porEmpreendimento: { empreendimento: string | null; conversas: number }[];
  horariosPico: { hora: string; total: number }[];
  sentimento: Record<SentimentoWhatsAppItem, number>;
  duplicidades: DuplicidadeWhatsAppItem[];
  nps: {
    media: number | null;
    total: number;
    respondidas: number;
    pendentes: number;
  };
}

