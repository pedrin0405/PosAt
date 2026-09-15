import { IWhatsAppRepository } from "../ports/out/repositories";
import { IExcluirConversaWhatsAppUseCase } from "../ports/in/use-cases";

// LGPD (5.6): direito de exclusão — apaga a conversa e todas as referências
// (mensagens, interações espelhadas e pesquisas NPS vinculadas).
export class ExcluirConversaWhatsAppUseCase implements IExcluirConversaWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(conversaId: string): Promise<boolean> {
    const conversa = await this.whatsappRepo.buscarConversaPorId(conversaId);
    if (!conversa) return false;

    const removida = await this.whatsappRepo.deletarConversa(conversaId);
    if (removida) {
      await this.whatsappRepo.registrarAcesso({
        conversa_id: conversaId,
        cliente: conversa.nome_cliente || conversa.numero_cliente,
        usuario: "gestor",
        acao: "exclusao_lgpd",
      });
    }
    return removida;
  }
}