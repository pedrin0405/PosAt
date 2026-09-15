import { IWhatsAppRepository } from "../ports/out/repositories";
import { IDesconectarConexaoWhatsAppUseCase } from "../ports/in/use-cases";
import { ConexaoWhatsApp } from "../domain/entities/types";

export class DesconectarConexaoWhatsAppUseCase implements IDesconectarConexaoWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(id: string): Promise<ConexaoWhatsApp | null> {
    return this.whatsappRepo.atualizarConexao(id, {
      status: "desconectado",
      qr_code: null,
      qr_expira_em: null,
    });
  }
}