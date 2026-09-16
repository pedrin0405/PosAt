import { IImovelRepository } from "../../ports/out/repositories";
import { Imovel } from "../../domain/entities/types";
import { ImovelItem } from "@/lib/segmentacao/tipos";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class ImovelRepository implements IImovelRepository {
  async findAll(): Promise<Imovel[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("imoveis")
        .select("*")
        .order("codigo_imovel", { ascending: true });

      if (!error && data) {
        return data as unknown as Imovel[];
      }
    }

    const fallbackItems = storageFallback.getImoveis();
    return fallbackItems as unknown as Imovel[];
  }

  async findById(id: string): Promise<Imovel | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("imoveis")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as unknown as Imovel;
      }
    }

    const found = storageFallback.getImovelById(id);
    return (found as unknown as Imovel) || null;
  }

  async create(data: Partial<Imovel>): Promise<Imovel> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("imoveis")
        .insert({
          codigo_imovel: data.codigo_imovel,
          empreendimento: data.empreendimento,
          bairro: data.bairro,
          cidade: data.cidade,
          regiao: data.regiao,
          tipologia: data.tipologia,
          padrao: data.padrao ?? null,
          tipo_negocio: data.tipo_negocio ?? "venda",
          valor_venda: data.valor_venda ?? null,
          valor_locacao: data.valor_locacao ?? null,
          status: data.status ?? "disponivel",
          caracteristicas: data.caracteristicas ?? [],
          vendedor_id: data.vendedor_id ?? null,
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as Imovel;
      }
    }

    const fallbackCreated = storageFallback.addImovel(data as unknown as Partial<ImovelItem>);
    return fallbackCreated as unknown as Imovel;
  }

  async update(id: string, data: Partial<Imovel>): Promise<Imovel | null> {
    if (supabaseAdmin) {
      const { data: updated, error } = await supabaseAdmin
        .from("imoveis")
        .update({ ...data, atualizado_em: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();

      if (!error && updated) {
        return updated as unknown as Imovel;
      }
    }

    const fallbackUpdated = storageFallback.updateImovel(
      id,
      data as unknown as Partial<ImovelItem>
    );
    return (fallbackUpdated as unknown as Imovel) || null;
  }
}