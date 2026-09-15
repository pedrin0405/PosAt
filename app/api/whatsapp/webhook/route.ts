import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { receberMensagemWhatsAppUseCase } from "@/core/container";
import { extrairNumeroDeJid } from "@/lib/whatsapp";

// Aceita:
// 1. Formato da Evolution API (event: "messages.upsert")
// 2. Formato simples (usado no simulador da interface)
const simpleSchema = z.object({
  sessaoId: z.string(),
  numero: z.string(),
  direction: z.enum(["recebida", "enviada"]).default("recebida"),
  texto: z.string().min(1),
  nomeContato: z.string().optional(),
  timestamp: z.string().optional(),
});

function extrairTextoDaMensagem(message: Record<string, unknown> | undefined): string {
  if (!message || typeof message !== "object") return "";
  const m = message as Record<string, unknown>;
  if (typeof m.conversation === "string" && m.conversation) return m.conversation;
  const ext = m.extendedTextMessage as Record<string, unknown> | undefined;
  if (ext && typeof ext.text === "string" && ext.text) return ext.text;
  const img = m.imageMessage as Record<string, unknown> | undefined;
  if (img && typeof img.caption === "string" && img.caption) return img.caption;
  if (m.conversation !== undefined) return String(m.conversation);
  return "[Mídia recebida]";
}

function extrairTipoDoBody(message: Record<string, unknown> | undefined): string {
  if (!message || typeof message !== "object") return "texto";
  if ("imageMessage" in message) return "imagem";
  if ("audioMessage" in message) return "audio";
  if ("videoMessage" in message) return "video";
  if ("documentMessage" in message) return "documento";
  return "texto";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // BETA: autenticação do webhook (header configurado na instância da
    // Evolution). Só exige validação quando EVOLUTION_API_KEY estiver definida.
    const evolApiKey = process.env.EVOLUTION_API_KEY;
    if (evolApiKey) {
      const header =
        request.headers.get("x-api-key") ||
        request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
        "";
      if (header !== evolApiKey) {
        return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
      }
    }

    let sessaoId: string;
    let numero: string;
    let origem: "recebida" | "enviada";
    let conteudo: string;
    let nomeContato: string | null = null;
    let tipo = "texto";
    let enviadoEm: string | null = null;

    const data = body.data as Record<string, unknown> | undefined;
    if (data && (typeof body.instance === "string" || body.event === "messages.upsert")) {
      // ---- Formato Evolution API ----
      sessaoId = body.instance as string;
      const key = data.key as Record<string, unknown> | undefined;
      const jid = (key?.remoteJid as string) || "";
      numero = extrairNumeroDeJid(jid);
      origem = key?.fromMe === true ? "enviada" : "recebida";
      conteudo = extrairTextoDaMensagem(data.message as Record<string, unknown> | undefined);
      tipo = extrairTipoDoBody(data.message as Record<string, unknown> | undefined);
      nomeContato = (data.pushName as string) || null;
      const ts = data.messageTimestamp as number | undefined;
      if (typeof ts === "number" && ts > 0) {
        enviadoEm = new Date(ts * 1000).toISOString();
      }
    } else {
      // ---- Formato simples (simulador) ----
      const parsed = simpleSchema.parse(body);
      sessaoId = parsed.sessaoId;
      numero = parsed.numero;
      origem = parsed.direction;
      conteudo = parsed.texto;
      nomeContato = parsed.nomeContato ?? null;
      enviadoEm = parsed.timestamp ?? null;
    }

    if (!numero) {
      return NextResponse.json({ erro: "Número do remetente não informado." }, { status: 422 });
    }
    if (!conteudo) {
      conteudo = "[Mídia recebida]";
    }

    const resultado = await receberMensagemWhatsAppUseCase.execute({
      sessaoId,
      numero,
      origem,
      conteudo,
      nomeContato,
      tipo,
      enviadoEm,
    });

    return NextResponse.json(
      {
        ok: true,
        matchCliente: resultado.matchCliente,
        registradoNoCrm: resultado.registradoNoCrm,
        escalonado: resultado.escalonadoParaGestor,
        npsRespondido: resultado.npsRespondido,
        conversaId: resultado.conversa.id,
        mensagemId: resultado.mensagem.id,
        espelhando: resultado.conversa.espelhando,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ erro: "Dados inválidos.", campos: error.flatten() }, { status: 422 });
    }
    return NextResponse.json(
      {
        erro: "Falha ao processar webhook do WhatsApp.",
        detalhe: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}