// =====================================================
// PORT – Input (Driving) Side
// Interfaces for all use-case contracts.
// GraphQL resolvers and REST handlers call these.
// =====================================================

import {
  Cliente,
  Pessoa,
  Interacao,
  Tarefa,
  Handoff,
  Oportunidade,
  DashboardStats,
  FiltrosCliente,
  ResultadoClassificacao,
  ConexaoWhatsApp,
  ConversaWhatsApp,
  MensagemWhatsApp,
  WhatsAppMetrics,
  RelatorioGestorWhatsApp,
  TarefaFollowUpCriada,
  PesquisaNps,
  RegistroAcessoWhatsApp,
} from "../../domain/entities/types";

// --- Listagens e consultas ---

export interface IListarClientesUseCase {
  execute(filtros?: FiltrosCliente): Promise<Cliente[]>;
}

export interface IObterClienteUseCase {
  execute(id: string): Promise<Cliente | null>;
}

export interface IListarTarefasUseCase {
  execute(): Promise<Tarefa[]>;
}

export interface IListarHandoffsUseCase {
  execute(): Promise<Handoff[]>;
}

export interface IListarOportunidadesUseCase {
  execute(): Promise<Oportunidade[]>;
}

export interface IObterStatsUseCase {
  execute(): Promise<DashboardStats>;
}

// --- Criação ---

export interface ICriarClienteInput {
  pessoa: {
    nome?: string | null;
    telefone?: string | null;
    email?: string | null;
    documento?: string | null;
    origem?: string | null;
    finalidadeDeclarada?: string | null;
    observacoes?: string | null;
  };
  cliente: {
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
  };
}

export interface ICriarClienteUseCase {
  execute(input: ICriarClienteInput): Promise<Cliente>;
}

export interface ICriarInteracaoInput {
  clienteId: string;
  tipo: string;
  canal?: string | null;
  descricao: string;
  resultado?: string | null;
  criadoPor?: string | null;
  ocorreuEm?: string | null;
}

export interface ICriarInteracaoUseCase {
  execute(input: ICriarInteracaoInput): Promise<Interacao>;
}

export interface ICriarTarefaInput {
  clienteId: string;
  titulo: string;
  descricao?: string | null;
  prioridade?: number | null;
  responsavelId?: string | null;
  prazoEm?: string | null;
}

export interface ICriarTarefaUseCase {
  execute(input: ICriarTarefaInput): Promise<Tarefa>;
}

export interface ICriarHandoffInput {
  clienteId: string;
  responsavelOrigem?: string | null;
  responsavelDestino?: string | null;
  motivo?: string | null;
  resumo?: string | null;
  pendencias?: string[];
  expectativaCliente?: string | null;
}

export interface ICriarHandoffUseCase {
  execute(input: ICriarHandoffInput): Promise<Handoff>;
}

export interface ICriarOportunidadeInput {
  clienteId: string;
  tipo: string;
  descricao: string;
  valorEstimado?: number | null;
  prioridade?: number | null;
  evidencia?: string | null;
  criadoPor?: string | null;
  responsavelId?: string | null;
  prazoEm?: string | null;
  proximoPasso?: string | null;
}

export interface ICriarOportunidadeUseCase {
  execute(input: ICriarOportunidadeInput): Promise<Oportunidade>;
}

// --- Atualização ---

export interface IAtualizarTarefaInput {
  id: string;
  status?: string | null;
  titulo?: string | null;
  descricao?: string | null;
  prioridade?: number | null;
  prazoEm?: string | null;
}

export interface IAtualizarTarefaUseCase {
  execute(input: IAtualizarTarefaInput): Promise<Tarefa | null>;
}

export interface IAtualizarHandoffInput {
  id: string;
  status?: string | null;
  resumo?: string | null;
  pendencias?: string[];
  expectativaCliente?: string | null;
  responsavelDestino?: string | null;
}

export interface IAtualizarHandoffUseCase {
  execute(input: IAtualizarHandoffInput): Promise<Handoff | null>;
}

export interface IAtualizarOportunidadeInput {
  id: string;
  status?: string | null;
  descricao?: string | null;
  valorEstimado?: number | null;
  prioridade?: number | null;
  evidencia?: string | null;
  responsavelId?: string | null;
  prazoEm?: string | null;
  proximoPasso?: string | null;
  motivoPerda?: string | null;
}

export interface IAtualizarOportunidadeUseCase {
  execute(input: IAtualizarOportunidadeInput): Promise<Oportunidade | null>;
}

// --- Classificação ---

export interface IClassificarClienteUseCase {
  execute(clienteId: string): Promise<ResultadoClassificacao>;
}

// --- WhatsApp (Espelhamento) ---

export interface IListarConversasWhatsAppUseCase {
  execute(): Promise<ConversaWhatsApp[]>;
}

export interface IListarConexoesWhatsAppUseCase {
  execute(): Promise<ConexaoWhatsApp[]>;
}

export interface ICriarConexaoWhatsAppInput {
  corretor: string;
  numero: string;
}

