import { IWhatsAppRepository, ITarefaRepository } from "../ports/out/repositories";
import {
  IAplicarFollowUpsWhatsAppInput,
  IAplicarFollowUpsWhatsAppResult,
  IAplicarFollowUpsWhatsAppUseCase,
} from "../ports/in/use-cases";
import { TarefaFollowUpCriada } from "../domain/entities/types";
import { GATILHOS_FOLLOW_UP, marcadorFollowUp } from "@/lib/whatsapp";

// Pós-atendimento (5.4): gatilhos automáticos criam tarefas de retorno após
// cada etapa-chave (visita, proposta, assinatura, entrega) e disparam NPS.
export class AplicarFollowUpsWhatsAppUseCase implements IAplicarFollowUpsWhatsAppUseCase {
  constructor(
    private readonly whatsappRepo: IWhatsAppRepository,
    private readonly tarefaRepo: ITarefaRepository
  ) {}

  async execute(
    input?: IAplicarFollowUpsWhatsAppInput
  ): Promise<IAplicarFollowUpsWhatsAppResult> {
    const conversas = await this.whatsappRepo.listarConversas();
    const tarefasExistentes = await this.tarefaRepo.findAll();
    const npsExistentes = await this.whatsappRepo.listarNps();

    const tarefasCriadas: TarefaFollowUpCriada[] = [];
    let npsDisparadas = 0;

    for (const gatilho of GATILHOS_FOLLOW_UP.filter((g) => g.ativo)) {
      if (input?.etapa && gatilho.etapa !== input.etapa) continue;
      const alvo = conversas.filter(
        (c) => c.espelhando && c.cliente_id && c.etapa === gatilho.etapa
      );

      for (const conversa of alvo) {
        const marcador = marcadorFollowUp(gatilho.id);
        const jaTemTarefa = tarefasExistentes.some(
          (t) =>
            t.cliente_id === conversa.cliente_id && t.descricao?.includes(marcador)
        );
        if (jaTemTarefa) continue;

        const prazoEm = new Date(
          Date.now() + gatilho.prazoDias * 86400000
        ).toISOString();
        const tarefa = await this.tarefaRepo.create({
          cliente_id: conversa.cliente_id as string,
          titulo: gatilho.tituloTarefa,
          descricao: `${gatilho.descricaoTarefa} ${marcador}`,
          status: "pendente",
          prioridade: 2,
          responsavel_id: gatilho.responsavelPadrao,
          prazo_em: prazoEm,
        });

        tarefasCriadas.push({
          gatilhoId: gatilho.id,
          gatilhoNome: gatilho.nome,
          clienteId: conversa.cliente_id as string,
          clienteNome: conversa.nome_cliente,
          conversaId: conversa.id,
          tarefaId: tarefa.id,
          titulo: tarefa.titulo,
          prazoEm,
        });

        if (gatilho.disparaNps) {
          const jaTemNpsPendente = npsExistentes.some(
            (n) => n.conversa_id === conversa.id && n.status === "pendente"
          );
          if (!jaTemNpsPendente) {
            await this.whatsappRepo.criarNps({
              conversa_id: conversa.id,
              cliente_id: conversa.cliente_id as string,
              cliente_nome: conversa.nome_cliente,
              etapa: gatilho.etapa,
              status: "pendente",
              enviada_em: new Date().toISOString(),
            });
            npsDisparadas += 1;
          }
        }
      }
    }

    return {
      gatilhosAplicados: 4,
      tarefasCriadas,
      npsDisparadas,
    };
  }
}