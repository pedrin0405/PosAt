import { NextRequest, NextResponse } from "next/server";
import { listarHistoricoOportunidadesUseCase } from "@/core/container";

interface Contexto {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: Contexto) {
  try {
    const { id } = await context.params;
    const historico = await listarHistoricoOportunidadesUseCase.execute(id);
    return NextResponse.json({ historico });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar histórico.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}