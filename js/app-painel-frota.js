import { frotaDB } from "./dados-frota.js";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("frota-container");
    
    // Extrai todas as categorias únicas do banco de dados
    const categorias = [...new Set(frotaDB.map(v => v.categoria))];

    categorias.forEach(cat => {
        // Filtra os veículos desta categoria
        const veiculosDaCategoria = frotaDB.filter(v => v.categoria === cat);
        const iconeCategoria = veiculosDaCategoria[0].icone;

        const section = document.createElement("div");
        section.className = "categoria-section";
        
        let htmlVeiculos = "";
        veiculosDaCategoria.forEach(v => {
            
            // Lógica: Só desenha a caixa de "Responsável" se o motoristaPadrao existir!
            let htmlResponsavel = "";
            if (v.motoristaPadrao) {
                htmlResponsavel = `
                <div style="font-size: 0.85rem; background: #f8fafc; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0; color: #475569;">
                    <strong>👷 Responsável:</strong> ${v.motoristaPadrao}
                </div>`;
            }

            htmlVeiculos += `
                <div class="card-veiculo" 
                     style="display: flex; flex-direction: column; gap: 12px; cursor: pointer; align-items: stretch; justify-content: flex-start;" 
                     onclick="window.location.href='historico-frota.html?id=${v.id}'"
                     title="Ver Histórico de Inspeções">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="veiculo-info">
                            <h4 style="margin: 0 0 5px 0; font-size: 1.3rem; color: var(--primary);">${v.placa}</h4>
                            <p style="margin: 0; font-size: 0.85rem; color: #64748b;">${v.modelo}</p>
                        </div>
                        <div class="icon-veiculo" style="font-size: 1.8rem; background: #fffbeb; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #fde68a;">
                            ${v.icone}
                        </div>
                    </div>
                    
                    ${htmlResponsavel}

                    <button onclick="event.stopPropagation(); window.location.href='frota.html?id=${v.id}'" 
                            style="background: #f59e0b; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; transition: 0.2s; margin-top: auto;">
                        📋 Iniciar Checklist
                    </button>
                </div>
            `;
        });

        section.innerHTML = `
            <h3 class="categoria-titulo">${iconeCategoria} ${cat}</h3>
            <div class="grid-veiculos">
                ${htmlVeiculos}
            </div>
        `;
        
        container.appendChild(section);
    });
});