// =====================================================
// PORT – Output (Driven) Side
// Interfaces that define what the application
// needs from external systems (DB, APIs, etc.)
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
  ConexaoWhatsApp,
  ConversaWhatsApp,
  MensagemWhatsApp,
  WhatsAppMetrics,
  PesquisaNps,
  RegistroAcessoWhatsApp,
} from "../../domain/entities/types";

// --- Pessoa Repository ---

export interface IPessoaRepository {
  findAll(): Promise<Pessoa[]>;
  findById(id: string): Promise<Pessoa | null>;
  create(data: Partial<Pessoa>): Promise<Pessoa>;
  update(id: string, data: Partial<Pessoa>): Promise<Pessoa | null>;
}

// --- Cliente Repository ---

export interface IClienteRepository {
  findAll(filtros?: FiltrosCliente): Promise<Cliente[]>;
  findById(id: string): Promise<Cliente | null>;
  create(data: Partial<Cliente>): Promise<Cliente>;
  update(id: string, data: Partial<Cliente>): Promise<Cliente | null>;
  getStats(): Promise<DashboardStats>;
}

// --- Interacao Repository ---

export interface IInteracaoRepository {
  findAll(clienteId?: string): Promise<Interacao[]>;
  findById(id: string): Promise<Interacao | null>;
  create(data: Partial<Interacao>): Promise<Interacao>;
}

// --- Tarefa Repository ---

export interface ITarefaRepository {
  findAll(): Promise<Tarefa[]>;
  findById(id: string): Promise<Tarefa | null>;
  create(data: Partial<Tarefa>): Promise<Tarefa>;
  update(id: string, data: Partial<Tarefa>): Promise<Tarefa | null>;
}

// --- Handoff Repository ---

export interface IHandoffRepository {
  findAll(): Promise<Handoff[]>;
  findById(id: string): Promise<Handoff | null>;
  create(data: Partial<Handoff>): Promise<Handoff>;
  update(id: string, data: Partial<Handoff>): Promise<Handoff | null>;
}

// --- Oportunidade Repository ---

export interface IOportunidadeRepository {
  findAll(): Promise<Oportunidade[]>;
  findById(id: string): Promise<Oportunidade | null>;
  create(data: Partial<Oportunidade>): Promise<Oportunidade>;
  update(id: string, data: Partial<Oportunidade>): Promise<Oportunidade | null>;
}

// --- WhatsApp Repository ---

export interface IWhatsAppRepository {
  listarConexoes(): Promise<ConexaoWhatsApp[]>;
  criarConexao(dados: Partial<ConexaoWhatsApp>): Promise<ConexaoWhatsApp>;
  atualizarConexao(
    id: string,
    data: Partial<ConexaoWhatsApp>
  ): Promise<ConexaoWhatsApp | null>;
  listarConversas(): Promise<ConversaWhatsApp[]>;
  buscarConversaPorId(id: string): Promise<ConversaWhatsApp | null>;
  buscarConversaPorNumero(
    conexaoId: string,
    numero: string
  ): Promise<ConversaWhatsApp | null>;
  criarConversa(data: Partial<ConversaWhatsApp>): Promise<ConversaWhatsApp>;
  atualizarConversa(
    id: string,
    data: Partial<ConversaWhatsApp>
  ): Promise<ConversaWhatsApp | null>;
  adicionarMensagem(
    conversaId: string,
    data: Partial<MensagemWhatsApp>
  ): Promise<MensagemWhatsApp | null>;
  buscarClientePorTelefone(numero: string): Promise<Cliente | null>;
  obterMetricas(): Promise<WhatsAppMetrics>;
  // NPS / follow-up / LGPD (camadas 5.3–5.6)
  listarNps(): Promise<PesquisaNps[]>;
  criarNps(dados: Partial<PesquisaNps>): Promise<PesquisaNps>;
  responderNps(
    id: string,
    nota: number,
    comentario?: string | null
  ): Promise<PesquisaNps | null>;
  registrarAcesso(dados: Partial<RegistroAcessoWhatsApp>): Promise<RegistroAcessoWhatsApp>;
  listarAcessos(): Promise<RegistroAcessoWhatsApp[]>;
  deletarConversa(id: string): Promise<boolean>;
}
