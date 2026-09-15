import { IWhatsAppRepository } from "../ports/out/repositories";
import { IListarConexoesWhatsAppUseCase } from "../ports/in/use-cases";
import { ConexaoWhatsApp } from "../domain/entities/types";

export class ListarConexoesWhatsAppUseCase implements IListarConexoesWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(): Promise<ConexaoWhatsApp[]> {
    return this.whatsappRepo.listarConexoes();
  }
}