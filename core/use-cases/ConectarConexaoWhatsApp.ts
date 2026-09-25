import { IWhatsAppRepository } from "../ports/out/repositories";
import { IConectarConexaoWhatsAppUseCase } from "../ports/in/use-cases";
import { ConexaoWhatsApp } from "../domain/entities/types";
import {
  iniciarSessaoWaha,
  obterQrCodeWaha,
} from "@/lib/waha";

export class ConectarConexaoWhatsAppUseCase
  implements IConectarConexaoWhatsAppUseCase
{
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(id: string): Promise<ConexaoWhatsApp | null> {
    const conexao = await this.whatsappRepo.listarConexoes().then(
      (todas) => todas.find((c) => c.id === id) || null
    );

    if (!conexao) return null;

    const sessaoId = conexao.sessao_id;

    if (!sessaoId) {
      throw new Error("A conexão não possui uma sessão WAHA.");
    }

    await iniciarSessaoWaha(sessaoId);

    const qr = await obterQrCodeWaha(sessaoId);

    return this.whatsappRepo.atualizarConexao(id, {
      status: "conectando",
      qr_code: `data:${qr.mimetype};base64,${qr.data}`,
      qr_expira_em: new Date(Date.now() + 2 * 60000).toISOString(),
    });
  }
}