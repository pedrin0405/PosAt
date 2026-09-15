import { NextResponse } from "next/server";
import { obterRelatorioGestorWhatsAppUseCase } from "@/core/container";

export async function GET() {
  try {
    const relatorio = await obterRelatorioGestorWhatsAppUseCase.execute();
    return NextResponse.json({ relatorio });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao gerar relatório do gestor.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}