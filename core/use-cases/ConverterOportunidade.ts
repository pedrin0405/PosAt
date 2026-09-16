import {
  IOportunidadeRepository,
  IPessoaRepository,
  IClienteRepository,
  ITarefaRepository,
  IHistoricoOportunidadeRepository,
} from "../ports/out/repositories";
import {
  IConverterOportunidadeUseCase,
  IConverterOportunidadeInput,
  IConverterOportunidadeResult,
} from "../ports/in/use-cases";
import {
  Cliente,
  OrigemPessoa,
} from "../domain/entities/types";
import { normalizarTelefone } from "@/lib/whatsapp";

const STATUS_IMPEDIDOS = new Set(["removida", "convertida", "encerrada"]);

export class ConverterOportunidadeUseCase implements IConverterOportunidadeUseCase {
  constructor(
    private readonly oportunidadeRepo: IOportunidadeRepository,
    private readonly pessoaRepo: IPessoaRepository,
    private readonly clienteRepo: IClienteRepository,
    private readonly tarefaRepo: ITarefaRepository,
    private readonly historicoRepo: IHistoricoOportunidadeRepository
  ) {}

  async execute(input: IConverterOportunidadeInput): Promise<IConverterOportunidadeResult> {
    const atual = await this.oportunidadeRepo.findById(input.id);
    if (!atual) throw new Error("Oportunidade não encontrada.");
    if (STATUS_IMPEDIDOS.has(atual.status)) {
      throw new Error(`Oportunidade no estado "${atual.status}" não pode ser convertida.`);
    }

    const nome = input.nome ?? atual.cliente?.nome ?? "Lead";
    const telefone = input.telefone ?? atual.cliente?.telefone ?? null;
    const email = input.email ?? atual.cliente?.email ?? null;
    const documento = input.documento ?? null;

    // Deduplicação por telefone/e-mail/documento na base existente.
    const todos = await this.clienteRepo.findAll();
    const telBusca = telefone ? normalizarTelefone(telefone) : "";
    const docBusca = documento ? documento.replace(/\D/g, "") : "";
    const emailBusca = email ? email.trim().toLowerCase() : "";

    const existente =
      todos.find((c) => {
        const pessoa = c.pessoa;
        if (telBusca && pessoa?.telefone && normalizarTelefone(pessoa.telefone) === telBusca) {
          return true;
        }
        const pEmail = pessoa?.email?.trim().toLowerCase() || "";
        if (emailBusca && pEmail === emailBusca) return true;
        const pDoc = pessoa?.documento ? pessoa.documento.replace(/\D/g, "") : "";
        if (docBusca && pDoc === docBusca) return true;
        return false;
      }) || null;

    let lead: Cliente;
    const duplicado = Boolean(existente);

    if (existente) {
      lead = existente;
    } else {
      const pessoa = await this.pessoaRepo.create({
        nome,
        telefone,
        email,
        documento,
        origem: (atual.origem as OrigemPessoa) || "manual",
        dados_originais: {
          observacoes: `Convertido da oportunidade ${atual.id} — ${atual.descricao}`,
          regraGeradora: atual.regra_geradora,
        },
      });

      lead = await this.clienteRepo.create({
        pessoa_id: pessoa.id,
        status: "novo_lead",
        finalidade_principal: "nao_identificado",
        finalidades_secundarias: [],
        regiao_interesse: atual.imovel?.regiao ?? null,
        cidade_interesse: atual.imovel?.cidade ?? null,
        bairro_interesse: atual.imovel?.bairro ?? null,
        tipo_imovel: atual.imovel?.codigo_imovel ?? null,
        e_investidor_confirmado: false,
        indice_completude: nome ? 40 : 0,
        nivel_confianca: "baixa",
        campos_faltantes: ["finalidade_principal", "tipo_imovel", "forma_pagamento"],
        sinais_classificacao: [`Convertido da oportunidade (regra ${atual.regra_geradora})`],
        proxima_acao: "Realizar primeiro contato e colher perfil de compra.",
        responsavel_id: atual.vendedor_id ?? atual.responsavel_id ?? null,
      });
    }

    // Tarefa de primeiro contato do novo lead.
    const tarefa = await this.tarefaRepo.create({
      cliente_id: lead.id,
      titulo: `Primeiro contato — ${nome}`,
      descricao: `Abordagem do lead convertido da oportunidade "${atual.descricao}".`,
      status: "pendente",
      prioridade: 2,
      responsavel_id: atual.vendedor_id ?? atual.responsavel_id ?? null,
      prazo_em: new Date(Date.now() + 3 * 86400000).toISOString(),
    });

    const tags = Array.from(new Set([...(atual.tags || []), "Convertido"]));

    const oportunidade = await this.oportunidadeRepo.update(input.id, {
      status: "convertida",
      convertida_em: new Date().toISOString(),
      tags,
      lead_criado_id: duplicado ? null : lead.id,
      lead_duplicado_id: duplicado ? lead.id : null,
      tarefa_primeiro_contato_id: tarefa.id,
    });

    if (!oportunidade) throw new Error("Falha ao atualizar a oportunidade.");

    await this.historicoRepo.create({
      oportunidade_id: input.id,
      acao: "convertida",
      de: atual.status,
      para: "convertida",
      observacao: duplicado
        ? "Lead deduplicado com cadastro existente na base."
        : `Lead criado na base com tarefa de primeiro contato.${tarefa.id ? ` (tarefa ${tarefa.id})` : ""}`,
      criado_por: input.usuario ?? null,
    });

    return { oportunidade, lead, duplicado, tarefa };
  }
}