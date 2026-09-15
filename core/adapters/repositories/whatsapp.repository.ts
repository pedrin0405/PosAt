import { IWhatsAppRepository } from "../../ports/out/repositories";
import {
  Cliente,
  ConexaoWhatsApp,
  ConversaWhatsApp,
  MensagemWhatsApp,
  WhatsAppMetrics,
  PesquisaNps,
  RegistroAcessoWhatsApp,
} from "../../domain/entities/types";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";
import { normalizarTelefone } from "@/lib/whatsapp";

export class WhatsAppRepository implements IWhatsAppRepository {
  async listarConexoes(): Promise<ConexaoWhatsApp[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("whatsapp_conexoes")
        .select("*")
        .order("criado_em", { ascending: false });

      if (!error && data) {
        return data as unknown as ConexaoWhatsApp[];
      }
    }

    return storageFallback.getConexoesWhatsApp() as unknown as ConexaoWhatsApp[];
  }

  async criarConexao(dados: Partial<ConexaoWhatsApp>): Promise<ConexaoWhatsApp> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("whatsapp_conexoes")
        .insert({
          corretor: dados.corretor ?? "Corretor",
          numero: dados.numero ?? "",
          sessao_id: dados.sessao_id ?? `sessao-${Date.now()}`,
          status: dados.status ?? "desconectado",
          qr_code: dados.qr_code ?? null,
          qr_expira_em: dados.qr_expira_em ?? null,
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as ConexaoWhatsApp;
      }
    }

    return storageFallback.addConexaoWhatsApp(dados as never) as unknown as ConexaoWhatsApp;
  }

  async atualizarConexao(
    id: string,
    data: Partial<ConexaoWhatsApp>
  ): Promise<ConexaoWhatsApp | null> {
    if (supabaseAdmin) {
      const { data: updated, error } = await supabaseAdmin
        .from("whatsapp_conexoes")
        .update(data as Record<string, unknown>)
        .eq("id", id)
        .select("*")
        .single();

      if (!error && updated) {
        return updated as unknown as ConexaoWhatsApp;
      }
    }

    const fallbackUpdated = storageFallback.updateConexaoWhatsApp(id, data as never);
    return (fallbackUpdated as unknown as ConexaoWhatsApp) || null;
  }

  async listarConversas(): Promise<ConversaWhatsApp[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("whatsapp_conversas")
        .select("*, mensagens:whatsapp_mensagens(*)")
        .order("ultima_mensagem_em", { ascending: false });

      if (!error && data) {
        return data as unknown as ConversaWhatsApp[];
      }
    }

    return storageFallback.getConversasWhatsApp() as unknown as ConversaWhatsApp[];
  }

  async buscarConversaPorId(id: string): Promise<ConversaWhatsApp | null> {
    const conversas = await this.listarConversas();
    return conversas.find((c) => c.id === id) || null;
  }

  async buscarConversaPorNumero(
    conexaoId: string,
    numero: string
  ): Promise<ConversaWhatsApp | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("whatsapp_conversas")
        .select("*, mensagens:whatsapp_mensagens(*)")
        .eq("conexao_id", conexaoId)
        .eq("numero_cliente", numero)
        .maybeSingle();

      if (!error && data) {
        return data as unknown as ConversaWhatsApp;
      }
    }

    const fallbackConversa = storageFallback.getConversaWhatsAppByNumero(conexaoId, numero);
    return (fallbackConversa as unknown as ConversaWhatsApp) || null;
  }

  async criarConversa(data: Partial<ConversaWhatsApp>): Promise<ConversaWhatsApp> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("whatsapp_conversas")
        .insert({
          conexao_id: data.conexao_id,
          corretor: data.corretor ?? null,
          numero_cliente: data.numero_cliente,
          nome_cliente: data.nome_cliente ?? null,
          cliente_id: data.cliente_id ?? null,
          empreendimento: data.empreendimento ?? null,
          etapa: data.etapa ?? null,
          espelhando: data.espelhando ?? true,
          privada_motivo: data.privada_motivo ?? null,
          consentimento_lgpd: data.consentimento_lgpd ?? null,
          primeiro_mensagem_em: data.primeiro_mensagem_em || new Date().toISOString(),
          ultima_mensagem_em: data.ultima_mensagem_em || new Date().toISOString(),
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as ConversaWhatsApp;
      }
    }

    const fallbackCreated = storageFallback.addConversaWhatsApp(data as never);
    return fallbackCreated as unknown as ConversaWhatsApp;
  }

  async atualizarConversa(
    id: string,
    data: Partial<ConversaWhatsApp>
  ): Promise<ConversaWhatsApp | null> {
    if (supabaseAdmin) {
      const { data: updated, error } = await supabaseAdmin
        .from("whatsapp_conversas")
        .update(data as Record<string, unknown>)
        .eq("id", id)
        .select("*")
        .single();

      if (!error && updated) {
        return updated as unknown as ConversaWhatsApp;
      }
    }

    const fallbackUpdated = storageFallback.updateConversaWhatsApp(id, data as never);
    return (fallbackUpdated as unknown as ConversaWhatsApp) || null;
  }

  async adicionarMensagem(
    conversaId: string,
    data: Partial<MensagemWhatsApp>
  ): Promise<MensagemWhatsApp | null> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("whatsapp_mensagens")
        .insert({
          conversa_id: conversaId,
          origem: data.origem ?? "recebida",
          tipo: data.tipo ?? "texto",
          conteudo: data.conteudo ?? "",
          anexo_url: data.anexo_url ?? null,
          lida: data.lida ?? false,
          enviado_em: data.enviado_em || new Date().toISOString(),
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as MensagemWhatsApp;
      }
    }

    const fallbackCreated = storageFallback.addMensagemWhatsApp(conversaId, data as never);
    return (fallbackCreated as unknown as MensagemWhatsApp) || null;
  }

  async buscarClientePorTelefone(numero: string): Promise<Cliente | null> {
    const alvo = normalizarTelefone(numero);
    if (!alvo) return null;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("clientes")
        .select("*, pessoa:pessoas(*)");

      if (!error && data) {
        const clientes = data as unknown as Cliente[];
        const encontrado = clientes.find((c) => {
          const tel = normalizarTelefone(c.pessoa?.telefone || null);
          return tel === alvo;
        });
        return encontrado || null;
      }
    }

    const fallbackMatch = storageFallback.matchClientePorTelefone(alvo);
    return (fallbackMatch as unknown as Cliente) || null;
  }

  async obterMetricas(): Promise<WhatsAppMetrics> {
    if (supabaseAdmin) {
      const conversas = await this.listarConversas();
      const totalConversas = conversas.length;
      const espelhadas = conversas.filter(
        (c) => c.espelhando && c.cliente_id != null
      ).length;
      const semMatch = conversas.filter((c) => c.cliente_id == null).length;
      const privadas = conversas.filter((c) => !c.espelhando).length;
      const mensagensEspelhadas = conversas.reduce(
        (s, c) => s + (c.mensagens || []).length,
        0
      );
      return {
        totalConversas,
        espelhadas,
        semMatch,
        privadas,
        mensagensEspelhadas,
        semResposta: [],
        porCorretor: [],
        volumePorDia: [],
      };
    }

    return storageFallback.getWhatsAppMetrics() as unknown as WhatsAppMetrics;
  }

  async listarNps(): Promise<PesquisaNps[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("whatsapp_nps")
        .select("*")
        .order("enviada_em", { ascending: false });

      if (!error && data) {
        return data as unknown as PesquisaNps[];
      }
    }

    return storageFallback.getNpsWhatsApp() as unknown as PesquisaNps[];
  }

  async criarNps(dados: Partial<PesquisaNps>): Promise<PesquisaNps> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("whatsapp_nps")
        .insert({
          conversa_id: dados.conversa_id,
          cliente_id: dados.cliente_id ?? null,
          cliente_nome: dados.cliente_nome ?? null,
          etapa: dados.etapa ?? "geral",
          status: dados.status ?? "pendente",
          nota: dados.nota ?? null,
          comentario: dados.comentario ?? null,
          enviada_em: dados.enviada_em || new Date().toISOString(),
          respondida_em: dados.respondida_em ?? null,
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as PesquisaNps;
      }
    }

    const fallbackCreated = storageFallback.addNpsWhatsApp(dados as never);
    return fallbackCreated as unknown as PesquisaNps;
  }

  async responderNps(
    id: string,
    nota: number,
    comentario?: string | null
  ): Promise<PesquisaNps | null> {
    if (supabaseAdmin) {
      const { data: updated, error } = await supabaseAdmin
        .from("whatsapp_nps")
        .update({
          nota,
          comentario: comentario ?? null,
          status: "respondida",
          respondida_em: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

      if (!error && updated) {
        return updated as unknown as PesquisaNps;
      }
    }

    const fallbackUpdated = storageFallback.responderNpsWhatsApp(id, nota, comentario);
    return (fallbackUpdated as unknown as PesquisaNps) || null;
  }

  async registrarAcesso(
    dados: Partial<RegistroAcessoWhatsApp>
  ): Promise<RegistroAcessoWhatsApp> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("whatsapp_acessos")
        .insert({
          conversa_id: dados.conversa_id ?? "-",
          cliente: dados.cliente ?? "—",
          usuario: dados.usuario ?? "sistema",
          acao: dados.acao ?? "acesso",
          em: dados.em || new Date().toISOString(),
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as RegistroAcessoWhatsApp;
      }
    }

    return storageFallback.registrarAcessoWhatsApp(dados as never) as unknown as RegistroAcessoWhatsApp;
  }

  async listarAcessos(): Promise<RegistroAcessoWhatsApp[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("whatsapp_acessos")
        .select("*")
        .order("em", { ascending: false });

      if (!error && data) {
        return data as unknown as RegistroAcessoWhatsApp[];
      }
    }

    return storageFallback.getAcessosWhatsApp() as unknown as RegistroAcessoWhatsApp[];
  }

  async deletarConversa(id: string): Promise<boolean> {
    if (supabaseAdmin) {
      await supabaseAdmin
        .from("interacoes")
        .delete()
        .filter("dados_extra->>conversa_id", "eq", id);
      await supabaseAdmin.from("whatsapp_nps").delete().eq("conversa_id", id);
      await supabaseAdmin.from("whatsapp_mensagens").delete().eq("conversa_id", id);
      const { error } = await supabaseAdmin
        .from("whatsapp_conversas")
        .delete()
        .eq("id", id);
      return !error;
    }

    return storageFallback.removerConversaWhatsApp(id);
  }
}