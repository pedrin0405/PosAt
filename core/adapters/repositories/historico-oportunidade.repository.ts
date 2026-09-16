import { IHistoricoOportunidadeRepository } from "../../ports/out/repositories";
import { HistoricoOportunidade } from "../../domain/entities/types";
import { HistoricoOportunidadeItem } from "@/lib/segmentacao/tipos";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class HistoricoOportunidadeRepository implements IHistoricoOportunidadeRepository {
  async findAll(oportunidadeId?: string): Promise<HistoricoOportunidade[]> {
    if (supabaseAdmin) {
      let query = supabaseAdmin
        .from("oportunidades_historico")
        .select("*")
        .order("criado_em", { ascending: false });

      if (oportunidadeId) {
        query = query.eq("oportunidade_id", oportunidadeId);
      }

      const { data: resultados, error } = await query;

      if (!error && resultados) {
        return resultados as unknown as HistoricoOportunidade[];
      }
    }

    const fallbackItems = storageFallback.getHistoricoOportunidades(oportunidadeId);
    return fallbackItems as unknown as HistoricoOportunidade[];
  }

  async create(data: Partial<HistoricoOportunidade>): Promise<HistoricoOportunidade> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("oportunidades_historico")
        .insert({
          oportunidade_id: data.oportunidade_id,
          acao: data.acao ?? "status_alterado",
          de: data.de ?? null,
          para: data.para ?? null,
          observacao: data.observacao ?? null,
          criado_por: data.criado_por ?? null,
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as HistoricoOportunidade;
      }
    }

    const fallbackCreated = storageFallback.addHistoricoOportunidade(
      data as unknown as Partial<HistoricoOportunidadeItem>
    );
    return fallbackCreated as unknown as HistoricoOportunidade;
  }
}