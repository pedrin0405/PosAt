// ============================================================
// BETA — Evolution API (gateway WhatsApp hospedado na StayCloud)
// ============================================================
// Esta camada simula o comportamento da Evolution API para que a
// funcionalidade possa ser validada de ponta a ponta sem depender de
// uma VPS. A troca pela integração real (docs.evolutionfoundation.com.br)
// é local: manter as assinaturas e substituir os corpos dos métodos por
// chamadas fetch à URL da instância (EVOLUTION_BASE_URL + EVOLUTION_API_KEY).
// ============================================================

// Gera um nome de instância único a partir do corretor (ex.: "Consultor André" → corretor_andre).
export function instanciaParaSessao(corretor: string): string {
  const slug = (corretor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const sufixo = Date.now().toString(36).slice(-4);
  return `${slug || "instancia"}_${sufixo}`;
}

// BETA: cria a instância na Evolution (POST /instance/create).
// Retorna o nome da instância e a chave de autenticação simulada.
export async function simularCriarInstancia(dados: {
  corretor: string;
  numero: string;
}): Promise<{ instanceName: string; apiUrl: string; apiKey: string }> {
  const instanceName = instanciaParaSessao(dados.corretor);
  const apiKey = `evo_beta_${Math.random().toString(36).slice(2, 12)}`;
  return {
    instanceName,
    apiUrl: "https://evo.beta.local:8080",
    apiKey,
  };
}

// BETA: gera a chave do QR code (o gateway real devolve a imagem/base64).
// O front renderiza um QR determinístico a partir desta chave.
export function gerarChaveQr(sessaoId: string): string {
  const base = `whatsapp:${sessaoId}:${Date.now()}`;
  return Buffer.from(base).toString("base64url");
}

// BETA: envia texto pela instância (POST /message/sendText da Evolution).
// Retorna o id do remetente e confirma a simulação.
export async function simularEnviarMensagemTexto(dados: {
  sessaoId: string;
  numero: string;
  conteudo: string;
}): Promise<{ simulado: boolean; messageId: string }> {
  const messageId = `evo_${dados.sessaoId}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return { simulado: true, messageId };
}