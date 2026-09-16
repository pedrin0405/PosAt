import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { removerOportunidadeUseCase } from "@/core/container";

interface Contexto {
  params: Promise<{
    id: string;
  }>;
}

const removerSchema = z.object({
  motivo: z.string().min(1, "Informe o motivo."),
  usuario: z.string().nullish(),
});

export async function PATCH(request: NextRequest, context: Contexto) {
  try {
    const { id } = await context.params;
    const body = removerSchema.parse(await request.json());

    const removida = await removerOportunidadeUseCase.execute({
      id,
      motivo: body.motivo,
      usuario: body.usuario,
    });

    if (!removida) {
      return NextResponse.json(
        { erro: "Oportunidade não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ oportunidade: removida });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: "Dados inválidos.", campos: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        erro: "Erro interno ao remover oportunidade.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}