import {
  ClienteCompleto,
  PessoaCompleta,
  InteracaoItem,
  TarefaItem,
  HandoffItem,
  OportunidadeItem,
  ConexaoWhatsAppItem,
  ConversaWhatsAppItem,
  MensagemWhatsAppItem,
  PesquisaNpsItem,
  RegistroAcessoWhatsAppItem,
} from "./segmentacao/tipos";
import { estaSemResposta, normalizarTelefone } from "./whatsapp";

// Initial seed data with high context Brazilian real estate examples
const INITIAL_PESSOAS: PessoaCompleta[] = [
  {
    id: "p-001",
    nome: "Carlos Eduardo Silveira",
    telefone: "(11) 98765-4321",
    email: "carlos.silveira@investimentos.com.br",
    documento: "123.456.789-00",
    origem: "formulario",
    dados_originais: {
      observacoes: "Está comparando regiões e buscando valorização com foco em studios para locação.",
      finalidadeDeclarada: "Quero comprar para investir",
    },
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "p-002",
    nome: "Mariana e Rodrigo Castilho",
    telefone: "(11) 97123-8899",
    email: "mariana.castilho@advocacia.com.br",
    documento: "234.567.890-11",
    origem: "whatsapp",
    dados_originais: {
      observacoes: "Família crescendo, procurando apartamento de 3 ou 4 dormitórios próximo ao Parque Ibirapuera.",
      finalidadeDeclarada: "Trocar de imóvel por um maior (upgrade de moradia)",
    },
    criado_em: new Date(Date.now() - 12 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "p-003",
    nome: "Dr. Roberto Albuquerque",
    telefone: "(21) 99888-2233",
    email: "roberto.albuquerque@cardio.med.br",
    documento: "345.678.901-22",
    origem: "crm",
    dados_originais: {
      observacoes: "Já adquiriu 3 unidades no ano passado, busca novos lançamentos em fase pré-reserva.",
      finalidadeDeclarada: "Investidor qualificado - busca rentabilidade acima de 0.7% a.m.",
    },
    criado_em: new Date(Date.now() - 30 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "p-004",
    nome: "Beatriz Nogueira",
    telefone: "(11) 96543-2109",
    email: "beatriz.nogueira@techstartup.io",
    documento: "456.789.012-33",
    origem: "site",
    dados_originais: {
      observacoes: "Primeira aquisição, quer entender etapas de financiamento bancário e carência.",
      finalidadeDeclarada: "Primeiro imóvel para sair do aluguel",
    },
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "p-005",
    nome: "Fernando Guimarães",
    telefone: "(19) 99111-4455",
    email: "fernando@guimaraes.agr.br",
    documento: "567.890.123-44",
    origem: "planilha",
    dados_originais: {
      observacoes: "Busca casa em condomínio de campo ou litoral para temporada da família nos fins de semana.",
      finalidadeDeclarada: "Casa de campo / segunda residência",
    },
    criado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "p-006",
    nome: "Juliana Mendes",
    telefone: "(11) 94321-7788",
    email: null,
    documento: null,
    origem: "formulario",
    dados_originais: {
      observacoes: "Preencheu formulário rápido na landing page, faltam dados de orçamento e região.",
      finalidadeDeclarada: null,
    },
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const INITIAL_CLIENTES: ClienteCompleto[] = [
  {
    id: "c-001",
    pessoa_id: "p-001",
    status: "em_negociacao",
    finalidade_principal: "investimento",
    finalidades_secundarias: [],
    regiao_interesse: "Zona Sul",
    cidade_interesse: "São Paulo",
    bairro_interesse: "Moema / Vila Mariana",
    tipo_imovel: "Apartamento compacto / Studio",
    padrao_imovel: "Alto Padrão",
    valor_minimo: 450000,
    valor_maximo: 750000,
    prazo_compra: "3 a 6 meses",
    forma_pagamento: "Financiamento parcial / Recursos próprios",
    precisa_financiamento: true,
    ja_possui_imovel: true,
    e_investidor_confirmado: true,
    indice_completude: 95,
    nivel_confianca: "alta",
    campos_faltantes: [],
    sinais_classificacao: [
      "Cliente declarou ou confirmou interesse direto em investimento",
      "Interesse explícito em studios para locação de curta e longa estadia",
    ],
    ultima_interacao_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    proxima_acao: "Apresentar opções de carteira compatíveis com taxa de retorno, liquidez e valorização.",
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "c-002",
    pessoa_id: "p-002",
    status: "convertido",
    finalidade_principal: "upgrade",
    finalidades_secundarias: ["moradia"],
    regiao_interesse: "Zona Sul",
    cidade_interesse: "São Paulo",
    bairro_interesse: "Vila Nova Conceição",
    tipo_imovel: "Apartamento 4 Suítes",
    padrao_imovel: "Luxo",
    valor_minimo: 2500000,
    valor_maximo: 3800000,
    prazo_compra: "Imediato",
    forma_pagamento: "À vista + Financiamento",
    precisa_financiamento: false,
    ja_possui_imovel: true,
    e_investidor_confirmado: false,
    indice_completude: 100,
    nivel_confianca: "alta",
    campos_faltantes: [],
    sinais_classificacao: [
      "Cliente demonstra intenção de trocar ou ampliar o imóvel",
      "Família em expansão buscando localização nobre",
    ],
    ultima_interacao_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    proxima_acao: "Realizar handoff para equipe de onboarding e suporte pós-venda.",
    criado_em: new Date(Date.now() - 12 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "c-003",
    pessoa_id: "p-003",
    status: "pos_venda",
    finalidade_principal: "investimento",
    finalidades_secundarias: ["cliente_recorrente"],
    regiao_interesse: "Zona Sul / Centro Expandido",
    cidade_interesse: "São Paulo / Rio de Janeiro",
    bairro_interesse: "Pinheiros / Itaim / Leblon",
    tipo_imovel: "Studios e 1 Dormitório",
    padrao_imovel: "Alto Padrão",
    valor_minimo: 600000,
    valor_maximo: 1800000,
    prazo_compra: "Oportunidade de mercado",
    forma_pagamento: "À vista",
    precisa_financiamento: false,
    ja_possui_imovel: true,
    e_investidor_confirmado: true,
    indice_completude: 100,
    nivel_confianca: "alta",
    campos_faltantes: [],
    sinais_classificacao: [
      "Investidor frequente confirmado com múltiplas aquisições anteriores",
      "Foco em rentabilidade contratual e valorização patrimonial",
    ],
    ultima_interacao_em: new Date(Date.now() - 3 * 86400000).toISOString(),
    proxima_acao: "Enviar relatório mensal de valorização das unidades e prévias exclusivas.",
    criado_em: new Date(Date.now() - 30 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "c-004",
    pessoa_id: "p-004",
    status: "em_qualificacao",
    finalidade_principal: "primeiro_imovel",
    finalidades_secundarias: ["moradia"],
    regiao_interesse: "Zona Oeste",
    cidade_interesse: "São Paulo",
    bairro_interesse: "Perdizes / Barra Funda",
    tipo_imovel: "Apartamento 2 Dormitórios",
    padrao_imovel: "Médio-Alto",
    valor_minimo: 400000,
    valor_maximo: 620000,
    prazo_compra: "1 a 3 meses",
    forma_pagamento: "Financiamento Caixa / FGTS",
    precisa_financiamento: true,
    ja_possui_imovel: false,
    e_investidor_confirmado: false,
    indice_completude: 90,
    nivel_confianca: "alta",
    campos_faltantes: [],
    sinais_classificacao: [
      "Cliente informou busca ativa pelo primeiro imóvel",
      "Desejo de sair do aluguel e usar saldo de FGTS",
    ],
    ultima_interacao_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    proxima_acao: "Oferecer consultoria especializada sobre simulação de financiamento, entrada e documentação.",
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "c-005",
    pessoa_id: "p-005",
    status: "novo_lead",
    finalidade_principal: "segunda_residencia",
    finalidades_secundarias: [],
    regiao_interesse: "Interior de SP",
    cidade_interesse: "Itu / Campinas",
    bairro_interesse: "Fazenda Boa Vista / Condomínios Fechados",
    tipo_imovel: "Casa em condomínio",
    padrao_imovel: "Alto Padrão",
    valor_minimo: 1800000,
    valor_maximo: 3200000,
    prazo_compra: "6 a 12 meses",
    forma_pagamento: "Recursos próprios",
    precisa_financiamento: false,
    ja_possui_imovel: true,
    e_investidor_confirmado: false,
    indice_completude: 85,
    nivel_confianca: "media",
    campos_faltantes: ["forma_pagamento"],
    sinais_classificacao: [
      "Cliente demonstra interesse em segunda residência ou lazer",
    ],
    ultima_interacao_em: new Date(Date.now() - 4 * 86400000).toISOString(),
    proxima_acao: "Apresentar empreendimentos com infraestrutura de lazer, praia ou campo.",
    criado_em: new Date(Date.now() - 8 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "c-006",
    pessoa_id: "p-006",
    status: "novo_lead",
    finalidade_principal: "nao_identificado",
    finalidades_secundarias: [],
    regiao_interesse: null,
    cidade_interesse: null,
    bairro_interesse: null,
    tipo_imovel: null,
    padrao_imovel: null,
    valor_minimo: null,
    valor_maximo: null,
    prazo_compra: null,
    forma_pagamento: null,
    precisa_financiamento: null,
    ja_possui_imovel: null,
    e_investidor_confirmado: false,
    indice_completude: 30,
    nivel_confianca: "baixa",
    campos_faltantes: [
      "telefone_ou_email",
      "finalidade",
      "regiao_interesse",
      "tipo_imovel",
      "faixa_de_valor",
      "prazo_compra",
    ],
    sinais_classificacao: [],
    ultima_interacao_em: null,
    proxima_acao: "Confirmar se o imóvel é para moradia, primeiro imóvel ou investimento.",
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const INITIAL_INTERACOES: InteracaoItem[] = [
  {
    id: "int-001",
    cliente_id: "c-001",
    tipo: "whatsapp",
    canal: "WhatsApp Comercial",
    descricao: "Cliente confirmou interesse em 2 unidades no empreendimento Vista Jardins para locação via Airbnb.",
    resultado: "Solicitou simulação de fluxo com 30% no período de obras.",
    criado_por: "Consultor André",
    ocorreu_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "int-002",
    cliente_id: "c-002",
    tipo: "visita",
    canal: "Plantão Decorado",
    descricao: "Visita com casal e arquiteto. Encantados com a planta de 190m² e pé direito duplo.",
    resultado: "Proposta assinada e entrada transferida. Pronto para passagem de bastão.",
    criado_por: "Gerente Patrícia",
    ocorreu_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "int-003",
    cliente_id: "c-003",
    tipo: "ligacao",
    canal: "Telefone Direto",
    descricao: "Check-in trimestral de pós-venda. Cliente satisfeito com a valorização de 18% da primeira unidade.",
    resultado: "Sinalizou interesse em reservar 2 studios no próximo lançamento em Pinheiros.",
    criado_por: "Gestora Fernanda",
    ocorreu_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "int-004",
    cliente_id: "c-004",
    tipo: "email",
    canal: "E-mail Oficial",
    descricao: "Envio de simulação de financiamento habitacional com comparativo SAC vs PRICE.",
    resultado: "Aguardando envio dos holerites para aprovação de crédito.",
    criado_por: "Consultor André",
    ocorreu_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  }
];

const INITIAL_TAREFAS: TarefaItem[] = [
  {
    id: "tar-001",
    cliente_id: "c-006",
    titulo: "Completar dados cadastrais e qualificação",
    descricao: "Campos faltantes: telefone_ou_email, finalidade, regiao_interesse, tipo_imovel, faixa_de_valor, prazo_compra",
    status: "pendente",
    prioridade: 1,
    prazo_em: new Date(Date.now() + 1 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "tar-002",
    cliente_id: "c-001",
    titulo: "Apresentar estudo de yield e retorno de locação",
    descricao: "Montar lâmina comparativa de valorização e retorno médio de aluguel para Moema e Vila Mariana.",
    status: "em_andamento",
    prioridade: 2,
    prazo_em: new Date(Date.now() + 2 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "tar-003",
    cliente_id: "c-002",
    titulo: "Executar protocolo de Onboarding e boas-vindas pós-compra",
    descricao: "Realizar conferência dos dados de contrato, acesso ao portal do cliente e agendamento de vistoria de obras.",
    status: "pendente",
    prioridade: 1,
    prazo_em: new Date(Date.now() + 1 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "tar-004",
    cliente_id: "c-004",
    titulo: "Coletar documentação para pré-aprovação de crédito bancário",
    descricao: "Solicitar RG, CPF, comprovante de residência e extratos bancários dos últimos 3 meses.",
    status: "em_andamento",
    prioridade: 2,
    prazo_em: new Date(Date.now() + 3 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "tar-005",
    cliente_id: "c-003",
    titulo: "Enviar informe trimestral e convite para preview VIP",
    descricao: "Apresentar primeira mão a maquete do lançamento Pinheiros Urban aos investidores premium.",
    status: "concluida",
    prioridade: 3,
    concluida_em: new Date(Date.now() - 3 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 5 * 86400000).toISOString(),
  }
];

const INITIAL_HANDOFFS: HandoffItem[] = [
  {
    id: "han-001",
    cliente_id: "c-002",
    status: "aguardando_passagem",
    motivo: "Conversão de Venda Concluída",
    resumo: "Cliente comprou unidade 142 do Edifício Origem. Família muito exigente com acabamentos. O casal solicitou contato preferencial por WhatsApp.",
    pendencias: [
      "Conferir envio do kit de boas-vindas físico",
      "Cadastrar login do portal de acompanhamento de obras",
      "Agendar primeira reunião de alinhamento com a engenharia",
    ],
    expectativa_cliente: "Transparência total no cronograma de obras e canal direto com gerente de relacionamento.",
    enviado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  }
];

const INITIAL_OPORTUNIDADES: OportunidadeItem[] = [
  {
    id: "op-001",
    cliente_id: "c-003",
    tipo: "investimento_novo",
    descricao: "Reserva de 2 studios do próximo lançamento em Pinheiros.",
    valor_estimado: 2400000,
    status: "em_avaliacao",
    prioridade: 1,
    evidencia: "Check-in trimestral de pós-venda (int-003): cliente sinalizou interesse em reservar 2 studios no próximo lançamento em Pinheiros.",
    criado_por: "Gestora Fernanda",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 15 * 86400000).toISOString(),
    proximo_passo: "Enviar maquete e previsão de preços do Pinheiros Urban.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    criado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "op-002",
    cliente_id: "c-002",
    tipo: "upgrade",
    descricao: "Possível arremate de vaga de garagem extra ou unidade comercial na torre.",
    valor_estimado: 900000,
    status: "identificada",
    prioridade: 2,
    evidencia: "Conversão concluída (c-002) com família em expansão; pós-venda sinalizou possível ampliação de vaga/garagem.",
    criado_por: "Gerente Patrícia",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 30 * 86400000).toISOString(),
    proximo_passo: "Consultar disponibilidade de vaga extra na planta da torre.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    criado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "op-003",
    cliente_id: "c-001",
    tipo: "investimento_novo",
    descricao: "Carteira de 2 unidades no Vista Jardins para locação via Airbnb.",
    valor_estimado: 1200000,
    status: "proposta_enviada",
    prioridade: 1,
    evidencia: "interação int-001: cliente confirmou interesse em 2 unidades no Vista Jardins para locação via Airbnb.",
    criado_por: "Consultor André",
    responsavel_id: null,
    prazo_em: new Date(Date.now() + 10 * 86400000).toISOString(),
    proximo_passo: "Encaminhar simulação de fluxo com 30% no período de obras.",
    ganha_em: null,
    perdida_em: null,
    motivo_perda: null,
    criado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const H = 3600000;
const DIA = 24 * H;

const INITIAL_CONEXOES: ConexaoWhatsAppItem[] = [
  {
    id: "conn-001",
    corretor: "Consultor André",
    numero: "5511970000001",
    sessao_id: "sessao-andre",
    status: "conectado",
    qr_code: null,
    qr_expira_em: null,
    ultimo_ping_em: new Date(Date.now() - 5 * 60000).toISOString(),
    criado_em: new Date(Date.now() - 20 * DIA).toISOString(),
    atualizado_em: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "conn-002",
    corretor: "Gestora Fernanda",
    numero: "5511970000002",
    sessao_id: "sessao-fernanda",
    status: "conectado",
    qr_code: null,
    qr_expira_em: null,
    ultimo_ping_em: new Date(Date.now() - 12 * 60000).toISOString(),
    criado_em: new Date(Date.now() - 20 * DIA).toISOString(),
    atualizado_em: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    id: "conn-003",
    corretor: "Gerente Patrícia",
    numero: "5511970000003",
    sessao_id: "sessao-patricia",
    status: "qr_expirado",
    qr_code: null,
    qr_expira_em: new Date(Date.now() - 2 * H).toISOString(),
    ultimo_ping_em: new Date(Date.now() - 6 * H).toISOString(),
    criado_em: new Date(Date.now() - 20 * DIA).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * H).toISOString(),
  },
];

const INITIAL_CONVERSAS: ConversaWhatsAppItem[] = [
  {
    id: "conv-001",
    conexao_id: "conn-001",
    corretor: "Consultor André",
    numero_cliente: "5511987654321",
    nome_cliente: "Carlos Eduardo Silveira",
    cliente_id: "c-001",
    empreendimento: "Vista Jardins",
    etapa: "proposta",
    espelhando: true,
    privada_motivo: null,
    consentimento_lgpd: new Date(Date.now() - 2 * DIA).toISOString(),
    primeiro_mensagem_em: new Date(Date.now() - 2 * DIA).toISOString(),
    ultima_mensagem_em: new Date(Date.now() - 1 * H).toISOString(),
    criado_em: new Date(Date.now() - 2 * DIA).toISOString(),
    atualizado_em: new Date(Date.now() - 1 * H).toISOString(),
    mensagens: [
      {
        id: "msg-101",
        conversa_id: "conv-001",
        origem: "recebida",
        tipo: "texto",
        conteudo: "André, quero confirmar meu interesse em 2 unidades no Vista Jardins para locação via Airbnb.",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 2 * DIA).toISOString(),
        criado_em: new Date(Date.now() - 2 * DIA).toISOString(),
      },
      {
        id: "msg-102",
        conversa_id: "conv-001",
        origem: "enviada",
        tipo: "texto",
        conteudo: "Perfeito! Vou preparar a simulação de fluxo com 30% durante as obras e envio ainda hoje.",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 26 * H).toISOString(),
        criado_em: new Date(Date.now() - 26 * H).toISOString(),
      },
      {
        id: "msg-103",
        conversa_id: "conv-001",
        origem: "recebida",
        tipo: "texto",
        conteudo: "Recebi a lâmina. Achei ótima a rentabilidade, pode me enviar também o comparativo com Moema?",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 1 * H).toISOString(),
        criado_em: new Date(Date.now() - 1 * H).toISOString(),
      },
    ],
  },
  {
    id: "conv-002",
    conexao_id: "conn-002",
    corretor: "Gestora Fernanda",
    numero_cliente: "5521998882233",
    nome_cliente: "Dr. Roberto Albuquerque",
    cliente_id: "c-003",
    empreendimento: "Pinheiros Urban",
    etapa: "pos_venda",
    espelhando: true,
    privada_motivo: null,
    consentimento_lgpd: new Date(Date.now() - 5 * DIA).toISOString(),
    primeiro_mensagem_em: new Date(Date.now() - 5 * DIA).toISOString(),
    ultima_mensagem_em: new Date(Date.now() - 20 * 60000).toISOString(),
    criado_em: new Date(Date.now() - 5 * DIA).toISOString(),
    atualizado_em: new Date(Date.now() - 20 * 60000).toISOString(),
    mensagens: [
      {
        id: "msg-201",
        conversa_id: "conv-002",
        origem: "recebida",
        tipo: "texto",
        conteudo: "Fernanda, o relatório trimestral da valorização está excelente. Quero reservar 2 studios no lançamento de Pinheiros.",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 5 * DIA).toISOString(),
        criado_em: new Date(Date.now() - 5 * DIA).toISOString(),
      },
      {
        id: "msg-202",
        conversa_id: "conv-002",
        origem: "enviada",
        tipo: "texto",
        conteudo: "Que ótima notícia! Vou te enviar a maquete e a prévia de preços do Pinheiros Urban em primeira mão.",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 4 * DIA).toISOString(),
        criado_em: new Date(Date.now() - 4 * DIA).toISOString(),
      },
      {
        id: "msg-203",
        conversa_id: "conv-002",
        origem: "recebida",
        tipo: "texto",
        conteudo: "A maquete ficou incrível. Avise o gerente que quero o mesmo pricing do nosso primeiro negócio.",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 30 * 60000).toISOString(),
        criado_em: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: "msg-204",
        conversa_id: "conv-002",
        origem: "enviada",
        tipo: "texto",
        conteudo: "Registrado com o time comercial. Te retorno com o pricing reservado até amanhã.",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 20 * 60000).toISOString(),
        criado_em: new Date(Date.now() - 20 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "conv-003",
    conexao_id: "conn-001",
    corretor: "Consultor André",
    numero_cliente: "5511932147788",
    nome_cliente: "Juliana Mendes",
    cliente_id: "c-006",
    empreendimento: null,
    etapa: "qualificacao",
    espelhando: true,
    privada_motivo: null,
    consentimento_lgpd: new Date(Date.now() - 26 * H).toISOString(),
    primeiro_mensagem_em: new Date(Date.now() - 26 * H).toISOString(),
    ultima_mensagem_em: new Date(Date.now() - 22 * H).toISOString(),
    criado_em: new Date(Date.now() - 26 * H).toISOString(),
    atualizado_em: new Date(Date.now() - 22 * H).toISOString(),
    mensagens: [
      {
        id: "msg-301",
        conversa_id: "conv-003",
        origem: "recebida",
        tipo: "texto",
        conteudo: "Oi, preenchi o formulário no site. Queria entender as opções para sair do aluguel.",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 22 * H).toISOString(),
        criado_em: new Date(Date.now() - 22 * H).toISOString(),
      },
    ],
  },
  {
    id: "conv-004",
    conexao_id: "conn-001",
    corretor: "Consultor André",
    numero_cliente: "5511988776655",
    nome_cliente: "Número desconhecido",
    cliente_id: null,
    empreendimento: null,
    etapa: null,
    espelhando: true,
    privada_motivo: null,
    consentimento_lgpd: null,
    primeiro_mensagem_em: new Date(Date.now() - 3 * H).toISOString(),
    ultima_mensagem_em: new Date(Date.now() - 3 * H).toISOString(),
    criado_em: new Date(Date.now() - 3 * H).toISOString(),
    atualizado_em: new Date(Date.now() - 3 * H).toISOString(),
    mensagens: [
      {
        id: "msg-401",
        conversa_id: "conv-004",
        origem: "recebida",
        tipo: "texto",
        conteudo: "Boa tarde! Vocês trabalham com imóveis na região da Vila Mariana?",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 3 * H).toISOString(),
        criado_em: new Date(Date.now() - 3 * H).toISOString(),
      },
    ],
  },
  {
    id: "conv-005",
    conexao_id: "conn-001",
    corretor: "Consultor André",
    numero_cliente: "5511999114411",
    nome_cliente: "Mãe do André",
    cliente_id: null,
    empreendimento: null,
    etapa: null,
    espelhando: false,
    privada_motivo: "Conversa pessoal — fora do espelhamento por privacidade (LGPD)",
    consentimento_lgpd: null,
    primeiro_mensagem_em: new Date(Date.now() - 12 * H).toISOString(),
    ultima_mensagem_em: new Date(Date.now() - 2 * H).toISOString(),
    criado_em: new Date(Date.now() - 12 * H).toISOString(),
    atualizado_em: new Date(Date.now() - 2 * H).toISOString(),
    mensagens: [
      {
        id: "msg-501",
        conversa_id: "conv-005",
        origem: "recebida",
        tipo: "texto",
        conteudo: "Filho, você almoça aqui no domingo?",
        anexo_url: null,
        lida: true,
        enviado_em: new Date(Date.now() - 2 * H).toISOString(),
        criado_em: new Date(Date.now() - 2 * H).toISOString(),
      },
    ],
  },
];

const INITIAL_NPS: PesquisaNpsItem[] = [
  {
    id: "nps-001",
    conversa_id: "conv-002",
    cliente_id: "c-003",
    cliente_nome: "Dr. Roberto Albuquerque",
    etapa: "entrega_chaves",
    status: "respondida",
    nota: 9,
    comentario: "Cuidado impecável desde a escolha até a entrega das chaves.",
    enviada_em: new Date(Date.now() - 6 * DIA).toISOString(),
    respondida_em: new Date(Date.now() - 5 * DIA).toISOString(),
  },
  {
    id: "nps-002",
    conversa_id: "conv-001",
    cliente_id: "c-001",
    cliente_nome: "Carlos Eduardo Silveira",
    etapa: "assinatura",
    status: "pendente",
    nota: null,
    comentario: null,
    enviada_em: new Date(Date.now() - 30 * 60000).toISOString(),
    respondida_em: null,
  },
];

const INITIAL_ACESSOS_WHATSAPP: RegistroAcessoWhatsAppItem[] = [
  {
    id: "acs-001",
    conversa_id: "conv-002",
    cliente: "Dr. Roberto Albuquerque",
    usuario: "gestor@quadra",
    acao: "leitura_relatorio",
    em: new Date(Date.now() - 40 * 60000).toISOString(),
  },
  {
    id: "acs-002",
    conversa_id: "conv-005",
    cliente: "Mãe do André",
    usuario: "andre@quadra",
    acao: "acesso_restrito",
    em: new Date(Date.now() - 20 * 60000).toISOString(),
  },
];

// In-memory persistent state during process lifetime
class StorageMemoryFallback {
  private pessoas: PessoaCompleta[] = [...INITIAL_PESSOAS];
  private clientes: ClienteCompleto[] = [...INITIAL_CLIENTES];
  private interacoes: InteracaoItem[] = [...INITIAL_INTERACOES];
  private tarefas: TarefaItem[] = [...INITIAL_TAREFAS];
  private handoffs: HandoffItem[] = [...INITIAL_HANDOFFS];
  private oportunidades: OportunidadeItem[] = [...INITIAL_OPORTUNIDADES];
  private conexoesWhatsApp: ConexaoWhatsAppItem[] = [...INITIAL_CONEXOES];
  private conversasWhatsApp: ConversaWhatsAppItem[] = [...INITIAL_CONVERSAS];
  private npsWhatsApp: PesquisaNpsItem[] = [...INITIAL_NPS];
  private acessosWhatsApp: RegistroAcessoWhatsAppItem[] = [...INITIAL_ACESSOS_WHATSAPP];

  getPessoas() {
    return this.pessoas;
  }

  getClientes(filtros?: {
    finalidade?: string | null;
    status?: string | null;
    regiao?: string | null;
    confianca?: string | null;
    completude_maxima?: string | null;
    busca?: string | null;
  }) {
    let list = this.clientes.map((c) => {
      const pessoa = this.pessoas.find((p) => p.id === c.pessoa_id);
      return {
        ...c,
        pessoa,
      };
    });

    if (filtros?.finalidade) {
      list = list.filter((c) => c.finalidade_principal === filtros.finalidade);
    }
    if (filtros?.status) {
      list = list.filter((c) => c.status === filtros.status);
    }
    if (filtros?.confianca) {
      list = list.filter((c) => c.nivel_confianca === filtros.confianca);
    }
    if (filtros?.regiao) {
      const termo = filtros.regiao.toLowerCase();
      list = list.filter(
        (c) =>
          c.regiao_interesse?.toLowerCase().includes(termo) ||
          c.cidade_interesse?.toLowerCase().includes(termo) ||
          c.bairro_interesse?.toLowerCase().includes(termo)
      );
    }
    if (filtros?.completude_maxima) {
      const max = Number(filtros.completude_maxima);
      list = list.filter((c) => c.indice_completude <= max);
    }
    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      list = list.filter(
        (c) =>
          c.pessoa?.nome?.toLowerCase().includes(busca) ||
          c.pessoa?.email?.toLowerCase().includes(busca) ||
          c.pessoa?.telefone?.toLowerCase().includes(busca) ||
          c.tipo_imovel?.toLowerCase().includes(busca) ||
          c.bairro_interesse?.toLowerCase().includes(busca)
      );
    }

    return list.sort(
      (a, b) =>
        new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime()
    );
  }

  getClienteById(id: string): ClienteCompleto | null {
    const cliente = this.clientes.find((c) => c.id === id);
    if (!cliente) return null;
    const pessoa = this.pessoas.find((p) => p.id === cliente.pessoa_id);
    const interacoes = this.interacoes
      .filter((i) => i.cliente_id === id)
      .sort((a, b) => new Date(b.ocorreu_em).getTime() - new Date(a.ocorreu_em).getTime());
    const tarefas = this.tarefas
      .filter((t) => t.cliente_id === id)
      .sort((a, b) => a.prioridade - b.prioridade);
    const handoffs = this.handoffs
      .filter((h) => h.cliente_id === id)
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

    return {
      ...cliente,
      pessoa,
      interacoes,
      tarefas,
      handoffs,
    };
  }

  addPessoa(pessoa: Partial<PessoaCompleta>): PessoaCompleta {
    const newPessoa: PessoaCompleta = {
      id: pessoa.id || `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nome: pessoa.nome || null,
      telefone: pessoa.telefone || null,
      email: pessoa.email || null,
      documento: pessoa.documento || null,
      origem: pessoa.origem || "manual",
      dados_originais: pessoa.dados_originais || {},
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.pessoas.unshift(newPessoa);
    return newPessoa;
  }

  addCliente(cliente: Partial<ClienteCompleto>): ClienteCompleto {
    const newCliente: ClienteCompleto = {
      id: cliente.id || `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      pessoa_id: cliente.pessoa_id!,
      status: cliente.status || "novo_lead",
      finalidade_principal: cliente.finalidade_principal || "nao_identificado",
      finalidades_secundarias: cliente.finalidades_secundarias || [],
      regiao_interesse: cliente.regiao_interesse || null,
      cidade_interesse: cliente.cidade_interesse || null,
      bairro_interesse: cliente.bairro_interesse || null,
      tipo_imovel: cliente.tipo_imovel || null,
      padrao_imovel: cliente.padrao_imovel || null,
      valor_minimo: cliente.valor_minimo ?? null,
      valor_maximo: cliente.valor_maximo ?? null,
      prazo_compra: cliente.prazo_compra || null,
      forma_pagamento: cliente.forma_pagamento || null,
      precisa_financiamento: cliente.precisa_financiamento ?? null,
      ja_possui_imovel: cliente.ja_possui_imovel ?? null,
      e_investidor_confirmado: cliente.e_investidor_confirmado ?? false,
      indice_completude: cliente.indice_completude ?? 0,
      nivel_confianca: cliente.nivel_confianca || "baixa",
      campos_faltantes: cliente.campos_faltantes || [],
      sinais_classificacao: cliente.sinais_classificacao || [],
      responsavel_id: cliente.responsavel_id || null,
      ultima_interacao_em: cliente.ultima_interacao_em || null,
      proxima_acao: cliente.proxima_acao || null,
      proxima_acao_em: cliente.proxima_acao_em || null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.clientes.unshift(newCliente);
    return newCliente;
  }

  updateCliente(id: string, updates: Partial<ClienteCompleto>): ClienteCompleto | null {
    const index = this.clientes.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.clientes[index] = {
      ...this.clientes[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.clientes[index];
  }

  addInteracao(interacao: Partial<InteracaoItem>): InteracaoItem {
    const newInteracao: InteracaoItem = {
      id: interacao.id || `int-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cliente_id: interacao.cliente_id!,
      tipo: interacao.tipo || "observacao",
      canal: interacao.canal || null,
      descricao: interacao.descricao || "",
      resultado: interacao.resultado || null,
      criado_por: interacao.criado_por || null,
      ocorreu_em: interacao.ocorreu_em || new Date().toISOString(),
      dados_extra: interacao.dados_extra || {},
    };
    this.interacoes.unshift(newInteracao);

    // Update client's last interaction
    this.updateCliente(newInteracao.cliente_id, {
      ultima_interacao_em: newInteracao.ocorreu_em,
    });

    return newInteracao;
  }

  getInteracoes(clienteId?: string) {
    if (clienteId) {
      return this.interacoes.filter((i) => i.cliente_id === clienteId);
    }
    return this.interacoes;
  }

  addTarefa(tarefa: Partial<TarefaItem>): TarefaItem {
    const newTarefa: TarefaItem = {
      id: tarefa.id || `tar-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cliente_id: tarefa.cliente_id!,
      titulo: tarefa.titulo || "Tarefa sem título",
      descricao: tarefa.descricao || null,
      status: tarefa.status || "pendente",
      prioridade: tarefa.prioridade ?? 3,
      responsavel_id: tarefa.responsavel_id || null,
      prazo_em: tarefa.prazo_em || null,
      concluida_em: tarefa.concluida_em || null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.tarefas.unshift(newTarefa);
    return newTarefa;
  }

  updateTarefa(id: string, updates: Partial<TarefaItem>): TarefaItem | null {
    const index = this.tarefas.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.tarefas[index] = {
      ...this.tarefas[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.tarefas[index];
  }

  getTarefas() {
    return this.tarefas.map((t) => {
      const cliente = this.clientes.find((c) => c.id === t.cliente_id);
      const pessoa = cliente ? this.pessoas.find((p) => p.id === cliente.pessoa_id) : null;
      return {
        ...t,
        cliente: cliente
          ? {
              id: cliente.id,
              finalidade_principal: cliente.finalidade_principal,
              status: cliente.status,
              pessoa: pessoa
                ? {
                    nome: pessoa.nome,
                    telefone: pessoa.telefone,
                    email: pessoa.email,
                  }
                : undefined,
            }
          : undefined,
      };
    });
  }

  addHandoff(handoff: Partial<HandoffItem>): HandoffItem {
    const newHandoff: HandoffItem = {
      id: handoff.id || `han-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cliente_id: handoff.cliente_id!,
      responsavel_origem: handoff.responsavel_origem || null,
      responsavel_destino: handoff.responsavel_destino || null,
      status: handoff.status || "aguardando_passagem",
      motivo: handoff.motivo || null,
      resumo: handoff.resumo || null,
      pendencias: handoff.pendencias || [],
      expectativa_cliente: handoff.expectativa_cliente || null,
      enviado_em: handoff.enviado_em || new Date().toISOString(),
      recebido_em: handoff.recebido_em || null,
      concluido_em: handoff.concluido_em || null,
      criado_em: new Date().toISOString(),
    };
    this.handoffs.unshift(newHandoff);

    // Update client status to handoff_pendente if applicable
    this.updateCliente(newHandoff.cliente_id, {
      status: "handoff_pendente",
    });

    return newHandoff;
  }

  getHandoffs() {
    return this.handoffs.map((h) => {
      const cliente = this.getClienteById(h.cliente_id);
      return {
        ...h,
        cliente: cliente || undefined,
      };
    });
  }

  getOportunidades() {
    return this.oportunidades.map((o) => {
      const cliente = this.getClienteById(o.cliente_id);
      return {
        ...o,
        cliente: cliente
          ? {
              id: cliente.id,
              nome: cliente.pessoa?.nome || null,
              telefone: cliente.pessoa?.telefone || null,
              email: cliente.pessoa?.email || null,
              finalidade_principal: cliente.finalidade_principal,
              status: cliente.status,
              nivel_confianca: cliente.nivel_confianca,
            }
          : undefined,
      };
    });
  }

  addOportunidade(oportunidade: Partial<OportunidadeItem>): OportunidadeItem {
    const newOportunidade: OportunidadeItem = {
      id: oportunidade.id || `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cliente_id: oportunidade.cliente_id!,
      tipo: oportunidade.tipo || "outro",
      descricao: oportunidade.descricao || "",
      valor_estimado: oportunidade.valor_estimado ?? null,
      status: oportunidade.status || "identificada",
      prioridade: oportunidade.prioridade ?? 3,
      evidencia: oportunidade.evidencia || null,
      criado_por: oportunidade.criado_por || null,
      responsavel_id: oportunidade.responsavel_id || null,
      prazo_em: oportunidade.prazo_em || null,
      proximo_passo: oportunidade.proximo_passo || null,
      ganha_em: oportunidade.ganha_em || null,
      perdida_em: oportunidade.perdida_em || null,
      motivo_perda: oportunidade.motivo_perda || null,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    this.oportunidades.unshift(newOportunidade);
    return newOportunidade;
  }

  updateOportunidade(id: string, updates: Partial<OportunidadeItem>): OportunidadeItem | null {
    const index = this.oportunidades.findIndex((o) => o.id === id);
    if (index === -1) return null;
    const updated: OportunidadeItem = {
      ...this.oportunidades[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    if (updates.status === "ganha" && !updated.ganha_em) {
      updated.ganha_em = new Date().toISOString();
    }
    if (updates.status === "perdida" && !updated.perdida_em) {
      updated.perdida_em = new Date().toISOString();
    }
    this.oportunidades[index] = updated;
    return updated;
  }

  // ---- WhatsApp (Espelhamento) ----

  private enriquecerConversa(conversa: ConversaWhatsAppItem): ConversaWhatsAppItem {
    const cliente = conversa.cliente_id
      ? this.clientes.find((c) => c.id === conversa.cliente_id)
      : null;
    const pessoa = cliente ? this.pessoas.find((p) => p.id === cliente.pessoa_id) : null;
    return {
      ...conversa,
      cliente: cliente
        ? {
            id: cliente.id,
            nome: pessoa?.nome || null,
            telefone: pessoa?.telefone || null,
            finalidade_principal: cliente.finalidade_principal,
            status: cliente.status,
          }
        : null,
    };
  }

  getConexoesWhatsApp(): ConexaoWhatsAppItem[] {
    return this.conexoesWhatsApp.map((c) => ({ ...c }));
  }

  addConexaoWhatsApp(conexao: Partial<Omit<ConexaoWhatsAppItem, "id">> & { id?: string }): ConexaoWhatsAppItem {
    const agora = new Date().toISOString();
    const nova: ConexaoWhatsAppItem = {
      id: conexao.id || `conn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      corretor: conexao.corretor || "Corretor",
      numero: conexao.numero || "",
      sessao_id: conexao.sessao_id || `sessao-${Date.now()}`,
      status: conexao.status || "desconectado",
      qr_code: conexao.qr_code ?? null,
      qr_expira_em: conexao.qr_expira_em ?? null,
      ultimo_ping_em: conexao.ultimo_ping_em ?? null,
      criado_em: agora,
      atualizado_em: agora,
    };
    this.conexoesWhatsApp.unshift(nova);
    return { ...nova };
  }

  updateConexaoWhatsApp(
    id: string,
    updates: Partial<Omit<ConexaoWhatsAppItem, "id">>
  ): ConexaoWhatsAppItem | null {
    const index = this.conexoesWhatsApp.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.conexoesWhatsApp[index] = {
      ...this.conexoesWhatsApp[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.conexoesWhatsApp[index];
  }

  getConversasWhatsApp(): ConversaWhatsAppItem[] {
    return this.conversasWhatsApp
      .map((c) => this.enriquecerConversa(c))
      .sort(
        (a, b) =>
          new Date(b.ultima_mensagem_em).getTime() -
          new Date(a.ultima_mensagem_em).getTime()
      );
  }

  getConversaWhatsAppById(id: string): ConversaWhatsAppItem | null {
    const conversa = this.conversasWhatsApp.find((c) => c.id === id);
    return conversa ? this.enriquecerConversa(conversa) : null;
  }

  getConversaWhatsAppByNumero(conexaoId: string, numero: string): ConversaWhatsAppItem | null {
    const conversa = this.conversasWhatsApp.find(
      (c) => c.conexao_id === conexaoId && c.numero_cliente === numero
    );
    return conversa ? this.enriquecerConversa(conversa) : null;
  }

  addConversaWhatsApp(conversa: Partial<ConversaWhatsAppItem>): ConversaWhatsAppItem {
    const nova: ConversaWhatsAppItem = {
      id: conversa.id || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conexao_id: conversa.conexao_id!,
      corretor: conversa.corretor || null,
      numero_cliente: conversa.numero_cliente!,
      nome_cliente: conversa.nome_cliente || null,
      cliente_id: conversa.cliente_id || null,
      empreendimento: conversa.empreendimento || null,
      etapa: conversa.etapa || null,
      espelhando: conversa.espelhando ?? true,
      privada_motivo: conversa.privada_motivo || null,
      consentimento_lgpd: conversa.consentimento_lgpd || null,
      primeiro_mensagem_em: conversa.primeiro_mensagem_em || new Date().toISOString(),
      ultima_mensagem_em: conversa.ultima_mensagem_em || new Date().toISOString(),
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      mensagens: [],
    };
    this.conversasWhatsApp.unshift(nova);
    return this.enriquecerConversa(nova);
  }

  updateConversaWhatsApp(
    id: string,
    updates: Partial<Omit<ConversaWhatsAppItem, "id" | "mensagens">>
  ): ConversaWhatsAppItem | null {
    const index = this.conversasWhatsApp.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.conversasWhatsApp[index] = {
      ...this.conversasWhatsApp[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.enriquecerConversa(this.conversasWhatsApp[index]);
  }

  addMensagemWhatsApp(
    conversaId: string,
    mensagem: Partial<MensagemWhatsAppItem>
  ): MensagemWhatsAppItem | null {
    const index = this.conversasWhatsApp.findIndex((c) => c.id === conversaId);
    if (index === -1) return null;
    const nova: MensagemWhatsAppItem = {
      id: mensagem.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversa_id: conversaId,
      origem: mensagem.origem || "recebida",
      tipo: mensagem.tipo || "texto",
      conteudo: mensagem.conteudo || "",
      anexo_url: mensagem.anexo_url || null,
      lida: mensagem.lida ?? false,
      enviado_em: mensagem.enviado_em || new Date().toISOString(),
      criado_em: new Date().toISOString(),
    };
    this.conversasWhatsApp[index].mensagens.push(nova);
    this.conversasWhatsApp[index].mensagens.sort(
      (a, b) => new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime()
    );
    this.conversasWhatsApp[index] = {
      ...this.conversasWhatsApp[index],
      ultima_mensagem_em:
        nova.enviado_em > this.conversasWhatsApp[index].ultima_mensagem_em
          ? nova.enviado_em
          : this.conversasWhatsApp[index].ultima_mensagem_em,
      atualizado_em: new Date().toISOString(),
    };
    return nova;
  }

  getConversaPorCliente(clienteId: string): ConversaWhatsAppItem | null {
    const conversa = this.conversasWhatsApp.find((c) => c.cliente_id === clienteId);
    return conversa ? this.enriquecerConversa(conversa) : null;
  }

  getWhatsAppMetrics(): {
    totalConversas: number;
    espelhadas: number;
    semMatch: number;
    privadas: number;
    semResposta: {
      conversaId: string;
      nomeCliente: string | null;
      numero: string;
      corretor: string | null;
      etapa: string | null;
      ultimaMensagem: string | null;
      vencidoAposHoras: number;
    }[];
    porCorretor: {
      corretor: string;
      conversas: number;
      mensagens: number;
      semResposta: number;
      hoje: number;
    }[];
    volumePorDia: {
      data: string;
      total: number;
      recebidas: number;
      enviadas: number;
    }[];
  } {
    const conversas = this.conversasWhatsApp;
    const totalConversas = conversas.length;
    const espelhadas = conversas.filter(
      (c) => c.espelhando && c.cliente_id && c.numero_cliente.length > 0
    ).length;
    const semMatch = conversas.filter((c) => !c.cliente_id).length;
    const privadas = conversas.filter((c) => !c.espelhando).length;

    const semResposta = conversas
      .filter((c) => estaSemResposta(c.mensagens).semResposta)
      .map((c) => {
        const estado = estaSemResposta(c.mensagens);
        return {
          conversaId: c.id,
          nomeCliente: c.nome_cliente,
          numero: c.numero_cliente,
          corretor: c.corretor,
          etapa: c.etapa,
          ultimaMensagem: estado.ultimaMensagem,
          vencidoAposHoras: estado.vencidoAposHoras,
        };
      });

    const porCorretor = new Map<
      string,
      { corretor: string; conversas: number; mensagens: number; semResposta: number; hoje: number }
    >();
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);
    for (const c of conversas) {
      const corretor = c.corretor || "Sem responsável";
      const entry = porCorretor.get(corretor) || {
        corretor,
        conversas: 0,
        mensagens: 0,
        semResposta: 0,
        hoje: 0,
      };
      entry.conversas += 1;
      entry.mensagens += c.mensagens.length;
      entry.hoje += c.mensagens.filter(
        (m) => new Date(m.enviado_em).getTime() >= hojeInicio.getTime()
      ).length;
      if (estaSemResposta(c.mensagens).semResposta) entry.semResposta += 1;
      porCorretor.set(corretor, entry);
    }

    const volumePorDia: {
      data: string;
      total: number;
      recebidas: number;
      enviadas: number;
    }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(Date.now() - i * DIA);
      const chave = dia.toISOString().slice(0, 10);
      const doDia = conversas.flatMap((c) => c.mensagens).filter(
        (m) => m.enviado_em.slice(0, 10) === chave
      );
      volumePorDia.push({
        data: chave,
        total: doDia.length,
        recebidas: doDia.filter((m) => m.origem === "recebida").length,
        enviadas: doDia.filter((m) => m.origem === "enviada").length,
      });
    }

    return {
      totalConversas,
      espelhadas,
      semMatch,
      privadas,
      semResposta,
      porCorretor: Array.from(porCorretor.values()).sort((a, b) => b.conversas - a.conversas),
      volumePorDia,
    };
  }

  // Busca um cliente ativo pelo telefone normalizado (padrão BR internacional).
  matchClientePorTelefone(numero: string): ClienteCompleto | null {
    const alvo = normalizarTelefone(numero);
    if (!alvo) return null;
    for (const c of this.clientes) {
      const pessoa = this.pessoas.find((p) => p.id === c.pessoa_id);
      const pessoaTel = normalizarTelefone(pessoa?.telefone);
      if (pessoaTel && pessoaTel === alvo) return c;
    }
    return null;
  }

  // ---- NPS (pesquisa de satisfação) ----

  getNpsWhatsApp(): PesquisaNpsItem[] {
    return this.npsWhatsApp
      .map((n) => {
        const conversa = this.conversasWhatsApp.find((c) => c.id === n.conversa_id);
        const cliente = n.cliente_id
          ? this.clientes.find((c) => c.id === n.cliente_id)
          : null;
        const pessoa = cliente ? this.pessoas.find((p) => p.id === cliente.pessoa_id) : null;
        return {
          ...n,
          cliente_nome: pessoa?.nome || n.cliente_nome || conversa?.nome_cliente || null,
        };
      })
      .sort(
        (a, b) => new Date(b.enviada_em).getTime() - new Date(a.enviada_em).getTime()
      );
  }

  addNpsWhatsApp(dados: Partial<PesquisaNpsItem>): PesquisaNpsItem {
    const nova: PesquisaNpsItem = {
      id: dados.id || `nps-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversa_id: dados.conversa_id!,
      cliente_id: dados.cliente_id || null,
      cliente_nome: dados.cliente_nome || null,
      etapa: dados.etapa || "geral",
      status: dados.status || "pendente",
      nota: dados.nota ?? null,
      comentario: dados.comentario || null,
      enviada_em: dados.enviada_em || new Date().toISOString(),
      respondida_em: dados.respondida_em || null,
    };
    this.npsWhatsApp.unshift(nova);
    return nova;
  }

  responderNpsWhatsApp(
    id: string,
    nota: number,
    comentario?: string | null
  ): PesquisaNpsItem | null {
    const index = this.npsWhatsApp.findIndex((n) => n.id === id);
    if (index === -1) return null;
    this.npsWhatsApp[index] = {
      ...this.npsWhatsApp[index],
      nota,
      comentario: comentario ?? this.npsWhatsApp[index].comentario,
      status: "respondida",
      respondida_em: new Date().toISOString(),
    };
    return this.npsWhatsApp[index];
  }

  getNpsPendentePorConversaWhatsApp(conversaId: string): PesquisaNpsItem | null {
    return (
      this.npsWhatsApp.find(
        (n) => n.conversa_id === conversaId && n.status === "pendente"
      ) || null
    );
  }

  // ---- LGPD: direito de exclusão ----

  removerConversaWhatsApp(id: string): boolean {
    const index = this.conversasWhatsApp.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.conversasWhatsApp.splice(index, 1);
    // Apaga também interações espelhadas e pesquisas vinculadas à conversa.
    this.interacoes = this.interacoes.filter(
      (i) => (i.dados_extra as { conversa_id?: string } | undefined)?.conversa_id !== id
    );
    this.npsWhatsApp = this.npsWhatsApp.filter((n) => n.conversa_id !== id);
    return true;
  }

  // ---- Auditoria de acesso (LGPD: log de quem acessou o histórico) ----

  registrarAcessoWhatsApp(
    dados: Partial<RegistroAcessoWhatsAppItem>
  ): RegistroAcessoWhatsAppItem {
    const novo: RegistroAcessoWhatsAppItem = {
      id:
        dados.id ||
        `acs-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversa_id: dados.conversa_id || "-",
      cliente: dados.cliente || "—",
      usuario: dados.usuario || "sistema",
      acao: dados.acao || "acesso",
      em: dados.em || new Date().toISOString(),
    };
    this.acessosWhatsApp.unshift(novo);
    return novo;
  }

  getAcessosWhatsApp(): RegistroAcessoWhatsAppItem[] {
    return [...this.acessosWhatsApp].sort(
      (a, b) => new Date(b.em).getTime() - new Date(a.em).getTime()
    );
  }

  getStats() {
    const totalClientes = this.clientes.length;
    const completudeMedia = totalClientes > 0
      ? Math.round(this.clientes.reduce((sum, c) => sum + Number(c.indice_completude || 0), 0) / totalClientes)
      : 0;
    const investidores = this.clientes.filter(
      (c) => c.finalidade_principal === "investimento" || c.finalidade_principal === "possivel_investidor"
    ).length;
    const tarefasPendentes = this.tarefas.filter(
      (t) => t.status === "pendente" || t.status === "em_andamento"
    ).length;
    const handoffsAtivos = this.handoffs.filter(
      (h) => h.status !== "concluido"
    ).length;
    const oportunidadesAtivas = this.oportunidades.filter(
      (o) => o.status !== "ganha" && o.status !== "perdida" && o.status !== "arquivada"
    ).length;
    const oportunidadesValor = this.oportunidades
      .filter((o) => o.status !== "ganha" && o.status !== "perdida" && o.status !== "arquivada")
      .reduce((sum, o) => sum + (o.valor_estimado || 0), 0);
    const investidoresPotenciais = this.clientes.filter(
      (c) => c.finalidade_principal === "possivel_investidor" || c.oportunidade_upsell
    ).length;

    return {
      totalClientes,
      completudeMedia,
      investidores,
      tarefasPendentes,
      handoffsAtivos,
      oportunidadesAtivas,
      oportunidadesValor,
      investidoresPotenciais,
    };
  }
}

// Global singleton for Next.js dev server persistence
const globalForStorage = globalThis as unknown as {
  storageFallbackInstance?: StorageMemoryFallback;
};

export const storageFallback =
  globalForStorage.storageFallbackInstance || new StorageMemoryFallback();

if (process.env.NODE_ENV !== "production") {
  globalForStorage.storageFallbackInstance = storageFallback;
}