export interface ICriarConexaoWhatsAppUseCase {
  execute(input: ICriarConexaoWhatsAppInput): Promise<ConexaoWhatsApp>;
}

export interface IConectarConexaoWhatsAppUseCase {
  execute(id: string): Promise<ConexaoWhatsApp | null>;
}

export interface IConfirmarConexaoWhatsAppUseCase {
  execute(id: string): Promise<ConexaoWhatsApp | null>;
}

export interface IDesconectarConexaoWhatsAppUseCase {
  execute(id: string): Promise<ConexaoWhatsApp | null>;
}

export interface IAtualizarConexaoWhatsAppInput {
  id: string;
  status?: string | null;
  qr_code?: string | null;
  qr_expira_em?: string | null;
}

export interface IAtualizarConexaoWhatsAppUseCase {
  execute(input: IAtualizarConexaoWhatsAppInput): Promise<ConexaoWhatsApp | null>;
}

export interface IVincularConversaWhatsAppInput {
  conversaId: string;
  clienteId: string;
}

export interface IVincularConversaWhatsAppUseCase {
  execute(input: IVincularConversaWhatsAppInput): Promise<ConversaWhatsApp | null>;
}

export interface IAtualizarEspelhamentoWhatsAppInput {
  conversaId: string;
  espelhando: boolean;
  privadaMotivo?: string | null;
}

export interface IAtualizarEspelhamentoWhatsAppUseCase {
  execute(input: IAtualizarEspelhamentoWhatsAppInput): Promise<ConversaWhatsApp | null>;
}

export interface IReceberMensagemWhatsAppInput {
  sessaoId: string;
  numero: string;
  origem: string;
  conteudo: string;
  nomeContato?: string | null;
  tipo?: string | null;
  enviadoEm?: string | null;
}

export interface IReceberMensagemWhatsAppResult {
  conversa: ConversaWhatsApp;
  mensagem: MensagemWhatsApp;
  matchCliente: boolean;
  registradoNoCrm: boolean;
  escalonadoParaGestor: { motivo: string } | null;
  npsRespondido?: { nota: number } | null;
}

export interface IReceberMensagemWhatsAppUseCase {
  execute(input: IReceberMensagemWhatsAppInput): Promise<IReceberMensagemWhatsAppResult>;
}

export interface IResponderMensagemWhatsAppInput {
  conversaId: string;
  conteudo: string;
}

export interface IResponderMensagemWhatsAppResult {
  conversa: ConversaWhatsApp;
  mensagem: MensagemWhatsApp;
  enviadoViaEvolution: boolean;
  registradoNoCrm: boolean;
}

export interface IResponderMensagemWhatsAppUseCase {
  execute(input: IResponderMensagemWhatsAppInput): Promise<IResponderMensagemWhatsAppResult>;
}

export interface IObterMetricasWhatsAppUseCase {
  execute(): Promise<WhatsAppMetrics>;
}

// --- Relatório do gestor (5.3) ---

export interface IObterRelatorioGestorWhatsAppUseCase {
  execute(): Promise<RelatorioGestorWhatsApp>;
}

// --- Follow-up automático (5.4) ---

export interface IAplicarFollowUpsWhatsAppInput {
  etapa?: string | null;
}

export interface IAplicarFollowUpsWhatsAppResult {
  gatilhosAplicados: number;
  tarefasCriadas: TarefaFollowUpCriada[];
  npsDisparadas: number;
}

export interface IAplicarFollowUpsWhatsAppUseCase {
  execute(input?: IAplicarFollowUpsWhatsAppInput): Promise<IAplicarFollowUpsWhatsAppResult>;
}

// --- NPS (5.4) ---

export interface IDispararNpsWhatsAppInput {
  conversaId: string;
}

export interface IDispararNpsWhatsAppUseCase {
  execute(input: IDispararNpsWhatsAppInput): Promise<PesquisaNps | null>;
}

export interface IListarNpsWhatsAppUseCase {
  execute(): Promise<PesquisaNps[]>;
}

export interface IResponderNpsWhatsAppInput {
  id: string;
  nota: number;
  comentario?: string | null;
}

export interface IResponderNpsWhatsAppUseCase {
  execute(input: IResponderNpsWhatsAppInput): Promise<PesquisaNps | null>;
}

// --- Exportação e auditoria LGPD (5.6) ---

export interface IExportarHistoricoWhatsAppInput {
  conversaId?: string | null;
  formato?: string | null;
}

export interface IExportarHistoricoWhatsAppResult {
  formato: "json" | "csv";
  nomeArquivo: string;
  conteudo: string;
}

export interface IExportarHistoricoWhatsAppUseCase {
  execute(input?: IExportarHistoricoWhatsAppInput): Promise<IExportarHistoricoWhatsAppResult>;
}

export interface IObterLogAcessosWhatsAppUseCase {
  execute(): Promise<RegistroAcessoWhatsApp[]>;
}

export interface IExcluirConversaWhatsAppUseCase {
  execute(conversaId: string): Promise<boolean>;
}
