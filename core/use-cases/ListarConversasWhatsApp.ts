import { IWhatsAppRepository } from "../ports/out/repositories";
import { IListarConversasWhatsAppUseCase } from "../ports/in/use-cases";
import { ConversaWhatsApp } from "../domain/entities/types";

export class ListarConversasWhatsAppUseCase implements IListarConversasWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(): Promise<ConversaWhatsApp[]> {
    return this.whatsappRepo.listarConversas();
  }
}