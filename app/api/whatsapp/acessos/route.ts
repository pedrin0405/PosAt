import { NextResponse } from "next/server";
import { obterLogAcessosWhatsAppUseCase } from "@/core/container";

export async function GET() {
  try {
    const acessos = await obterLogAcessosWhatsAppUseCase.execute();
    return NextResponse.json({ acessos });
  } catch {
    return NextResponse.json({ erro: "Erro ao listar log de acessos." }, { status: 500 });
  }
}