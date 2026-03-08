import { catalogoZonas, equipeLimpeza } from "./dados-limpeza.js";
import { salvarAuditoriaLimpeza } from "./db.js";

const params = new URLSearchParams(window.location.search);
const zonaIdUrl = params.get("zona_id");

if (!zonaIdUrl) {
  alert("Zona não identificada. Retornando ao painel.");
  window.location.href = "limpeza.html";
}

let checklistZona = [];
window.fotosPorPergunta = {}; // Dicionário que guarda a foto de cada pergunta

const zonaAtual = catalogoZonas.find((z) => z.id === zonaIdUrl);
if (zonaAtual) {
  document.getElementById("display-id").textContent = zonaAtual.id;
  document.getElementById(
    "display-nome"
  ).textContent = `${zonaAtual.icone} ${zonaAtual.nome}`;
  document.getElementById("display-desc").textContent = zonaAtual.descricao;

  checklistZona = zonaAtual.checklist || [];
  renderizarChecklist();
}

const responsaveisIDs = zonaAtual.responsaveis || [];
let responsaveisDaZona = equipeLimpeza.filter((func) =>
  responsaveisIDs.includes(func.id)
);
if (responsaveisDaZona.length === 0) responsaveisDaZona = equipeLimpeza;

const nomesParaExibir = responsaveisDaZona.map((f) => f.nome).join(", ");
document.getElementById(
  "funcionario-avaliado-display"
).textContent = `👷 ${nomesParaExibir}`;
document.getElementById("funcionario-avaliado-id").value =
  responsaveisDaZona[0].id;

function renderizarChecklist() {
  const container = document.getElementById("checklist-container");
  container.innerHTML = "";

  checklistZona.forEach((item, index) => {
    let corPeso = "#64748b";
    let descPeso = "Baixo";
    if (item.peso >= 4) {
      corPeso = "#dc2626";
      descPeso = "Crítico";
    } else if (item.peso === 3) {
      corPeso = "#d97706";
      descPeso = "Médio";
    }

    const div = document.createElement("div");
    div.className = "checklist-item";
    div.innerHTML = `
        <span class="checklist-pergunta">${index + 1}. ${item.texto} <br>
        <small style="color:${corPeso}; font-weight:bold;">(Peso ${
      item.peso
    }: ${descPeso})</small></span>
        
        <div class="radios-group">
            <label class="radio-label">
                <input type="radio" name="chk_${
                  item.id
                }" value="1" onchange="calcularNotaFinal()"> 👍 Sim
            </label>
            <label class="radio-label">
                <input type="radio" name="chk_${
                  item.id
                }" value="0" onchange="calcularNotaFinal()"> 👎 Não
            </label>
            <label class="radio-label">
                <input type="radio" name="chk_${
                  item.id
                }" value="NA" onchange="calcularNotaFinal()"> ➖ N/A
            </label>
        </div>

        <div style="display: flex; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
            <label for="foto_${
              item.id
            }" class="btn-camera-small">📸 Anexar Foto</label>
            <input type="file" id="foto_${
              item.id
            }" accept="image/*" capture="environment" hidden onchange="anexarFotoLocal('${
      item.id
    }', this)">
            <div id="preview_${item.id}" class="preview-small"></div>
        </div>
    `;
    container.appendChild(div);
  });
}

