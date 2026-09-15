import { IWhatsAppRepository, IInteracaoRepository } from "../ports/out/repositories";
import {
  IResponderMensagemWhatsAppInput,
  IResponderMensagemWhatsAppResult,
  IResponderMensagemWhatsAppUseCase,
} from "../ports/in/use-cases";
import { simularEnviarMensagemTexto } from "@/lib/evolution";

// BETA: responder pelo painel → POST /message/sendText da Evolution API.
// Registra a mensagem enviada, mantém o espelhamento no CRM e loga o acesso.
export class ResponderMensagemWhatsAppUseCase implements IResponderMensagemWhatsAppUseCase {
  constructor(
    private readonly whatsappRepo: IWhatsAppRepository,
    private readonly interacaoRepo: IInteracaoRepository
  ) {}

  async execute(
    input: IResponderMensagemWhatsAppInput
  ): Promise<IResponderMensagemWhatsAppResult> {
    const conteudo = (input.conteudo || "").trim();
    const conversa = await this.whatsappRepo.buscarConversaPorId(input.conversaId);
    if (!conversa) {
      throw new Error(`Conversa ${input.conversaId} não encontrada.`);
    }

    const conexao = (await this.whatsappRepo.listarConexoes()).find(
      (cx) => cx.id === conversa.conexao_id
    );

    // 1. Envia pelo WhatsApp do corretor (Evolution API — simulado no beta).
    const envio = await simularEnviarMensagemTexto({
      sessaoId: conexao?.sessao_id || conversa.conexao_id,
      numero: conversa.numero_cliente,
      conteudo,
    });

    // 2. Registra a mensagem na conversa (lado do corretor).
    const enviadoEm = new Date().toISOString();
    const mensagem = await this.whatsappRepo.adicionarMensagem(conversa.id, {
      conversa_id: conversa.id,
      origem: "enviada",
      tipo: "texto",
      conteudo,
      anexo_url: null,
      lida: true,
      enviado_em: enviadoEm,
    });
    if (!mensagem) {
      throw new Error("Falha ao registrar a resposta enviada.");
    }

    await this.whatsappRepo.atualizarConversa(conversa.id, {
      ultima_mensagem_em: enviadoEm,
    });

    // 3. Espelhamento para a ficha do cliente (quando ativo e com match).
    let registradoNoCrm = false;
    if (conversa.espelhando && conversa.cliente_id) {
      await this.interacaoRepo.create({
        cliente_id: conversa.cliente_id,
        tipo: "whatsapp",
        canal: "WhatsApp (espelhado)",
        descricao: `📤 Enviada · ${conteudo}`,
        criado_por: conversa.corretor || "WhatsApp",
        ocorreu_em: enviadoEm,
        dados_extra: {
          conversa_id: conversa.id,
          mensagem_id: mensagem.id,
          origem: "enviada",
          canal_api: "evolution",
        },
      });
      registradoNoCrm = true;
    }

    // 4. Auditoria LGPD: acesso com envio pela API.
    await this.whatsappRepo.registrarAcesso({
      conversa_id: conversa.id,
      cliente: conversa.nome_cliente || conversa.numero_cliente,
      usuario: conversa.corretor || "painel",
      acao: "resposta_via_api",
    });

    return {
      conversa: {
        ...conversa,
        ultima_mensagem_em: enviadoEm,
        mensagens: [...(conversa.mensagens || []), mensagem].filter(
          (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
        ),
      },
      mensagem,
      enviadoViaEvolution: envio.simulado,
      registradoNoCrm,
    };
  }
}