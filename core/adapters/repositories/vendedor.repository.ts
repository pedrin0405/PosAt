import { IVendedorRepository } from "../../ports/out/repositories";
import { Vendedor } from "../../domain/entities/types";
import { VendedorItem } from "@/lib/segmentacao/tipos";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { storageFallback } from "@/lib/storage-fallback";

export class VendedorRepository implements IVendedorRepository {
  async findAll(): Promise<Vendedor[]> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("vendedores")
        .select("*")
        .order("nome", { ascending: true });

      if (!error && data) {
        return data as unknown as Vendedor[];
      }
    }

    const fallbackItems = storageFallback.getVendedores();
    return fallbackItems as unknown as Vendedor[];
  }

  async findById(id: string): Promise<Vendedor | null> {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("vendedores")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as unknown as Vendedor;
      }
    }

    const found = storageFallback.getVendedorById(id);
    return (found as unknown as Vendedor) || null;
  }

  async create(data: Partial<Vendedor>): Promise<Vendedor> {
    if (supabaseAdmin) {
      const { data: created, error } = await supabaseAdmin
        .from("vendedores")
        .insert({
          nome: data.nome,
          telefone: data.telefone ?? null,
          email: data.email ?? null,
          documento_cpf: data.documento_cpf ?? null,
          creci: data.creci ?? null,
          status: data.status ?? "ativo",
          origem: data.origem ?? "manual",
        })
        .select("*")
        .single();

      if (!error && created) {
        return created as unknown as Vendedor;
      }
    }

    const fallbackCreated = storageFallback.addVendedor(data as unknown as Partial<VendedorItem>);
    return fallbackCreated as unknown as Vendedor;
  }

  async update(id: string, data: Partial<Vendedor>): Promise<Vendedor | null> {
    if (supabaseAdmin) {
      const { data: updated, error } = await supabaseAdmin
        .from("vendedores")
        .update({ ...data, atualizado_em: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .single();

      if (!error && updated) {
        return updated as unknown as Vendedor;
      }
    }

    const fallbackUpdated = storageFallback.updateVendedor(
      id,
      data as unknown as Partial<VendedorItem>
    );
    return (fallbackUpdated as unknown as Vendedor) || null;
  }
}