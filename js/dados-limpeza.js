export const equipeLimpeza = [
  { id: "LIMP-001", nome: "João Silva" },
  { id: "LIMP-002", nome: "Maria Oliveira" },
  { id: "LIMP-003", nome: "Carlos Santos" },
  { id: "LIMP-004", nome: "Ana Costa" },
];

export const catalogoZonas = [
  {
    id: "ZONA-01",
    nome: "Estoque",
    icone: "📦",
    descricao: "Área de armazenamento de produtos acabados e expedição.",
    responsaveis: ["LIMP-001", "LIMP-002"],
    checklist: [
      {
        id: "z1_q1",
        texto: "Corredores de circulação estão livres e desobstruídos?",
        peso: 4,
      },
      {
        id: "z1_q2",
        texto: "Extintores e hidrantes livres de bloqueios? (Crítico)",
        peso: 5,
      },
      {
        id: "z1_q3",
        texto: "Paletes alinhados rigorosamente dentro das marcações?",
        peso: 3,
      },
      {
        id: "z1_q4",
        texto: "Piso varrido, sem poeira excessiva, plásticos ou lascas?",
        peso: 2,
      },
      {
        id: "z1_q5",
        texto: "Produtos identificados e com rótulos virados para a frente?",
        peso: 2,
      },
      {
        id: "z1_q6",
        texto: "Ausência de materiais obsoletos ou sucata fora do lugar?",
        peso: 3,
      },
      {
        id: "z1_q7",
        texto: "Empilhadeiras/Carrinhos estacionados na vaga correta?",
        peso: 2,
      },
      {
        id: "z1_q8",
        texto: "Lixeiras da área de expedição foram esvaziadas?",
        peso: 1,
      },
      {
        id: "z1_q9",
        texto: "Iluminação adequada e luminárias limpas?",
        peso: 1,
      },
      {
        id: "z1_q10",
        texto: "Ausência de teias de aranha e ninhos de insetos?",
        peso: 2,
      },
    ],
  },
  {
    id: "ZONA-02",
    nome: "Maquinários",
    icone: "⚙️",
    descricao: "Chão de fábrica e entorno dos equipamentos de produção.",
    responsaveis: ["LIMP-003"],
    checklist: [
      {
        id: "z2_q1",
        texto: "Piso livre de óleo, graxa ou água (Risco de Queda)?",
        peso: 5,
      },
      {
        id: "z2_q2",
        texto:
          "Painéis elétricos fechados e sem acúmulo de pó (Risco de Incêndio)?",
        peso: 5,
      },
      {
        id: "z2_q3",
        texto: "Máquinas sem acúmulo excessivo de pó ou restos de produto?",
        peso: 4,
      },
      {
        id: "z2_q4",
        texto:
          "Inexistência de gambiarras elétricas (fios soltos, fitas isolantes)?",
        peso: 4,
      },
      {
        id: "z2_q5",
        texto: "Ferramentas guardadas corretamente no Quadro de Sombras?",
        peso: 3,
      },
      {
        id: "z2_q6",
        texto: "Calhas e ralos de escoamento estão limpos e sem bloqueios?",
        peso: 3,
      },
      {
        id: "z2_q7",
        texto: "Lixeiras de descarte de contaminação esvaziadas?",
        peso: 2,
      },
      {
        id: "z2_q8",
        texto: "Fitas de demarcação de segurança visíveis e não rasgadas?",
        peso: 1,
      },
      {
        id: "z2_q9",
        texto: "EPIs de uso coletivo disponíveis, limpos e bem acondicionados?",
        peso: 2,
      },
      {
        id: "z2_q10",
        texto: "Bancadas de trabalho organizadas (apenas ferramentas em uso)?",
        peso: 2,
      },
    ],
  },
  {
    id: "ZONA-03",
    nome: "Insumos",
    icone: "🌾",
    descricao: "Área de recebimento e armazenamento de matérias-primas.",
    responsaveis: ["LIMP-004"],
    checklist: [
      {
        id: "z3_q1",
        texto:
          "Ausência total de pragas, fezes de roedores ou insetos? (Crítico)",
        peso: 5,
      },
      {
        id: "z3_q2",
        texto: "Sacarias íntegras e sem vazamentos de produto no chão?",
        peso: 4,
      },
      {
        id: "z3_q3",
        texto: "Identificação de validade visível (Sistema FIFO aplicado)?",
        peso: 4,
      },
      {
        id: "z3_q4",
        texto: "Balanças e dosadores foram higienizados após o uso?",
        peso: 3,
      },
      {
        id: "z3_q5",
        texto: "Área varrida e sem restos de mistura espalhados no piso?",
        peso: 3,
      },
      {
        id: "z3_q6",
        texto: "Janelas e portas mantidas fechadas ou teladas?",
        peso: 3,
      },
      {
        id: "z3_q7",
        texto: "Sem ferramentas esquecidas perto das moegas (Risco de quebra)?",
        peso: 3,
      },
      {
        id: "z3_q8",
        texto: "Paletes de madeira em bom estado, sem pregos soltos?",
        peso: 2,
      },
      {
        id: "z3_q9",
        texto: "Estrados plásticos limpos e não quebrados?",
        peso: 1,
      },
      { id: "z3_q10", texto: "Lixeiras da área esvaziadas?", peso: 1 },
    ],
  },
  {
    id: "ZONA-04",
    nome: "Áreas de Apoio",
    icone: "🚻",
    descricao: "Banheiros, Oficinas, Almoxarifados e Refeitórios.",
    responsaveis: ["LIMP-001", "LIMP-002", "LIMP-003", "LIMP-004"],
    checklist: [
      {
        id: "z4_q1",
        texto: "Vasos sanitários e mictórios higienizados e sem odores?",
        peso: 4,
      },
      {
        id: "z4_q2",
        texto: "Geladeira/Micro-ondas sem alimentos vencidos ou derramados?",
        peso: 4,
      },
      {
        id: "z4_q3",
        texto: "Mesas do refeitório limpas, sem restos de comida?",
        peso: 3,
      },
      {
        id: "z4_q4",
        texto: "Piso lavado/pano passado e não apresenta manchas ou lodo?",
        peso: 3,
      },
      {
        id: "z4_q5",
        texto:
          "Saboneteiras e papéis (toalha/higiênico) devidamente abastecidos?",
        peso: 3,
      },
      {
        id: "z4_q6",
        texto: "Pias limpas, sem restos de sabão, barba ou sujeira?",
        peso: 2,
      },
      {
        id: "z4_q7",
        texto: "Lixeiras comuns e recicláveis esvaziadas com sacos trocados?",
        peso: 2,
      },
      {
        id: "z4_q8",
        texto: "Oficina de manutenção com as bancadas limpas e organizadas?",
        peso: 2,
      },
      {
        id: "z4_q9",
        texto: "Almoxarifado sem caixas rasgadas ou peças atiradas no chão?",
        peso: 2,
      },
      {
        id: "z4_q10",
        texto: "Espelhos e vidros limpos e sem marcas de respingos?",
        peso: 1,
      },
    ],
  },
];
