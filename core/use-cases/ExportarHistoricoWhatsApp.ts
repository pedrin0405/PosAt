import { IWhatsAppRepository } from "../ports/out/repositories";
import {
  IExportarHistoricoWhatsAppInput,
  IExportarHistoricoWhatsAppResult,
  IExportarHistoricoWhatsAppUseCase,
} from "../ports/in/use-cases";

// Exportação de histórico (5.6): JSON ou CSV, apenas conversas em espelhamento
// (conversas privadas ficam de fora por padrão) — registrado no log de acesso.
export class ExportarHistoricoWhatsAppUseCase
  implements IExportarHistoricoWhatsAppUseCase
{
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(
    input?: IExportarHistoricoWhatsAppInput
  ): Promise<IExportarHistoricoWhatsAppResult> {
    const todas = await this.whatsappRepo.listarConversas();

    const conversas = input?.conversaId
      ? todas.filter((c) => c.id === input.conversaId)
      : todas.filter((c) => c.espelhando);

    const formato = input?.formato === "csv" ? "csv" : "json";
    const data = new Date().toISOString().slice(0, 10);
    const nomeArquivo = `whatsapp-historico-${data}.${formato}`;

    if (formato === "csv") {
      const cabecalho = [
        "conversa_id",
        "corretor",
        "numero_cliente",
        "nome_cliente",
        "empreendimento",
        "etapa",
        "origem",
        "conteudo",
        "enviado_em",
      ];
      const linhas = conversas.flatMap((c) =>
        c.mensagens.map((m) =>
          [
            c.id,
            c.corretor || "",
            c.numero_cliente,
            c.nome_cliente || "",
            c.empreendimento || "",
            c.etapa || "",
            m.origem,
            `"${(m.conteudo || "").replace(/"/g, '""')}"`,
            m.enviado_em,
          ].join(";")
        )
      );
      const conteudo = [cabecalho.join(";"), ...linhas].join("\n");
      await this.registrarExportacao(conversas);
      return { formato: "csv", nomeArquivo, conteudo };
    }

    const conteudo = JSON.stringify(conversas, null, 2);
    await this.registrarExportacao(conversas);
    return { formato: "json", nomeArquivo, conteudo };
  }

  private async registrarExportacao(
    conversas: Array<{ id: string; nome_cliente: string | null }>
  ) {
    for (const c of conversas.slice(0, 100)) {
      await this.whatsappRepo.registrarAcesso({
        conversa_id: c.id,
        cliente: c.nome_cliente || "-",
        usuario: "gestor",
        acao: "exportacao_historico",
      });
    }
  }
}