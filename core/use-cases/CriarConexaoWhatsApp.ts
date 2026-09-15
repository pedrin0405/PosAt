import { IWhatsAppRepository } from "../ports/out/repositories";
import {
  ICriarConexaoWhatsAppInput,
  ICriarConexaoWhatsAppUseCase,
} from "../ports/in/use-cases";
import { ConexaoWhatsApp } from "../domain/entities/types";
import { simularCriarInstancia } from "@/lib/evolution";

// BETA: cria a instância do corretor na Evolution API e registra a conexão.
export class CriarConexaoWhatsAppUseCase implements ICriarConexaoWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(input: ICriarConexaoWhatsAppInput): Promise<ConexaoWhatsApp> {
    const instancia = await simularCriarInstancia({
      corretor: input.corretor,
      numero: input.numero,
    });
    return this.whatsappRepo.criarConexao({
      corretor: input.corretor,
      numero: input.numero,
      sessao_id: instancia.instanceName,
      status: "desconectado",
      qr_code: null,
      qr_expira_em: null,
    });
  }
}