import { IHistoricoOportunidadeRepository } from "../ports/out/repositories";
import { IListarHistoricoOportunidadesUseCase } from "../ports/in/use-cases";
import { HistoricoOportunidade } from "../domain/entities/types";

export class ListarHistoricoOportunidadesUseCase
  implements IListarHistoricoOportunidadesUseCase
{
  constructor(private readonly historicoRepo: IHistoricoOportunidadeRepository) {}

  async execute(oportunidadeId?: string): Promise<HistoricoOportunidade[]> {
    return this.historicoRepo.findAll(oportunidadeId);
  }
}