import { NextResponse } from "next/server";
import {
  listarConversasWhatsAppUseCase,
  listarClientesUseCase,
  listarNpsWhatsAppUseCase,
} from "@/core/container";

export async function GET() {
  try {
    const [conversas, clientes, nps] = await Promise.all([
      listarConversasWhatsAppUseCase.execute(),
      listarClientesUseCase.execute(),
      listarNpsWhatsAppUseCase.execute(),
    ]);

    return NextResponse.json({
      conversas,
      clientes: clientes.map((c) => ({
        id: c.id,
        nome: c.pessoa?.nome || "Cliente",
        telefone: c.pessoa?.telefone || null,
        finalidade_principal: c.finalidade_principal,
        status: c.status,
      })),
      nps,
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro: "Erro ao carregar conversas do WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}