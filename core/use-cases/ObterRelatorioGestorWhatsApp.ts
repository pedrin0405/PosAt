import { IWhatsAppRepository } from "../ports/out/repositories";
import {
  IObterRelatorioGestorWhatsAppUseCase,
} from "../ports/in/use-cases";
import {
  RelatorioGestorWhatsApp,
  EscalonadaWhatsApp,
} from "../domain/entities/types";
import {
  estaSemResposta,
  detectarEscalonamento,
  analisarSentimento,
  tempoMedioRespostaMin,
} from "@/lib/whatsapp";

// Painel do gestor (5.3): volume por corretor, tempo de resposta, horários
// de pico, alertas de cliente órfão, escalonamento, NPS e duplicidade.
export class ObterRelatorioGestorWhatsAppUseCase
  implements IObterRelatorioGestorWhatsAppUseCase
{
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(): Promise<RelatorioGestorWhatsApp> {
    const conversas = await this.whatsappRepo.listarConversas();
    const nps = await this.whatsappRepo.listarNps();
    const geradoEm = new Date().toISOString();

    const totalConversas = conversas.length;
    const totalMensagens = conversas.reduce((s, c) => s + c.mensagens.length, 0);
    const espelhadas = conversas.filter((c) => c.espelhando && c.cliente_id).length;
    const semMatch = conversas.filter((c) => !c.cliente_id).length;

    const semResposta = conversas
      .filter((c) => estaSemResposta(c.mensagens).semResposta)
      .map((c) => {
        const estado = estaSemResposta(c.mensagens);
        return {
          conversaId: c.id,
          nomeCliente: c.nome_cliente,
          numero: c.numero_cliente,
          corretor: c.corretor,
          etapa: c.etapa,
          ultimaMensagem: estado.ultimaMensagem,
          vencidoAposHoras: estado.vencidoAposHoras,
        };
      });

    // Escalonamentos detectados nas mensagens (palavras-chave de risco)
    const escalonadas: EscalonadaWhatsApp[] = [];
    for (const c of conversas) {
      if (!c.espelhando || !c.cliente_id) continue;
      for (const m of [...c.mensagens].sort(
        (a, b) => new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime()
      )) {
        const esc = detectarEscalonamento(m.conteudo);
        if (esc) {
          escalonadas.push({
            conversaId: c.id,
            nomeCliente: c.nome_cliente,
            corretor: c.corretor,
            numero: c.numero_cliente,
            ultimaMensagem: m.enviado_em,
            motivo: esc.motivo,
          });
        }
      }
    }

    // Agregações por corretor, etapa e empreendimento
    const mapaCorretor = new Map<
      string,
      {
        corretor: string;
        conversas: number;
        mensagens: number;
        recebidas: number;
        enviadas: number;
        semResposta: number;
        somaTemposResposta: number;
        qtdTemposResposta: number;
        npsPendentes: number;
      }
    >();
    const mapaEtapa = new Map<string, number>();
    const mapaEmpreendimento = new Map<string | null, number>();
    const sentimento: Record<"satisfeito" | "neutro" | "irritado", number> = {
      satisfeito: 0,
      neutro: 0,
      irritado: 0,
    };
    const horarioContador = new Map<string, number>();

    for (const c of conversas) {
      if (!c.espelhando) continue;

      const corretor = c.corretor || "Sem responsável";
      const entry = mapaCorretor.get(corretor) || {
        corretor,
        conversas: 0,
        mensagens: 0,
        recebidas: 0,
        enviadas: 0,
        semResposta: 0,
        somaTemposResposta: 0,
        qtdTemposResposta: 0,
        npsPendentes: 0,
      };
      entry.conversas += 1;
      entry.mensagens += c.mensagens.length;
      entry.recebidas += c.mensagens.filter((m) => m.origem === "recebida").length;
      entry.enviadas += c.mensagens.filter((m) => m.origem === "enviada").length;
      if (estaSemResposta(c.mensagens).semResposta) entry.semResposta += 1;
      const tmr = tempoMedioRespostaMin(c.mensagens);
      if (tmr !== null) {
        entry.somaTemposResposta += tmr;
        entry.qtdTemposResposta += 1;
      }
      mapaCorretor.set(corretor, entry);

      const etapa = c.etapa || "sem etapa";
      mapaEtapa.set(etapa, (mapaEtapa.get(etapa) || 0) + 1);
      const empreendimento = c.empreendimento || null;
      mapaEmpreendimento.set(
        empreendimento,
        (mapaEmpreendimento.get(empreendimento) || 0) + 1
      );

      sentimento[analisarSentimento(c.mensagens)] += 1;

      for (const m of c.mensagens) {
        const hora = `${String(new Date(m.enviado_em).getHours()).padStart(2, "0")}h`;
        horarioContador.set(hora, (horarioContador.get(hora) || 0) + 1);
      }
    }

    for (const n of nps) {
      const conversa = conversas.find((c) => c.id === n.conversa_id);
      if (!conversa || !conversa.espelhando) continue;
      const corretor = conversa.corretor || "Sem responsável";
      const entry = mapaCorretor.get(corretor);
      if (entry && n.status === "pendente") entry.npsPendentes += 1;
    }

    const porCorretor = Array.from(mapaCorretor.values())
      .map((e) => ({
        corretor: e.corretor,
        conversas: e.conversas,
        mensagens: e.mensagens,
        recebidas: e.recebidas,
        enviadas: e.enviadas,
        semResposta: e.semResposta,
        tempoMedioRespostaMin:
          e.qtdTemposResposta > 0
            ? Math.round(e.somaTemposResposta / e.qtdTemposResposta)
            : null,
        npsPendentes: e.npsPendentes,
      }))
      .sort((a, b) => b.mensagens - a.mensagens);

    // Duplicidade: mesmo número de telefone atendido em mais de uma conversa
    const duplicidades = this.detectarDuplicidades(conversas);

    const npsRespondidas = nps.filter((n) => n.status === "respondida" && n.nota !== null);
    const mediaNps =
      npsRespondidas.length > 0
        ? Math.round(
            (npsRespondidas.reduce((s, n) => s + (n.nota || 0), 0) /
              npsRespondidas.length) *
              10
          ) / 10
        : null;

    await this.whatsappRepo.registrarAcesso({
      conversa_id: "-",
      cliente: "-",
      usuario: "gestor",
      acao: "leitura_relatorio",
    });

    return {
      geradoEm,
      totalConversas,
      totalMensagens,
      espelhadas,
      semMatch,
      semResposta,
      escalonadas,
      porCorretor,
      porEtapa: Array.from(mapaEtapa.entries())
        .map(([etapa, conversasCount]) => ({ etapa, conversas: conversasCount }))
        .sort((a, b) => b.conversas - a.conversas),
      porEmpreendimento: Array.from(mapaEmpreendimento.entries())
        .map(([empreendimento, conversasCount]) => ({
          empreendimento,
          conversas: conversasCount,
        }))
        .sort((a, b) => b.conversas - a.conversas),
      horariosPico: Array.from(horarioContador.entries())
        .map(([hora, total]) => ({ hora, total }))
        .sort((a, b) => b.total - a.total),
      sentimento,
      duplicidades,
      nps: {
        media: mediaNps,
        total: nps.length,
        respondidas: npsRespondidas.length,
        pendentes: nps.filter((n) => n.status === "pendente").length,
      },
    };
  }

  private detectarDuplicidades(
    conversas: Array<{
      id: string;
      corretor: string | null;
      nome_cliente: string | null;
      cliente_id: string | null;
      numero_cliente: string;
      ultima_mensagem_em: string;
      espelhando: boolean;
    }>
  ): NonNullable<RelatorioGestorWhatsApp["duplicidades"]> {
    const porNumero = new Map<
      string,
      Array<{
        id: string;
        corretor: string | null;
        nome_cliente: string | null;
        cliente_id: string | null;
        numero_cliente: string;
        ultima_mensagem_em: string;
      }>
    >();
    for (const c of conversas) {
      if (!c.espelhando || !c.cliente_id) continue;
      const grupo = porNumero.get(c.numero_cliente) || [];
      grupo.push(c);
      porNumero.set(c.numero_cliente, grupo);
    }
    const saida: NonNullable<RelatorioGestorWhatsApp["duplicidades"]> = [];
    for (const [numero, grupo] of porNumero.entries()) {
      if (grupo.length < 2) continue;
      const corretores = new Set(grupo.map((g) => g.corretor || ""));
      saida.push({
        numero,
        mesmosCorretores: corretores.size === 1,
        conversas: grupo.map((g) => ({
          id: g.id,
          corretor: g.corretor,
          nomeCliente: g.nome_cliente,
          clienteId: g.cliente_id,
          ultimaMensagemEm: g.ultima_mensagem_em,
        })),
      });
    }
    return saida;
  }
}