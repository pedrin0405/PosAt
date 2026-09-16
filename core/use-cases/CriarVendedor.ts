import { IVendedorRepository } from "../ports/out/repositories";
import {
  ICriarVendedorUseCase,
  ICriarVendedorInput,
} from "../ports/in/use-cases";
import { Vendedor, OrigemPessoa } from "../domain/entities/types";

export class CriarVendedorUseCase implements ICriarVendedorUseCase {
  constructor(private readonly vendedorRepo: IVendedorRepository) {}

  async execute(input: ICriarVendedorInput): Promise<Vendedor> {
    return this.vendedorRepo.create({
      nome: input.nome,
      telefone: input.telefone ?? null,
      email: input.email ?? null,
      documento_cpf: input.documentoCpf ?? null,
      creci: input.creci ?? null,
      origem: (input.origem as OrigemPessoa) || "manual",
    });
  }
}