import { obterTodasAuditoriasLimpeza } from "./db.js";
import { catalogoZonas, equipeLimpeza } from "./dados-limpeza.js";

const params = new URLSearchParams(window.location.search);
const zonaIdFiltro = params.get("zona_id");

const listaEl = document.getElementById("lista-auditorias");
const overlay = document.getElementById("overlay");

// Variável para guardar os dados e podermos abri-los no modal sem ter de ir à BD de novo
let auditoriasGlobais = [];

async function carregarRevisoes() {
  try {
    let auditorias = await obterTodasAuditoriasLimpeza();
    overlay.classList.add("hidden");

    if (zonaIdFiltro) {
      auditorias = auditorias.filter((a) => a.zonaId === zonaIdFiltro);
      const zonaObj = catalogoZonas.find((z) => z.id === zonaIdFiltro);
      const tituloH2 = document.querySelector("main h2");
      if (tituloH2 && zonaObj) {
        tituloH2.innerHTML = `Livro de Revisões: <span style="color: #475569;">${zonaObj.nome}</span>`;
      }
    }

    auditoriasGlobais = auditorias;

    if (auditorias.length === 0) {
      listaEl.innerHTML =
        "<p style='text-align:center; color:#666; background: #f8fafc; padding: 30px; border-radius: 8px;'>Nenhuma revisão encontrada para este filtro.</p>";
      return;
    }

    auditorias.forEach((aud) => {
      const zonaObj = catalogoZonas.find((z) => z.id === aud.zonaId);
      const funcObj = equipeLimpeza.find((f) => f.id === aud.funcionarioAvaliado);

      const nomeZona = zonaObj ? zonaObj.nome : aud.zonaId;
      const nomeFunc = funcObj ? funcObj.nome : aud.funcionarioAvaliado;
      const dataStr = new Date(aud.timestampEnvio || Date.now()).toLocaleDateString("pt-BR") + " às " + new Date(aud.timestampEnvio || Date.now()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      let classeNota = "nota-baixa";
      let corBorda = "var(--danger)";
      if (aud.notaLimpeza >= 8.5) { classeNota = "nota-alta"; corBorda = "var(--success)"; } 
      else if (aud.notaLimpeza >= 5.0) { classeNota = "nota-media"; corBorda = "var(--warning)"; }

      let evidenciasHtml = "";
      if (aud.checklistDetalhado && aud.checklistDetalhado.length > 0) {
        const inconformidades = aud.checklistDetalhado.filter((q) => q.fotoUrl);
        if (inconformidades.length > 0) {
          const imagens = inconformidades.map((inc) => `<img src="${inc.fotoUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;">`).join("");
          evidenciasHtml = `<div style="display: flex; gap: 5px; margin-top: 10px;">${imagens}</div>`;
        }
      }

      const card = document.createElement("div");
      card.className = "auditoria-card";
      card.style.borderLeftColor = corBorda;

      card.innerHTML = `
            <div class="auditoria-header">
                <div>
                    <h3 style="color: var(--primary); margin-bottom: 5px;">${nomeZona}</h3>
                    <span style="font-size: 0.85rem; color: #64748b;">📅 ${dataStr}</span>
                </div>
                <div class="auditoria-nota ${classeNota}">${aud.notaLimpeza.toFixed(1)}</div>
            </div>
            <div style="font-size: 0.9rem; margin-bottom: 5px;">
                <strong>👷 Responsável:</strong> ${nomeFunc}
            </div>
            ${evidenciasHtml}
            <button class="btn-ver-detalhes" onclick="abrirModalDetalhes('${aud.id}')">
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

// FUNÇÕES GLOBAIS DO MODAL
window.abrirModalDetalhes = function (idAuditoria) {
  const aud = auditoriasGlobais.find((a) => a.id === idAuditoria);
  if (!aud) return;

  const zonaObj = catalogoZonas.find((z) => z.id === aud.zonaId);
  const funcObj = equipeLimpeza.find((f) => f.id === aud.funcionarioAvaliado);

  // Preenche o Cabeçalho
  document.getElementById("mod-zona").textContent = zonaObj ? zonaObj.nome : aud.zonaId;
  document.getElementById("mod-data").textContent = new Date(aud.timestampEnvio || Date.now()).toLocaleDateString("pt-BR") + " " + new Date(aud.timestampEnvio || Date.now()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("mod-resp").textContent = funcObj ? funcObj.nome : aud.funcionarioAvaliado;
  
  const elNota = document.getElementById("mod-nota");
  elNota.textContent = aud.notaLimpeza.toFixed(1);
  if (aud.notaLimpeza >= 8.5) elNota.style.color = "var(--success)";
  else if (aud.notaLimpeza >= 5.0) elNota.style.color = "var(--warning)";
  else elNota.style.color = "var(--danger)";

  document.getElementById("mod-obs").textContent = aud.observacoes || "Nenhum parecer geral registado.";

  // Desenha a Tabela de Perguntas
  const tbody = document.getElementById("mod-tbody");
  tbody.innerHTML = "";

  if (aud.checklistDetalhado && aud.checklistDetalhado.length > 0) {
    aud.checklistDetalhado.forEach((item, index) => {
      let iconeResp = "➖ N/A";
      let corFundo = "";
      
      if (item.resposta === "1") { 
          iconeResp = "👍 Sim"; 
          corFundo = "#f0fdf4"; // Fundo verde claro
      } else if (item.resposta === "0") { 
          iconeResp = "👎 Não"; 
          corFundo = "#fef2f2"; // Fundo vermelho claro
      }

      let fotoHtml = "<span style='color:#cbd5e1;'>Sem foto</span>";
      if (item.fotoUrl) {
          fotoHtml = `<a href="${item.fotoUrl}" target="_blank" title="Clique para ampliar"><img src="${item.fotoUrl}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; transition: 0.2s;"></a>`;
      }

      const tr = document.createElement("tr");
      tr.style.backgroundColor = corFundo;
      tr.innerHTML = `
          <td style="font-weight: bold; color: #64748b;">${index + 1}</td>
          <td>${item.pergunta} <br><small style="color:#94a3b8;">Peso: ${item.peso || 1}</small></td>
          <td style="text-align: center; font-weight: bold;">${iconeResp}</td>
          <td style="text-align: center;">${fotoHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:#666; padding: 20px;'>Checklist não detalhado nesta auditoria antiga.</td></tr>";
  }

  document.getElementById("modal-detalhes").classList.add("active");
};

window.fecharModal = function () {
  document.getElementById("modal-detalhes").classList.remove("active");
};

// Fecha o modal ao clicar na área escura (fora da caixa branca)
window.onclick = function (event) {
  const modal = document.getElementById("modal-detalhes");
  if (event.target === modal) {
    fecharModal();
  }
};

document.addEventListener("DOMContentLoaded", carregarRevisoes);