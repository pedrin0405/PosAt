import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aplicarFollowUpsWhatsAppUseCase } from "@/core/container";

const schema = z.object({
  etapa: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = schema.parse(body);
    const resultado = await aplicarFollowUpsWhatsAppUseCase.execute({
      etapa: parsed.etapa || null,
    });
    return NextResponse.json({ ok: true, ...resultado }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json(
      {
        erro: "Erro ao aplicar gatilhos de follow-up.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}