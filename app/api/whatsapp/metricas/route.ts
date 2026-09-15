import { NextResponse } from "next/server";
import { obterMetricasWhatsAppUseCase } from "@/core/container";

export async function GET() {
  try {
    const metricas = await obterMetricasWhatsAppUseCase.execute();
    return NextResponse.json({ metricas });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao calcular métricas do WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}