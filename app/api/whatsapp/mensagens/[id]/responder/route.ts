import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { responderMensagemWhatsAppUseCase } from "@/core/container";

const schema = z.object({
  conteudo: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = schema.parse(await request.json());
    const resultado = await responderMensagemWhatsAppUseCase.execute({
      conversaId: id,
      conteudo: body.conteudo,
    });
    return NextResponse.json({
      ok: true,
      enviadoViaEvolution: resultado.enviadoViaEvolution,
      registradoNoCrm: resultado.registradoNoCrm,
      mensagem: resultado.mensagem,
      conversa: resultado.conversa,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json(
      {
        erro: "Falha ao enviar resposta pelo WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}