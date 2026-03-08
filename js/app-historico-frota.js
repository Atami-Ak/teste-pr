import { obterHistoricoFrota } from "./db.js";
import { frotaDB } from "./dados-frota.js";

const params = new URLSearchParams(window.location.search);
const idVeiculoFiltro = params.get("id");

const listaEl = document.getElementById("lista-historico");
const overlay = document.getElementById("overlay");

let historicoGlobal = [];

async function carregarHistorico() {
    try {
        let historico = await obterHistoricoFrota();
        overlay.classList.add("hidden");

        // Se veio de um clique num veículo específico, filtra a lista
        if (idVeiculoFiltro) {
            historico = historico.filter(h => h.idVeiculo === idVeiculoFiltro);
            const veiculoInfo = frotaDB.find(v => v.id === idVeiculoFiltro);
            if (veiculoInfo) {
                document.getElementById("titulo-historico").innerHTML = `Revisões: <span style="color:#64748b;">${veiculoInfo.placa}</span>`;
            }
        }

        historicoGlobal = historico;

        if (historico.length === 0) {
            listaEl.innerHTML = "<p style='text-align:center; color:#666; background: #f8fafc; padding: 30px; border-radius: 8px;'>Nenhuma inspeção registada.</p>";
            return;
        }

        historico.forEach(reg => {
            const veiculoObj = frotaDB.find(v => v.id === reg.idVeiculo);
            const placa = veiculoObj ? veiculoObj.placa : "Desconhecido";
            const modelo = veiculoObj ? veiculoObj.modelo : "";
            
            const classeCard = reg.possuiAvaria ? "historico-card status-avaria" : "historico-card status-ok";
            const iconeAvaria = reg.possuiAvaria ? "🚨 REGISTRO DE AVARIA" : "✅ TUDO CONFORME";
            const corAvaria = reg.possuiAvaria ? "#dc2626" : "#059669";
            
            const badgeNat = reg.natureza === "Saída" ? "badge-saida" : "badge-retorno";
            const iconeNat = reg.natureza === "Saída" ? "🛫" : "🛬";

            // Se tiver avaria, cria uma caixa de destaque
            let htmlDetalheAvaria = "";
            if (reg.possuiAvaria) {
                htmlDetalheAvaria = `
                    <div style="background: #fff5f5; border: 1px dashed #f87171; padding: 10px; border-radius: 6px; margin-bottom: 12px; font-size: 0.85rem; color: #991b1b;">
                        <strong>Problema Reportado:</strong> <br>
                        ${reg.detalhesAvaria || "Verificar relatório."}
                    </div>
                `;
            }

            const card = document.createElement("div");
            card.className = classeCard;
            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <h3 style="color: var(--primary); margin: 0 0 5px 0; font-size: 1.2rem;">${placa} <span style="font-size:0.8rem; color:#666;">${modelo}</span></h3>
                        <span style="font-size: 0.85rem; color: #64748b;">📅 ${reg.data} às ${reg.hora}</span>
                    </div>
                    <span class="badge-natureza ${badgeNat}">${iconeNat} ${reg.natureza}</span>
                </div>
                
                <div style="font-size: 0.85rem; color: #334155; margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                    <div><strong>👷 Condutor:</strong><br> ${reg.motorista}</div>
                    <div><strong>🛣️ Rota:</strong><br> ${reg.destino}</div>
                    <div style="grid-column: span 2;"><strong>⏱️ KM Atual:</strong> ${reg.kmAtual || '---'}</div>
                </div>

                <div style="font-size: 0.95rem; font-weight: bold; color: ${corAvaria}; margin-bottom: ${reg.possuiAvaria ? '8px' : '10px'};">
                    ${iconeAvaria}
                </div>
                
                ${htmlDetalheAvaria}

                <button class="btn-ver-detalhes" onclick="abrirModalDetalhes('${reg.id}')">
                    📄 Ver Relatório Completo
                </button>
            `;
            listaEl.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        overlay.classList.add("hidden");
        listaEl.innerHTML = "<p style='color:red;'>Erro ao carregar histórico.</p>";
    }
}

// FUNÇÕES DO MODAL
window.abrirModalDetalhes = function (idReg) {
    const reg = historicoGlobal.find(r => r.id === idReg);
    if (!reg) return;

    const veiculoObj = frotaDB.find(v => v.id === reg.idVeiculo);
    
    document.getElementById("mod-veiculo").textContent = veiculoObj ? `${veiculoObj.placa} - ${veiculoObj.modelo}` : reg.idVeiculo;
    document.getElementById("mod-data").textContent = `${reg.data} às ${reg.hora}`;
    document.getElementById("mod-motorista").textContent = reg.motorista;
    document.getElementById("mod-km").textContent = reg.kmAtual;
    document.getElementById("mod-rota").textContent = `${reg.natureza} p/ ${reg.destino}`;

    const boxStatus = document.getElementById("box-status");
    if (reg.possuiAvaria) {
        document.getElementById("mod-status").innerHTML = `<span style="color: #dc2626;">🚨 Avaria Reportada</span>`;
        boxStatus.style.border = "2px solid #ef4444";
        
        // Exibe a foto
        const boxFoto = document.getElementById("mod-foto-container");
        boxFoto.style.display = "block";
        document.getElementById("mod-desc-avaria").textContent = `"${reg.detalhesAvaria}"`;
        document.getElementById("mod-foto").src = reg.fotoUrl || "";
    } else {
        document.getElementById("mod-status").innerHTML = `<span style="color: #059669;">✅ Conforme</span>`;
        boxStatus.style.border = "2px solid #10b981";
        document.getElementById("mod-foto-container").style.display = "none";
    }

    // Tabela
    const tbody = document.getElementById("mod-tbody");
    tbody.innerHTML = "";

    if (reg.checklistAvaliado) {
        reg.checklistAvaliado.forEach(item => {
            let iconeResp = item.status === "C" ? "✅ Conforme" : "❌ N/C";
            let corFundo = item.status === "C" ? "#f0fdf4" : "#fef2f2";
            let corTexto = item.status === "C" ? "#065f46" : "#991b1b";

            const tr = document.createElement("tr");
            tr.style.backgroundColor = corFundo;
            tr.innerHTML = `
                <td style="font-weight: 600; color: #475569;">${item.item}</td>
                <td style="text-align: center; font-weight: bold; color: ${corTexto};">${iconeResp}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById("modal-detalhes").classList.add("active");
};

window.fecharModal = function () {
    document.getElementById("modal-detalhes").classList.remove("active");
};

window.onclick = function (event) {
    const modal = document.getElementById("modal-detalhes");
    if (event.target === modal) fecharModal();
};

document.addEventListener("DOMContentLoaded", carregarHistorico);