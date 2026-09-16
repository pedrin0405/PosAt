import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { converterOportunidadeUseCase } from "@/core/container";

interface Contexto {
  params: Promise<{
    id: string;
  }>;
}

const converterSchema = z.object({
  usuario: z.string().nullish(),
  nome: z.string().nullish(),
  telefone: z.string().nullish(),
  email: z.string().nullish(),
  documento: z.string().nullish(),
});

export async function POST(request: NextRequest, context: Contexto) {
  try {
    const { id } = await context.params;
    const body = converterSchema.parse(await request.json());

    const resultado = await converterOportunidadeUseCase.execute({
      id,
      usuario: body.usuario,
      nome: body.nome,
      telefone: body.telefone,
      email: body.email,
      documento: body.documento,
    });

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: "Dados inválidos.", campos: error.flatten() },
        { status: 422 }
      );
    }

    const mensagem =
      error instanceof Error ? error.message : "Erro desconhecido";
    const status = mensagem.includes("não pode") || mensagem.includes("não encontrada")
      ? 400
      : 500;

    return NextResponse.json({ erro: mensagem }, { status });
  }
}