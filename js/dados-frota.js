// Dicionário Central da Frota
export const frotaDB = [
    { id: "VEIC-01", placa: "ABC-1234", modelo: "VW Constellation 24.280", categoria: "Caminhões Truck / Baú", icone: "🚛", motoristaPadrao: "João Silva" },
    { id: "VEIC-02", placa: "XYZ-9876", modelo: "VW Delivery 11.180", categoria: "Caminhões Truck / Baú", icone: "🚛", motoristaPadrao: "Carlos Santos" },
    { id: "VEIC-03", placa: "PRR-2024", modelo: "VW Constellation 17.230", categoria: "Caminhões Caçamba", icone: "🚚", motoristaPadrao: "Fernando Alves" },
    { id: "VEIC-04", placa: "SIG-0001", modelo: "Fiat Strada Endurance", categoria: "Carros Leves", icone: "🚗" }, 
    { id: "VEIC-05", placa: "RTY-5555", modelo: "Honda CG 160 Titan", categoria: "Motos", icone: "🏍️" } 
];

// O Checklist Oficial Padrão (Caminhões e Carros)
export const checklistPadrao = [
    {
        grupo: "1. Condições da Cabine / Interior",
        itens: [
            "Chave Veículo", "Bancos", "Ar Condicionado", "CD Player e Sistema de Som", 
            "Painel", "Tapetes", "Limpador Parabrisa", "Esguichos Parabrisa", 
            "Revestimento Interno", "Limpeza Interna", "Luz de Cabine", "Interclima"
        ]
    },
    {
        grupo: "2. Segurança e Elétrica",
        itens: [
            "Botões de Funções", "Luzes Advertência Painel", "Buzina", 
            "Vidro Janela Esquerda", "Vidro Janela Direita", "Retrovisor Esquerdo", 
            "Retrovisor Direito", "Luz Seta Dianteira"
        ]
    },
    {
        grupo: "3. Kit de Viagem (Acessórios)",
        itens: [
            "Rede", "Facão", "Ferramentas", "Pistola de Ar", 
            "Garrafa Térmica", "Lona para Forro"
        ]
    }
];

// Checklist Exclusivo e Aprimorado para Motos
export const checklistMoto = [
    {
        grupo: "1. Estrutura e Ciclística",
        itens: [
            "Chave da Moto", "Painel de Instrumentos", "Pneus (Calibragem e Desgaste)", 
            "Rodas e Raios", "Corrente / Relação (Tensão/Lubrificação)", 
            "Freio Dianteiro", "Freio Traseiro"
        ]
    },
    {
        grupo: "2. Motor e Desempenho", // NOVO: Foco total no motor
        itens: [
            "Nível de Óleo do Motor", "Sem Vazamentos (Óleo/Combustível)?", 
            "Ausência de Ruídos Anormais no Motor?", "Sistema de Escapamento (Fixação/Fumaça)", 
            "Acionamento da Embreagem", "Marcha Lenta e Aceleração"
        ]
    },
    {
        grupo: "3. Segurança e Elétrica",
        itens: [
            "Farol Dianteiro (Alto e Baixo)", "Lanterna Traseira / Luz de Freio", 
            "Setas (Direita e Esquerda)", "Buzina", "Retrovisores (Alinhamento)"
        ]
    },
    {
        grupo: "4. Acessórios e Equipamentos",
        itens: [
            "Baú (Tranca e Fixação)", "Antena Corta-Pipa", "Capacete (Viseira e Cinta)",
            "Capa de Chuva"
        ]
    }
];