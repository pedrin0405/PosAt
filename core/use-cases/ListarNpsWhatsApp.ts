import { IWhatsAppRepository } from "../ports/out/repositories";
import { IListarNpsWhatsAppUseCase } from "../ports/in/use-cases";
import { PesquisaNps } from "../domain/entities/types";

export class ListarNpsWhatsAppUseCase implements IListarNpsWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(): Promise<PesquisaNps[]> {
    return this.whatsappRepo.listarNps();
  }
}