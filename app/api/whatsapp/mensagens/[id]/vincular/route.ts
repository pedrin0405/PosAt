import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { vincularConversaWhatsAppUseCase } from "@/core/container";

const schema = z.object({
  clienteId: z.string(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = schema.parse(await request.json());
    const conversa = await vincularConversaWhatsAppUseCase.execute({
      conversaId: id,
      clienteId: body.clienteId,
    });
    if (!conversa) {
      return NextResponse.json({ erro: "Conversa ou cliente não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ conversa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json({ erro: "Erro ao vincular conversa ao cliente." }, { status: 500 });
  }
}