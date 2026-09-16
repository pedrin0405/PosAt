import {
  IOportunidadeRepository,
  IHistoricoOportunidadeRepository,
} from "../ports/out/repositories";
import {
  IRemoverOportunidadeUseCase,
  IRemoverOportunidadeInput,
} from "../ports/in/use-cases";
import { Oportunidade } from "../domain/entities/types";

export class RemoverOportunidadeUseCase implements IRemoverOportunidadeUseCase {
  constructor(
    private readonly oportunidadeRepo: IOportunidadeRepository,
    private readonly historicoRepo: IHistoricoOportunidadeRepository
  ) {}

  async execute(input: IRemoverOportunidadeInput): Promise<Oportunidade | null> {
    const atual = await this.oportunidadeRepo.findById(input.id);
    if (!atual) return null;
    if (atual.status === "removida") return atual;

    const tags = Array.from(new Set([...(atual.tags || []), "Removido"]));

    const atualizada = await this.oportunidadeRepo.update(input.id, {
      status: "removida",
      removida_motivo: input.motivo,
      tags,
    });

    if (!atualizada) return null;

    await this.historicoRepo.create({
      oportunidade_id: input.id,
      acao: "removida",
      de: atual.status,
      para: "removida",
      observacao: input.motivo,
      criado_por: input.usuario ?? null,
    });

    return atualizada;
  }
}