import { IWhatsAppRepository } from "../ports/out/repositories";
import {
  IAtualizarEspelhamentoWhatsAppInput,
  IAtualizarEspelhamentoWhatsAppUseCase,
} from "../ports/in/use-cases";
import { ConversaWhatsApp } from "../domain/entities/types";

// Modo "não espelhar" (privacidade/LGPD): conversas pessoais ficam fora do CRM.
export class AtualizarEspelhamentoWhatsAppUseCase
  implements IAtualizarEspelhamentoWhatsAppUseCase
{
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(
    input: IAtualizarEspelhamentoWhatsAppInput
  ): Promise<ConversaWhatsApp | null> {
    const atualizada = await this.whatsappRepo.atualizarConversa(input.conversaId, {
      espelhando: input.espelhando,
      privada_motivo: input.espelhando ? null : (input.privadaMotivo ?? "Conversa pessoal"),
    });

    if (atualizada) {
      await this.whatsappRepo.registrarAcesso({
        conversa_id: atualizada.id,
        cliente: atualizada.nome_cliente || atualizada.numero_cliente,
        usuario: "corretor",
        acao: input.espelhando ? "espelhamento_ativado" : "espelhamento_desativado",
      });
    }

    return atualizada;
  }
}