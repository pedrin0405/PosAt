// ============================================================
// WAHA — WhatsApp HTTP API
// Camada server-side para comunicação com o WAHA.
// ============================================================

const WAHA_BASE_URL = process.env.WAHA_BASE_URL || "http://localhost:3001";
const WAHA_API_KEY = process.env.WAHA_API_KEY;

interface WahaSession {
  name: string;
  status: string;
  me?: {
    id?: string;
    pushName?: string;
  } | null;
  config?: Record<string, unknown>;
  engine?: {
    engine?: string;
  };
}

interface WahaQrResponse {
  mimetype: string;
  data: string;
}

async function wahaFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!WAHA_API_KEY) {
    throw new Error("WAHA_API_KEY não configurada.");
  }

  const response = await fetch(`${WAHA_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Api-Key": WAHA_API_KEY,
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const texto = await response.text();

  let dados: unknown = null;

  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }
  }

  if (!response.ok) {
  const detalhe =
    typeof dados === "object" && dados !== null
      ? JSON.stringify(dados)
      : String(dados);

  throw new Error(
    `WAHA respondeu com HTTP ${response.status}: ${detalhe}`
  );
}

  return dados as T;
}

function normalizarSessao(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

export function gerarNomeSessao(corretor: string): string {
  const base = normalizarSessao(corretor) || "corretor";
  const sufixo = Date.now().toString(36).slice(-6);

  return `${base}_${sufixo}`;
}

export async function criarSessaoWaha(
  sessao: string,
  webhookUrl?: string
): Promise<WahaSession> {
  const webhooks = webhookUrl
    ? [
        {
          url: webhookUrl,
          events: ["message", "session.status"],
        },
      ]
    : undefined;

  return wahaFetch<WahaSession>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({
      name: sessao,
      start: true,
      config: {
        webhooks,
      },
    }),
  });
}

export async function iniciarSessaoWaha(
  sessao: string
): Promise<WahaSession> {
  return wahaFetch<WahaSession>(
    `/api/sessions/${encodeURIComponent(sessao)}/start`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}

export async function consultarSessaoWaha(
  sessao: string
): Promise<WahaSession> {
  return wahaFetch<WahaSession>(
    `/api/sessions/${encodeURIComponent(sessao)}`
  );
}

export async function listarSessoesWaha(): Promise<WahaSession[]> {
  return wahaFetch<WahaSession[]>("/api/sessions");
}

export async function obterQrCodeWaha(
  sessao: string
): Promise<WahaQrResponse> {
  return wahaFetch<WahaQrResponse>(
    `/api/${encodeURIComponent(sessao)}/auth/qr`,
    {
      method: "GET",
    }
  );
}

export async function pararSessaoWaha(
  sessao: string
): Promise<WahaSession> {
  return wahaFetch<WahaSession>(
    `/api/sessions/${encodeURIComponent(sessao)}/stop`,
    {
      method: "POST",
      body: JSON.stringify({}),
    }
  );
}

export async function deletarSessaoWaha(
  sessao: string
): Promise<void> {
  await wahaFetch<unknown>(
    `/api/sessions/${encodeURIComponent(sessao)}`,
    {
      method: "DELETE",
    }
  );
}

export async function enviarMensagemTextoWaha({
  sessao,
  numero,
  texto,
}: {
  sessao: string;
  numero: string;
  texto: string;
}): Promise<unknown> {
  return wahaFetch<unknown>("/api/sendText", {
    method: "POST",
    body: JSON.stringify({
      session: sessao,
      chatId: numero.includes("@")
  ? numero
  : `${numero.replace(/\D/g, "")}@c.us`,
      text: texto,
    }),
  });
}