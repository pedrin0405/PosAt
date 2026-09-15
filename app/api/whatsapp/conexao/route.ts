import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  listarConexoesWhatsAppUseCase,
  criarConexaoWhatsAppUseCase,
  atualizarConexaoWhatsAppUseCase,
} from "@/core/container";

const criarSchema = z.object({
  corretor: z.string().min(2),
  numero: z.string().min(8),
});

const atualizarSchema = z.object({
  id: z.string(),
  status: z.enum(["conectado", "conectando", "desconectado", "qr_expirado"]),
});

export async function GET() {
  try {
    const conexoes = await listarConexoesWhatsAppUseCase.execute();
    return NextResponse.json({ conexoes });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar conexões do WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Criar instância (Meu WhatsApp): { corretor, numero }
    if (body && typeof body.corretor === "string") {
      const parsed = criarSchema.parse(body);
      const conexao = await criarConexaoWhatsAppUseCase.execute({
        corretor: parsed.corretor,
        numero: parsed.numero,
      });
      return NextResponse.json({ conexao }, { status: 201 });
    }

    // Legado: atualiza o status diretamente { id, status }
    const parsed = atualizarSchema.parse(body);
    const conexao = await atualizarConexaoWhatsAppUseCase.execute({
      id: parsed.id,
      status: parsed.status,
    });
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
        erro: "Erro ao atualizar conexão.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}