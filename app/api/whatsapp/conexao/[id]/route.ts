import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  conectarConexaoWhatsAppUseCase,
  confirmarConexaoWhatsAppUseCase,
  desconectarConexaoWhatsAppUseCase,
} from "@/core/container";

const schema = z.object({
  acao: z.enum(["conectar", "confirmar", "desconectar"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = schema.parse(await request.json());

    let conexao = null;
    if (body.acao === "conectar") {
      conexao = await conectarConexaoWhatsAppUseCase.execute(id);
    } else if (body.acao === "confirmar") {
      conexao = await confirmarConexaoWhatsAppUseCase.execute(id);
    } else {
      conexao = await desconectarConexaoWhatsAppUseCase.execute(id);
    }

    if (!conexao) {
      return NextResponse.json({ erro: "Conexão não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ conexao });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json(
      {
        erro: "Erro ao gerenciar conexão do WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}