import { IWhatsAppRepository } from "../ports/out/repositories";
import { IObterLogAcessosWhatsAppUseCase } from "../ports/in/use-cases";
import { RegistroAcessoWhatsApp } from "../domain/entities/types";

// LGPD (5.6): log de quem acessou/leu/exportou o histórico das conversas.
export class ObterLogAcessosWhatsAppUseCase implements IObterLogAcessosWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(): Promise<RegistroAcessoWhatsApp[]> {
    return this.whatsappRepo.listarAcessos();
  }
}