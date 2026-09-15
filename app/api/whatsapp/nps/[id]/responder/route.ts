import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { responderNpsWhatsAppUseCase } from "@/core/container";

const schema = z.object({
  nota: z.number().int().min(0).max(10),
  comentario: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = schema.parse(await request.json());
    const nps = await responderNpsWhatsAppUseCase.execute({
      id,
      nota: body.nota,
      comentario: body.comentario,
    });
    if (!nps) {
      return NextResponse.json({ erro: "Pesquisa NPS não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ nps });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json({ erro: "Erro ao responder pesquisa NPS." }, { status: 500 });
  }
}