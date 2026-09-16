import { IOportunidadeRepository } from "../../ports/out/repositories";
import { Oportunidade } from "../../domain/entities/types";
import { OportunidadeItem } from "@/lib/segmentacao/tipos";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class OportunidadeRepository implements IOportunidadeRepository {
  async findAll(): Promise<Oportunidade[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("oportunidades")
        .select(`
          *,
          cliente:clientes(
            id,
            status,
            finalidade_principal,
            nivel_confianca,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .order("prioridade", { ascending: false })
        .order("criado_em", { ascending: false });

      if (!error && data) {
        return data as unknown as Oportunidade[];
      }
    }

    const fallbackItems = storageFallback.getOportunidades();
    return fallbackItems as unknown as Oportunidade[];
  }

  async findById(id: string): Promise<Oportunidade | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("oportunidades")
        .select(`
          *,
          cliente:clientes(
            id,
            status,
            finalidade_principal,
            nivel_confianca,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as unknown as Oportunidade;
      }
    }

    const all = storageFallback.getOportunidades();
    const found = all.find((o) => o.id === id);
    return (found as unknown as Oportunidade) || null;
  }

  async create(data: Partial<Oportunidade>): Promise<Oportunidade> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("oportunidades")
        .insert({
          cliente_id: data.cliente_id,
          tipo: data.tipo ?? "outro",
          descricao: data.descricao ?? "",
          valor_estimado: data.valor_estimado ?? null,
          status: data.status ?? "identificada",
          prioridade: data.prioridade ?? 3,
          evidencia: data.evidencia ?? null,
          criado_por: data.criado_por ?? null,
          responsavel_id: data.responsavel_id ?? null,
          prazo_em: data.prazo_em ?? null,
          proximo_passo: data.proximo_passo ?? null,
          vendedor_id: data.vendedor_id ?? null,
          imovel_id: data.imovel_id ?? null,
          regra_geradora: data.regra_geradora ?? "origem_manual",
          tags: data.tags ?? [],
          origem: data.origem ?? "manual",
          removida_motivo: data.removida_motivo ?? null,
          removida_em: data.removida_em ?? null,
          convertida_em: data.convertida_em ?? null,
          lead_criado_id: data.lead_criado_id ?? null,
          lead_duplicado_id: data.lead_duplicado_id ?? null,
          tarefa_primeiro_contato_id: data.tarefa_primeiro_contato_id ?? null,
        })
        .select(`
          *,
          cliente:clientes(
            id,
            status,
            finalidade_principal,
            nivel_confianca,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .single();

      if (!error && created) {
        return created as unknown as Oportunidade;
      }
    }

    const fallbackCreated = storageFallback.addOportunidade(data as unknown as Partial<OportunidadeItem>);
    return fallbackCreated as unknown as Oportunidade;
  }

  async update(id: string, data: Partial<Oportunidade>): Promise<Oportunidade | null> {
    if (supabaseAdmin) {
      const updatePayload: Record<string, unknown> = {
        ...data,
        atualizado_em: new Date().toISOString(),
      };
      if (data.status === "ganha") {
        updatePayload.ganha_em = new Date().toISOString();
      }
      if (data.status === "perdida") {
        updatePayload.perdida_em = new Date().toISOString();
      }

      const { data: updated, error } = await supabaseAdmin
        .from("oportunidades")
        .update(updatePayload)
        .eq("id", id)
        .select(`
          *,
          cliente:clientes(
            id,
            status,
            finalidade_principal,
            nivel_confianca,
            pessoa:pessoas(nome, telefone, email)
          )
        `)
        .single();

      if (!error && updated) {
        return updated as unknown as Oportunidade;
      }
    }

    const fallbackUpdated = storageFallback.updateOportunidade(id, data as unknown as Partial<OportunidadeItem>);
    return (fallbackUpdated as unknown as Oportunidade) || null;
  }
}
