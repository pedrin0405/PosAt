import { IWhatsAppRepository } from "../ports/out/repositories";
import { IObterMetricasWhatsAppUseCase } from "../ports/in/use-cases";
import { WhatsAppMetrics } from "../domain/entities/types";

export class ObterMetricasWhatsAppUseCase implements IObterMetricasWhatsAppUseCase {
  constructor(private readonly whatsappRepo: IWhatsAppRepository) {}

  async execute(): Promise<WhatsAppMetrics> {
    return this.whatsappRepo.obterMetricas();
  }
}