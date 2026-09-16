import { NextResponse } from "next/server";
import { listarImoveisUseCase } from "@/core/container";

export async function GET() {
  try {
    const imoveis = await listarImoveisUseCase.execute();
    return NextResponse.json({ imoveis });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar imóveis.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}