import { IWhatsAppRepository } from "../ports/out/repositories";
import { IConectarConexaoWhatsAppUseCase } from "../ports/in/use-cases";
import { ConexaoWhatsApp } from "../domain/entities/types";
import { gerarChaveQr } from "@/lib/evolution";

// BETA: inicia a conexão — gera o QR code (como a Evolution devolve na
// resposta) e marca a conexão como "conectando" aguardando o scan.
export class ConectarConexaoWhatsAppUseCase implements IConectarConexaoWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(id: string): Promise<ConexaoWhatsApp | null> {
    const conexao = await this.whatsappRepo.listarConexoes().then(
      (todas) => todas.find((c) => c.id === id) || null
    );
    if (!conexao) return null;

    const qr = gerarChaveQr(conexao.sessao_id || id);
    return this.whatsappRepo.atualizarConexao(id, {
      status: "conectando",
      qr_code: qr,
      qr_expira_em: new Date(Date.now() + 2 * 60000).toISOString(),
    });
  }
}