// Lógica de Leitura de Foto Individual
window.anexarFotoLocal = function (idPergunta, inputElement) {
  if (inputElement.files && inputElement.files[0]) {
    const file = inputElement.files[0];
    window.fotosPorPergunta[idPergunta] = file; // Guarda o ficheiro ligado à pergunta

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById(`preview_${idPergunta}`).innerHTML = `
        <div style="position: relative; display: inline-block;">
            <img src="${e.target.result}" title="Evidência Capturada">
            <button type="button" onclick="removerFotoLocal('${idPergunta}')" 
                    style="position: absolute; top: -5px; right: -5px; background: #dc2626; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: bold;">
              X
            </button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }
};

// NOVA FUNÇÃO: Remover a foto individual
window.removerFotoLocal = function (idPergunta) {
  // 1. Remove da memória
  delete window.fotosPorPergunta[idPergunta];

  // 2. Limpa o input file (para permitir que a mesma foto seja re-escolhida se necessário)
  const inputFile = document.getElementById(`foto_${idPergunta}`);
  if (inputFile) inputFile.value = "";

  // 3. Remove a imagem da tela
  document.getElementById(`preview_${idPergunta}`).innerHTML = "";
};

window.calcularNotaFinal = function () {
  let pontosObtidos = 0;
  let pontosPossiveis = 0;
  let todasRespondidas = true;
  let respostasApuradas = [];

  checklistZona.forEach((item) => {
    const radioSelecionado = document.querySelector(
      `input[name="chk_${item.id}"]:checked`
    );
    const peso = item.peso || 1;

    if (!radioSelecionado) {
      todasRespondidas = false;
    } else {
      const valor = radioSelecionado.value;
      respostasApuradas.push({
        idPergunta: item.id,
        pergunta: item.texto,
        resposta: valor,
        peso: peso,
      });

      if (valor === "1") {
        pontosObtidos += peso;
        pontosPossiveis += peso;
      } else if (valor === "0") {
        pontosPossiveis += peso; // Perdeu pontos
      }
    }
  });

  const notaDisplay = document.getElementById("nota-valor");
  const notaInput = document.getElementById("nota-final-input");
  const statusInput = document.getElementById("status-final-input");
  const labelStatus = document.getElementById("status-calculado");
  const btnSalvar = document.getElementById("btn-salvar");

  if (todasRespondidas) {
    btnSalvar.disabled = false;
    btnSalvar.style.opacity = "1";
    btnSalvar.textContent = "SALVAR AUDITORIA";

    let notaCalculada = 10.0;
    if (pontosPossiveis > 0)
      notaCalculada = (pontosObtidos / pontosPossiveis) * 10;

    const notaArredondada = notaCalculada.toFixed(1);
    notaDisplay.textContent = notaArredondada;
    notaInput.value = notaArredondada;

    if (notaCalculada >= 8.5) {
      notaDisplay.style.color = "var(--success)";
      notaDisplay.style.borderColor = "var(--success)";
      statusInput.value = "Conforme";
      labelStatus.innerHTML = `Status: <span style="color:var(--success);">🟢 Limpo / Conforme</span>`;
    } else if (notaCalculada >= 5.0) {
      notaDisplay.style.color = "var(--warning)";
      notaDisplay.style.borderColor = "var(--warning)";
      statusInput.value = "Atencao";
      labelStatus.innerHTML = `Status: <span style="color:var(--warning);">🟡 Requer Atenção</span>`;
    } else {
      notaDisplay.style.color = "var(--danger)";
      notaDisplay.style.borderColor = "var(--danger)";
      statusInput.value = "Critico";
      labelStatus.innerHTML = `Status: <span style="color:var(--danger);">🔴 Crítico / Sujo</span>`;
    }
  } else {
    notaDisplay.textContent = "0.0";
    notaDisplay.style.color = "#cbd5e1";
    notaDisplay.style.borderColor = "#cbd5e1";
    labelStatus.innerHTML = "Status: Aguardando preenchimento total...";
    btnSalvar.disabled = true;
    btnSalvar.style.opacity = "0.5";
    btnSalvar.textContent = "PREENCHA O CHECKLIST";
  }

  window.respostasAuditoria = respostasApuradas;
};

const overlay = document.getElementById("overlay");

document
  .getElementById("form-limpeza")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const notaCalculada = document.getElementById("nota-final-input").value;
    const statusFinal = document.getElementById("status-final-input").value;

    if (!notaCalculada || !statusFinal)
      return alert("Responda a todas as perguntas.");

    if (overlay) overlay.classList.remove("hidden");

    // Prepara as fotos para o db.js fazer o upload
    const arquivosParaUpload = [];
    for (const [idPergunta, file] of Object.entries(window.fotosPorPergunta)) {
      arquivosParaUpload.push({ idPergunta: idPergunta, file: file });
    }

    const payloadAuditoria = {
      zonaId: zonaAtual.id,
      subLocal: "Geral",
      funcionarioAvaliado: document.getElementById("funcionario-avaliado-id")
        .value,
      statusVisual: statusFinal,
      notaLimpeza: parseFloat(notaCalculada),
      checklistDetalhado: window.respostasAuditoria || [],
      observacoes: document.getElementById("observacoes").value.trim(),
      arquivosParaUpload: arquivosParaUpload, // Array especial lido pelo db.js
    };

    try {
      await salvarAuditoriaLimpeza(payloadAuditoria);
      if (overlay) overlay.classList.add("hidden");
      alert(`✅ Auditoria salva! Nota Final: ${payloadAuditoria.notaLimpeza}`);
      window.location.href = "limpeza.html";
    } catch (error) {
      console.error(error);
      if (overlay) overlay.classList.add("hidden");
      alert("Erro ao salvar auditoria. Verifique a ligação à internet.");
    }
  });
