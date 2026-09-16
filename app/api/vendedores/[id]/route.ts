import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  atualizarVendedorUseCase,
  obterVendedorUseCase,
} from "@/core/container";

interface Contexto {
  params: Promise<{
    id: string;
  }>;
}

const updateSchema = z.object({
  nome: z.string().min(1).nullish(),
  telefone: z.string().nullable().optional(),
  email: z.string().nullish(),
  documentoCpf: z.string().nullish(),
  creci: z.string().nullish(),
  status: z.enum(["ativo", "inativo"]).nullish(),
});

export async function GET(request: NextRequest, context: Contexto) {
  try {
    const { id } = await context.params;
    const vendedor = await obterVendedorUseCase.execute(id);

    if (!vendedor) {
      return NextResponse.json({ erro: "Vendedor não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ vendedor });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro interno ao buscar vendedor.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: Contexto) {
  try {
    const { id } = await context.params;
    const body = updateSchema.parse(await request.json());

    const atualizado = await atualizarVendedorUseCase.execute({
      id,
      nome: body.nome,
      telefone: body.telefone,
      email: body.email,
      documentoCpf: body.documentoCpf,
      creci: body.creci,
      status: body.status,
    });

    if (!atualizado) {
      return NextResponse.json(
        { erro: "Vendedor não encontrado para atualização." },
        { status: 404 }
      );
    }

    return NextResponse.json({ vendedor: atualizado });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { erro: "Dados inválidos.", campos: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        erro: "Erro interno ao atualizar vendedor.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}