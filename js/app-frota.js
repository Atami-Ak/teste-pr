// =======================================================
// 1. BANCO DE DADOS LOCAL (MOCK) & CONFIGURAÇÃO
// =======================================================

// Simulação de 5 dos 22 veículos da frota
const frotaDB = [
    { id: "VEIC-01", placa: "ABC-1234", modelo: "VW Constellation 24.280" },
    { id: "VEIC-02", placa: "XYZ-9876", modelo: "VW Delivery 11.180" },
    { id: "VEIC-03", placa: "PRR-2024", modelo: "VW Constellation 17.230" },
    { id: "VEIC-04", placa: "SIG-0001", modelo: "VW Delivery 9.170" },
    { id: "VEIC-05", placa: "RTY-5555", modelo: "Volvo FH 460" }
];

// O Checklist Oficial Pro Raça (Baseado nas planilhas)
const checklistConfig = [
    {
        grupo: "1. Condições da Cabine",
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

// =======================================================
// 2. INICIALIZAÇÃO DA TELA
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    preencherDataHoraAtual();
    renderizarChecklistDinamico();
});

function preencherDataHoraAtual() {
    const agora = new Date();
    // Garante o formato correto para inputs type="date" e type="time"
    document.getElementById("data-inspecao").value = agora.toISOString().split('T')[0];
    document.getElementById("hora-inspecao").value = agora.toTimeString().substring(0,5);
}

// =======================================================
// 3. MOTOR DE BUSCA INTELIGENTE DE VEÍCULOS
// =======================================================
const inputBusca = document.getElementById("busca-veiculo");
const listaVeiculos = document.getElementById("lista-veiculos");
const inputVeiculoId = document.getElementById("veiculo-selecionado-id");

inputBusca.addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase().trim();
    listaVeiculos.innerHTML = "";
    
    // Só pesquisa se tiver 2 ou mais letras
    if (termo.length < 2) {
        listaVeiculos.classList.remove("active");
        return;
    }

    // Filtra placa ou modelo
    const filtrados = frotaDB.filter(v => 
        v.placa.toLowerCase().includes(termo) || 
        v.modelo.toLowerCase().includes(termo)
    );

    if (filtrados.length > 0) {
        listaVeiculos.classList.add("active");
        filtrados.forEach(v => {
            const div = document.createElement("div");
            div.className = "vehicle-item";
            div.innerHTML = `
                <span style="font-size: 1.1rem;">${v.placa}</span> 
                <span style="color:#64748b; font-size:0.85rem;">${v.modelo}</span>
            `;
            
            // Ação de clique na lista
            div.onclick = () => {
                inputBusca.value = `${v.placa} - ${v.modelo}`;
                inputVeiculoId.value = v.id;
                listaVeiculos.classList.remove("active");
                
                // Feedback visual de sucesso (Fica verde)
                inputBusca.style.borderColor = "var(--success)";
                inputBusca.style.backgroundColor = "#f0fdf4";
                inputBusca.style.fontWeight = "bold";
                inputBusca.style.color = "var(--success)";
            };
            listaVeiculos.appendChild(div);
        });
    } else {
        listaVeiculos.classList.remove("active");
    }
});

// Esconde a lista se o usuário clicar fora dela
document.addEventListener("click", (e) => {
    if(e.target !== inputBusca) listaVeiculos.classList.remove("active");
});

// =======================================================
// 4. GERAÇÃO DINÂMICA DO CHECKLIST
// =======================================================
function renderizarChecklistDinamico() {
    const container = document.getElementById("container-checklist");
    
    checklistConfig.forEach((categoria, indexCat) => {
        const divGrupo = document.createElement("div");
        divGrupo.className = "checklist-group";
        
        const titulo = document.createElement("h4");
        titulo.textContent = categoria.grupo;
        divGrupo.appendChild(titulo);

        categoria.itens.forEach((item, indexItem) => {
            const radioName = `chk_${indexCat}_${indexItem}`; // ID único para agrupar os Radios
            
            const divItem = document.createElement("div");
            divItem.className = "check-item";
            divItem.innerHTML = `
                <div class="check-label">${item}</div>
                <div class="check-actions">
                    <label class="radio-btn">
                        <input type="radio" name="${radioName}" value="C" data-item="${item}"> Conforme
                    </label>
                    <label class="radio-btn">
                        <input type="radio" name="${radioName}" value="NC" data-item="${item}"> N/C
                    </label>
                </div>
            `;
            divGrupo.appendChild(divItem);
        });

        container.appendChild(divGrupo);
    });
}

