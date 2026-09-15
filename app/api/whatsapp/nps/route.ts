import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listarNpsWhatsAppUseCase, dispararNpsWhatsAppUseCase } from "@/core/container";

const schema = z.object({
  conversaId: z.string(),
});

export async function GET() {
  try {
    const nps = await listarNpsWhatsAppUseCase.execute();
    return NextResponse.json({ nps });
  } catch {
    return NextResponse.json({ erro: "Erro ao listar pesquisas NPS." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const nps = await dispararNpsWhatsAppUseCase.execute({ conversaId: body.conversaId });
    if (!nps) {
      return NextResponse.json({ erro: "Conversa não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ nps }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json({ erro: "Erro ao disparar pesquisa NPS." }, { status: 500 });
  }
}