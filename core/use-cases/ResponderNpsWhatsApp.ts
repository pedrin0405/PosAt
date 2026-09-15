import { IWhatsAppRepository } from "../ports/out/repositories";
import {
  IResponderNpsWhatsAppInput,
  IResponderNpsWhatsAppUseCase,
} from "../ports/in/use-cases";
import { PesquisaNps } from "../domain/entities/types";

// Registra a resposta do cliente à pesquisa NPS (usado pelo simulador e rotas).
export class ResponderNpsWhatsAppUseCase implements IResponderNpsWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(input: IResponderNpsWhatsAppInput): Promise<PesquisaNps | null> {
    const nota = Number(input.nota);
    if (!Number.isInteger(nota) || nota < 0 || nota > 10) {
      throw new Error("Nota NPS deve ser um inteiro entre 0 e 10.");
    }
    const atualizada = await this.whatsappRepo.responderNps(
      input.id,
      nota,
      input.comentario
    );
    if (!atualizada) return null;

    await this.whatsappRepo.registrarAcesso({
      conversa_id: atualizada.conversa_id,
      cliente: atualizada.cliente_nome || "-",
      usuario: "cliente",
      acao: `nps_respondido_${nota}`,
    });
    return atualizada;
  }
}