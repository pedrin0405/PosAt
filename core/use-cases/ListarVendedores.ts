import { IVendedorRepository } from "../ports/out/repositories";
import { IListarVendedoresUseCase } from "../ports/in/use-cases";
import { Vendedor } from "../domain/entities/types";

export class ListarVendedoresUseCase implements IListarVendedoresUseCase {
  constructor(private readonly vendedorRepo: IVendedorRepository) {}

  async execute(): Promise<Vendedor[]> {
    return this.vendedorRepo.findAll();
  }
}