// =======================================================
// 5. GESTÃO DE EVIDÊNCIAS FOTOGRÁFICAS
// =======================================================
let arquivoEvidencia = null;
const fotoInput = document.getElementById("foto-avaria");
const previewFoto = document.getElementById("preview-foto");

fotoInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
        arquivoEvidencia = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            previewFoto.innerHTML = `<img src="${event.target.result}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px; border: 2px solid #ef4444; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">`;
        };
        reader.readAsDataURL(arquivoEvidencia);
    }
});

// =======================================================
// 6. VALIDAÇÃO INTELIGENTE (O CORAÇÃO DO SISTEMA)
// =======================================================
const formFrota = document.getElementById("form-frota");
const overlay = document.getElementById("overlay");

formFrota.addEventListener("submit", async (e) => {
    e.preventDefault();

    // TRAVA 1: Veículo Válido
    if (!inputVeiculoId.value) {
        alert("⚠️ Seleção Inválida: Por favor, pesquise e selecione um veículo na lista suspensa.");
        inputBusca.focus();
        return;
    }

    // Varredura das Respostas do Checklist
    let respostasChecklist = [];
    let itensNaoConformes = [];
    let totalItensOficiais = checklistConfig.reduce((acc, cat) => acc + cat.itens.length, 0);
    
    // Pega todos os radios marcados dentro do container de checklist
    const radiosMarcados = document.querySelectorAll('#container-checklist input[type="radio"]:checked');

    // TRAVA 2: Todas as perguntas respondidas
    if (radiosMarcados.length < totalItensOficiais) {
        alert(`⚠️ Incompleto: Faltam avaliar ${totalItensOficiais - radiosMarcados.length} itens no checklist.`);
        return;
    }

    radiosMarcados.forEach(radio => {
        const nomeItem = radio.getAttribute("data-item");
        respostasChecklist.push({ item: nomeItem, status: radio.value });

        if (radio.value === "NC") {
            itensNaoConformes.push(nomeItem);
        }
    });

    // TRAVA 3: Regra de Negócio Mestra (Justificativa e Foto Obrigatórias para NC)
    const txtAvaria = document.getElementById("descricao-avaria").value.trim();
    
    if (itensNaoConformes.length > 0) {
        if (txtAvaria.length < 5) {
            alert(`🛑 REGRA DE SEGURANÇA:\n\nVocê marcou o(s) seguinte(s) item(ns) como N/C:\n- ${itensNaoConformes.join("\n- ")}\n\nÉ OBRIGATÓRIO descrever a avaria.`);
            document.getElementById("descricao-avaria").focus();
            return;
        }
        if (!arquivoEvidencia) {
            alert(`📸 REGRA DE SEGURANÇA:\n\nÉ OBRIGATÓRIO anexar uma FOTO do defeito/falta do(s) item(ns) reprovado(s).`);
            return;
        }
    }

    // Monta o Pacote de Dados (JSON)
    const payload = {
        idVeiculo: inputVeiculoId.value,
        natureza: document.querySelector('input[name="natureza"]:checked').value,
        data: document.getElementById("data-inspecao").value,
        hora: document.getElementById("hora-inspecao").value,
        motorista: document.getElementById("nome-motorista").value,
        destino: document.getElementById("cidade-destino").value,
        kmAtual: parseFloat(document.getElementById("km-veiculo").value),
        abastecimentoLts: parseFloat(document.getElementById("abastecimento").value) || 0,
        checklistAvaliado: respostasChecklist,
        possuiAvaria: itensNaoConformes.length > 0,
        detalhesAvaria: txtAvaria,
        timestamp: Date.now()
    };

    // Fluxo de Gravação (Simulação Firebase)
    overlay.classList.remove("hidden");

    try {
        // Simula o tempo de upload da foto e gravação de DB
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        
        console.log("📦 DADOS ENVIADOS COM SUCESSO:", payload);
        
        overlay.classList.add("hidden");
        alert("✅ Checklist Registrado com Sucesso!\nBoa viagem e dirija com segurança.");
        
        // Limpa o formulário e reseta estados visuais
        formFrota.reset();
        inputVeiculoId.value = "";
        inputBusca.style.backgroundColor = "white";
        inputBusca.style.borderColor = "#cbd5e1";
        inputBusca.style.color = "#334155";
        previewFoto.innerHTML = "";
        arquivoEvidencia = null;
        preencherDataHoraAtual();
        window.scrollTo(0, 0);

    } catch (error) {
        console.error(error);
        overlay.classList.add("hidden");
        alert("❌ Erro de conexão ao salvar inspeção no servidor.");
    }
});