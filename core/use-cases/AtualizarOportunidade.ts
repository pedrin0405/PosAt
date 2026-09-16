import {
  IOportunidadeRepository,
  IHistoricoOportunidadeRepository,
} from "../ports/out/repositories";
import {
  IAtualizarOportunidadeUseCase,
  IAtualizarOportunidadeInput,
} from "../ports/in/use-cases";
import { Oportunidade } from "../domain/entities/types";

export class AtualizarOportunidadeUseCase implements IAtualizarOportunidadeUseCase {
  constructor(
    private readonly oportunidadeRepo: IOportunidadeRepository,
    private readonly historicoRepo: IHistoricoOportunidadeRepository
  ) {}

  async execute(input: IAtualizarOportunidadeInput): Promise<Oportunidade | null> {
    const atual = await this.oportunidadeRepo.findById(input.id);
    if (!atual) return null;

    const updates: Partial<Oportunidade> = {};

    if (input.status !== undefined && input.status !== null) {
      updates.status = input.status as Oportunidade["status"];
      if (input.status === "perdida" && input.motivoPerda) {
        updates.motivo_perda = input.motivoPerda;
      }
    }
    if (input.descricao !== undefined && input.descricao !== null) updates.descricao = input.descricao;
    if (input.valorEstimado !== undefined) updates.valor_estimado = input.valorEstimado;
    if (input.prioridade !== undefined && input.prioridade !== null)
      updates.prioridade = input.prioridade;
    if (input.evidencia !== undefined) updates.evidencia = input.evidencia;
    if (input.responsavelId !== undefined) updates.responsavel_id = input.responsavelId;
    if (input.prazoEm !== undefined) updates.prazo_em = input.prazoEm;
    if (input.proximoPasso !== undefined) updates.proximo_passo = input.proximoPasso;
    if (input.motivoPerda !== undefined) updates.motivo_perda = input.motivoPerda;
    if (input.vendedorId !== undefined) updates.vendedor_id = input.vendedorId;
    if (input.imovelId !== undefined) updates.imovel_id = input.imovelId;
    if (input.tags !== undefined) updates.tags = input.tags ?? [];
    if (input.regraGeradora !== undefined)
      updates.regra_geradora = (input.regraGeradora as Oportunidade["regra_geradora"]) || "outra";

    const atualizada = await this.oportunidadeRepo.update(input.id, updates);
    if (!atualizada) return null;

    if (input.status && input.status !== atual.status) {
      await this.historicoRepo.create({
        oportunidade_id: input.id,
        acao: "status_alterado",
        de: atual.status,
        para: input.status,
        observacao: `Status atualizado de "${atual.status}" para "${input.status}".`,
        criado_por: input.usuario ?? null,
      });
    }

    return atualizada;
  }
}