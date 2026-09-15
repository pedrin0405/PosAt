import { IWhatsAppRepository } from "../ports/out/repositories";
import {
  IAtualizarConexaoWhatsAppInput,
  IAtualizarConexaoWhatsAppUseCase,
} from "../ports/in/use-cases";
import { ConexaoWhatsApp, StatusConexaoWhatsApp } from "../domain/entities/types";

export class AtualizarConexaoWhatsAppUseCase implements IAtualizarConexaoWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(
    input: IAtualizarConexaoWhatsAppInput
  ): Promise<ConexaoWhatsApp | null> {
    const status = (input.status as StatusConexaoWhatsApp) || undefined;
    return this.whatsappRepo.atualizarConexao(input.id, {
      status,
      qr_code: input.qr_code ?? null,
      qr_expira_em: input.qr_expira_em ?? null,
    });
  }
}