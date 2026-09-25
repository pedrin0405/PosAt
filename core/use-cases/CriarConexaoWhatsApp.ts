import { IWhatsAppRepository } from "../ports/out/repositories";
import {
  ICriarConexaoWhatsAppInput,
  ICriarConexaoWhatsAppUseCase,
} from "../ports/in/use-cases";
import { ConexaoWhatsApp } from "../domain/entities/types";
import {
  criarSessaoWaha,
  gerarNomeSessao,
} from "@/lib/waha";

export class CriarConexaoWhatsAppUseCase
  implements ICriarConexaoWhatsAppUseCase
{
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(
    input: ICriarConexaoWhatsAppInput
  ): Promise<ConexaoWhatsApp> {
    const sessaoId = gerarNomeSessao(input.corretor);

    const webhookUrl =
      process.env.WAHA_WEBHOOK_URL ||
      "http://host.docker.internal:3000/api/whatsapp/webhook";

    const instancia = await criarSessaoWaha(
      sessaoId,
      webhookUrl
    );

    return this.whatsappRepo.criarConexao({
      corretor: input.corretor,
      numero: input.numero,
      sessao_id: instancia.name,
      status: "desconectado",
      qr_code: null,
      qr_expira_em: null,
    });
  }
}