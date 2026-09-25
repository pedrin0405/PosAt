import { consultarSessaoWaha } from "@/lib/waha";

export async function GET() {
  try {
    const sessao = await consultarSessaoWaha("teste_fmfy6n");

    return Response.json({
      ok: true,
      sessao,
    });
  } catch (error) {
    console.error("Erro ao consultar WAHA:", error);

    return Response.json(
      {
        ok: false,
        erro: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}