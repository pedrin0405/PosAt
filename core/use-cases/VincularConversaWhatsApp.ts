import { IWhatsAppRepository, IClienteRepository } from "../ports/out/repositories";
import {
  IVincularConversaWhatsAppInput,
  IVincularConversaWhatsAppUseCase,
} from "../ports/in/use-cases";
import { ConversaWhatsApp } from "../domain/entities/types";

// Reenvio manual quando o número não deu match: o corretor "empurra"
// a conversa para o atendimento certo no CRM.
export class VincularConversaWhatsAppUseCase implements IVincularConversaWhatsAppUseCase {
  constructor(
    private readonly whatsappRepo: IWhatsAppRepository,
    private readonly clienteRepo: IClienteRepository
  ) {}

  async execute(input: IVincularConversaWhatsAppInput): Promise<ConversaWhatsApp | null> {
    const conversa = await this.whatsappRepo.buscarConversaPorId(input.conversaId);
    if (!conversa) return null;

    const cliente = await this.clienteRepo.findById(input.clienteId);
    if (!cliente) return null;

    const atualizada = await this.whatsappRepo.atualizarConversa(conversa.id, {
      cliente_id: cliente.id,
      nome_cliente: cliente.pessoa?.nome || conversa.nome_cliente || "Cliente",
      consentimento_lgpd: conversa.consentimento_lgpd || new Date().toISOString(),
    });

    if (atualizada) {
      await this.whatsappRepo.registrarAcesso({
        conversa_id: conversa.id,
        cliente: atualizada.nome_cliente || atualizada.numero_cliente,
        usuario: "gestor",
        acao: "vinculo_manual",
      });
    }

    return atualizada;
  }
}