import { IImovelRepository } from "../ports/out/repositories";
import { IListarImoveisUseCase } from "../ports/in/use-cases";
import { Imovel } from "../domain/entities/types";

export class ListarImoveisUseCase implements IListarImoveisUseCase {
  constructor(private readonly imovelRepo: IImovelRepository) {}

  async execute(): Promise<Imovel[]> {
    return this.imovelRepo.findAll();
  }
}