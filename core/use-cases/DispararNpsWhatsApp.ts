import { IWhatsAppRepository } from "../ports/out/repositories";
import {
  IDispararNpsWhatsAppInput,
  IDispararNpsWhatsAppUseCase,
} from "../ports/in/use-cases";
import { PesquisaNps } from "../domain/entities/types";

// Dispara uma pesquisa de satisfação (NPS) para uma conversa espelhada.
export class DispararNpsWhatsAppUseCase implements IDispararNpsWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(input: IDispararNpsWhatsAppInput): Promise<PesquisaNps | null> {
    const conversa = await this.whatsappRepo.buscarConversaPorId(input.conversaId);
    if (!conversa) return null;

    const npsPendente = (await this.whatsappRepo.listarNps()).find(
      (n) => n.conversa_id === input.conversaId && n.status === "pendente"
    );
    if (npsPendente) return npsPendente;

    const nps = await this.whatsappRepo.criarNps({
      conversa_id: conversa.id,
      cliente_id: conversa.cliente_id,
      cliente_nome: conversa.nome_cliente,
      etapa: conversa.etapa || "geral",
      status: "pendente",
      enviada_em: new Date().toISOString(),
    });

    await this.whatsappRepo.registrarAcesso({
      conversa_id: conversa.id,
      cliente: conversa.nome_cliente || conversa.numero_cliente,
      usuario: "gestor",
      acao: "nps_disparada",
    });

    return nps;
  }
}