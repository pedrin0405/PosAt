import { IVendedorRepository } from "../ports/out/repositories";
import { IObterVendedorUseCase } from "../ports/in/use-cases";
import { Vendedor } from "../domain/entities/types";

export class ObterVendedorUseCase implements IObterVendedorUseCase {
  constructor(private readonly vendedorRepo: IVendedorRepository) {}

  async execute(id: string): Promise<Vendedor | null> {
    return this.vendedorRepo.findById(id);
  }
}