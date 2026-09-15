import { NextRequest, NextResponse } from "next/server";
import { exportarHistoricoWhatsAppUseCase } from "@/core/container";

export async function GET(request: NextRequest) {
  try {
    const conversaId = request.nextUrl.searchParams.get("conversaId");
    const formato = request.nextUrl.searchParams.get("formato") || "json";

    const resultado = await exportarHistoricoWhatsAppUseCase.execute({
      conversaId,
      formato,
    });

    const contentType =
      resultado.formato === "csv"
        ? "text/csv; charset=utf-8"
        : "application/json; charset=utf-8";

    return new NextResponse(resultado.conteudo, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${resultado.nomeArquivo}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao exportar histórico.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}