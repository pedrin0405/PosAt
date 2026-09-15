import { IWhatsAppRepository } from "../ports/out/repositories";
import { IConfirmarConexaoWhatsAppUseCase } from "../ports/in/use-cases";
import { ConexaoWhatsApp } from "../domain/entities/types";

// BETA: após escanear o QR, confirma a sessão como conectada na instância.
export class ConfirmarConexaoWhatsAppUseCase implements IConfirmarConexaoWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(id: string): Promise<ConexaoWhatsApp | null> {
    return this.whatsappRepo.atualizarConexao(id, {
      status: "conectado",
      qr_code: null,
      qr_expira_em: null,
      ultimo_ping_em: new Date().toISOString(),
    });
  }
}