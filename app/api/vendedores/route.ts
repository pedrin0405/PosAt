import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  criarVendedorUseCase,
  listarVendedoresUseCase,
} from "@/core/container";

const vendedorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório."),
  telefone: z.string().nullish(),
  email: z.string().nullish(),
  documentoCpf: z.string().nullish(),
  creci: z.string().nullish(),
  origem: z.string().nullish(),
});

export async function GET() {
  try {
    const vendedores = await listarVendedoresUseCase.execute();
    return NextResponse.json({ vendedores });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar vendedores.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = vendedorSchema.parse(await request.json());
    const vendedor = await criarVendedorUseCase.execute({
      nome: body.nome,
      telefone: body.telefone,
      email: body.email,
      documentoCpf: body.documentoCpf,
      creci: body.creci,
      origem: body.origem,
    });

    return NextResponse.json({ vendedor }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: "Dados inválidos.", campos: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { erro: "Erro interno ao cadastrar vendedor." },
      { status: 500 }
    );
  }
}