import {
  IWhatsAppRepository,
  IInteracaoRepository,
  IClienteRepository,
} from "../ports/out/repositories";
import {
  IReceberMensagemWhatsAppInput,
  IReceberMensagemWhatsAppResult,
  IReceberMensagemWhatsAppUseCase,
} from "../ports/in/use-cases";
import { normalizarTelefone, detectarEscalonamento, interpretarRespostaNps } from "@/lib/whatsapp";
import { ConversaWhatsApp } from "../domain/entities/types";

// Núcleo do espelhamento: recebe o evento do WhatsApp, cruza o número com
// atendimentos ativos e registra a conversa (e, quando há match, a "ficha" do cliente).
export class ReceberMensagemWhatsAppUseCase implements IReceberMensagemWhatsAppUseCase {
  constructor(
    private readonly whatsappRepo: IWhatsAppRepository,
    private readonly interacaoRepo: IInteracaoRepository,
    private readonly clienteRepo: IClienteRepository
  ) {}

  async execute(
    input: IReceberMensagemWhatsAppInput
  ): Promise<IReceberMensagemWhatsAppResult> {
    const enviadoEm = input.enviadoEm || new Date().toISOString();
    const numero = normalizarTelefone(input.numero) || input.numero;
    const escalonamento = detectarEscalonamento(input.conteudo);

    // 1. Conecta o WhatsApp do corretor à conversa no CRM
    const conexoes = await this.whatsappRepo.listarConexoes();
    const conexao = conexoes.find((cx) => cx.sessao_id === input.sessaoId);
    if (!conexao) {
      throw new Error(`Sessão ${input.sessaoId} não encontrada entre as conexões ativas.`);
    }

    // 2. Busca a conversa existente ou cria uma nova
    let conversa = await this.whatsappRepo.buscarConversaPorNumero(conexao.id, numero);
    if (!conversa) {
      conversa = await this.whatsappRepo.criarConversa({
        conexao_id: conexao.id,
        corretor: conexao.corretor,
        numero_cliente: numero,
        nome_cliente: input.nomeContato || null,
        cliente_id: null,
        empreendimento: null,
        etapa: null,
        espelhando: true,
        privada_motivo: null,
        primeiro_mensagem_em: enviadoEm,
        ultima_mensagem_em: enviadoEm,
      });
    }
    if (!conversa) {
      throw new Error("Falha ao criar ou localizar a conversa.");
    }

    const conversaAtiva: ConversaWhatsApp = conversa;

    // 3. Armazena a mensagem
    const mensagem = await this.whatsappRepo.adicionarMensagem(conversaAtiva.id, {
      conversa_id: conversaAtiva.id,
      origem: input.origem === "enviada" ? "enviada" : "recebida",
      tipo: (input.tipo as never) || "texto",
      conteudo: input.conteudo,
      anexo_url: null,
      lida: false,
      enviado_em: enviadoEm,
    });

    if (!mensagem) {
      throw new Error("Falha ao armazenar a mensagem.");
    }

    // 4. Cruzamento por número com os atendimentos ativos no CRM
    const clienteMatch = await this.whatsappRepo.buscarClientePorTelefone(numero);

    // 5. Atualiza o vínculo da conversa quando o número dá match
    // (LGPD: o espelhamento passa a ter consentimento registrado)
    if (clienteMatch && conversaAtiva.cliente_id !== clienteMatch.id) {
      await this.whatsappRepo.atualizarConversa(conversaAtiva.id, {
        cliente_id: clienteMatch.id,
        nome_cliente:
          clienteMatch.pessoa?.nome || conversaAtiva.nome_cliente || "Cliente",
        consentimento_lgpd: conversaAtiva.consentimento_lgpd || enviadoEm,
      });
    }

    // 6. Espelhamento para a ficha do cliente (apenas quando ativo e com match)
    let registradoNoCrm = false;
    if (conversaAtiva.espelhando && clienteMatch) {
      const prefixo = mensagem.origem === "recebida" ? "📩 Recebida" : "📤 Enviada";
      await this.interacaoRepo.create({
        cliente_id: clienteMatch.id,
        tipo: "whatsapp",
        canal: "WhatsApp (espelhado)",
        descricao: `${prefixo} · ${mensagem.conteudo}`,
        criado_por: conversaAtiva.corretor || "WhatsApp",
        ocorreu_em: enviadoEm,
        dados_extra: {
          conversa_id: conversaAtiva.id,
          mensagem_id: mensagem.id,
          origem: mensagem.origem,
          escalonado: escalonamento ? true : false,
          motivo_escalonamento: escalonamento?.motivo || null,
        },
      });
      registradoNoCrm = true;

      await this.clienteRepo.update(clienteMatch.id, {
        ultima_interacao_em: enviadoEm,
      });
    }

    // 7. NPS: resposta automática quando há pesquisa pendente na conversa
    let npsRespondido: { nota: number } | null = null;
    if (mensagem.origem === "recebida" && conversaAtiva.espelhando) {
      const notaNps = interpretarRespostaNps(input.conteudo);
      if (notaNps !== null) {
        const pendente = (await this.whatsappRepo.listarNps()).find(
          (n) => n.conversa_id === conversaAtiva.id && n.status === "pendente"
        );
        if (pendente) {
          await this.whatsappRepo.responderNps(pendente.id, notaNps, input.conteudo);
          await this.whatsappRepo.registrarAcesso({
            conversa_id: conversaAtiva.id,
            cliente: conversaAtiva.nome_cliente || conversaAtiva.numero_cliente,
            usuario: conversaAtiva.corretor || "whatsapp",
            acao: `nps_respondido_${notaNps}`,
          });
          npsRespondido = { nota: notaNps };
        }
      }
    }

    return {
      conversa: conversaAtiva,
      mensagem,
      matchCliente: !!clienteMatch,
      registradoNoCrm,
      escalonadoParaGestor: escalonamento,
      npsRespondido,
    };
  }
}