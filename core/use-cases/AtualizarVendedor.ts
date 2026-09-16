import { IVendedorRepository } from "../ports/out/repositories";
import {
  IAtualizarVendedorUseCase,
  IAtualizarVendedorInput,
} from "../ports/in/use-cases";
import { Vendedor } from "../domain/entities/types";

export class AtualizarVendedorUseCase implements IAtualizarVendedorUseCase {
  constructor(private readonly vendedorRepo: IVendedorRepository) {}

  async execute(input: IAtualizarVendedorInput): Promise<Vendedor | null> {
    const updates: Partial<Vendedor> = {};
    if (input.nome !== undefined && input.nome !== null) updates.nome = input.nome;
    if (input.telefone !== undefined) updates.telefone = input.telefone;
    if (input.email !== undefined) updates.email = input.email;
    if (input.documentoCpf !== undefined) updates.documento_cpf = input.documentoCpf;
    if (input.creci !== undefined) updates.creci = input.creci;
    if (input.status !== undefined && input.status !== null)
      updates.status = input.status as Vendedor["status"];

    return this.vendedorRepo.update(input.id, updates);
  }
}