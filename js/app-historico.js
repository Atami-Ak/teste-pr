import { obterHistoricoMaquina } from "./db.js";

const params = new URLSearchParams(window.location.search);
const idMaquinaURL = params.get("id");
const nomeMaquinaURL = params.get("nome");

const displayId = document.getElementById("display-id");
const displayNome = document.getElementById("display-nome");
const listaHistorico = document.getElementById("lista-historico-completo");
const overlay = document.getElementById("overlay");
const filtroStatus = document.getElementById("filtro-status"); // NOVO

// Elementos dos KPIs
const kpiIntervencoes = document.getElementById("kpi-intervencoes");
const kpiHorasParadas = document.getElementById("kpi-horas-paradas");
const kpiPecas = document.getElementById("kpi-pecas");

const modal = document.getElementById("modal-relatorio");
const btnFecharModal = document.getElementById("btn-fechar-modal");
const modalCorpo = document.getElementById("modal-corpo");

let historicoGlobal = [];
let historicoFiltrado = []; // NOVO: Armazena os dados filtrados
let paginaAtual = 1;
const ITENS_POR_PAGINA = 10;

if (btnFecharModal && modal) {
  btnFecharModal.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

if (!idMaquinaURL) {
  alert("Máquina não identificada. Retornando ao painel.");
  window.location.href = "maquinario.html";
} else {
  displayId.textContent = idMaquinaURL;
  displayNome.textContent = nomeMaquinaURL || "Equipamento";
  carregarHistoricoInvestigacao();
}

function formatarDataHora(timestamp) {
  const data = new Date(timestamp);
  return (
    data.toLocaleDateString("pt-BR") +
    " às " +
    data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

function obterDataSegura(reg) {
  if (reg.timestampEnvio) return reg.timestampEnvio;
  if (reg.timestamp) return reg.timestamp;
  if (reg.dataCriacaoOficial) {
    if (typeof reg.dataCriacaoOficial.toMillis === "function")
      return reg.dataCriacaoOficial.toMillis();
    if (reg.dataCriacaoOficial.seconds)
      return reg.dataCriacaoOficial.seconds * 1000;
  }
  return Date.now();
}

// NOVO: Função isolada para recalcular os painéis de cima baseados na lista atual
function atualizarKPIs(lista) {
  let totalHorasParadas = 0;
  let totalPecasTrocadas = 0;

  lista.forEach((reg) => {
    const statusLabel = reg.diagnostico
      ? reg.diagnostico.statusFinal
      : reg.status;
    if (reg.diagnostico && reg.diagnostico.tempoParada) {
      totalHorasParadas += parseFloat(reg.diagnostico.tempoParada);
    }
    if (reg.estoque && reg.estoque.itens && statusLabel !== "Revisão") {
      reg.estoque.itens.forEach((item) => {
        totalPecasTrocadas += parseInt(item.quantidade);
      });
    }
  });

  kpiIntervencoes.textContent = lista.length;
  kpiHorasParadas.textContent = totalHorasParadas + "h";
  kpiPecas.textContent = totalPecasTrocadas;
}

// NOVO: Listener do Filtro
if (filtroStatus) {
  filtroStatus.addEventListener("change", (e) => {
    const valorFiltro = e.target.value;

    if (valorFiltro === "Todos") {
      historicoFiltrado = [...historicoGlobal];
    } else {
      historicoFiltrado = historicoGlobal.filter((reg) => {
        const status = reg.diagnostico
          ? reg.diagnostico.statusFinal
          : reg.status;
        return status === valorFiltro;
      });
    }

    atualizarKPIs(historicoFiltrado);
    renderizarPagina(1); // Volta para a página 1 ao filtrar
  });
}

async function carregarHistoricoInvestigacao() {
  try {
    let historico = await obterHistoricoMaquina(idMaquinaURL);
    overlay.classList.add("hidden");

    if (historico.length === 0) {
      listaHistorico.innerHTML = `<li style="text-align:center; padding: 20px; color: #666;">Nenhum registo encontrado para investigação.</li>`;
      return;
    }

    historico.sort((a, b) => obterDataSegura(b) - obterDataSegura(a));

    // Alimenta as listas mestras
    historicoGlobal = historico;
    historicoFiltrado = [...historicoGlobal];

    atualizarKPIs(historicoFiltrado);
    renderizarPagina(1);
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    overlay.classList.add("hidden");
    listaHistorico.innerHTML = `<li style="color: red; text-align: center;">Falha ao conectar com o banco de dados.</li>`;
  }
}

function renderizarPagina(pagina) {
  paginaAtual = pagina;
  listaHistorico.innerHTML = "";

  // NOVO: Tratamento se o filtro não encontrar nada
  if (historicoFiltrado.length === 0) {
    listaHistorico.innerHTML = `<li style="text-align:center; padding: 30px; color: #666; background: #f8fafc; border-radius: 8px;">Nenhum registo encontrado com este filtro.</li>`;
    renderizarControlesPaginacao();
    return;
  }

  const inicio = (pagina - 1) * ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const itensPagina = historicoFiltrado.slice(inicio, fim);

  itensPagina.forEach((reg) => {
    const relato = reg.diagnostico ? reg.diagnostico.relatorio : reg.relatorio;
    const statusLabel = reg.diagnostico
      ? reg.diagnostico.statusFinal
      : reg.status;
    const tecnico = reg.dadosOperador ? reg.dadosOperador.nome : "Desconhecido";
    const tipoManu = reg.diagnostico
      ? reg.diagnostico.tipoManutencao
      : "Manutenção";

    let corBadge = "#6c757d";
    let classeStatus = "";

    if (statusLabel === "Operacional") {
      corBadge = "var(--success)";
      classeStatus = "status-operacional";
    }
    if (statusLabel === "Revisão") {
      corBadge = "var(--warning)";
      classeStatus = "status-revisao";
    }
    if (statusLabel === "Parada") {
      corBadge = "var(--danger)";
      classeStatus = "status-parada";
    }
    if (statusLabel === "Troca") {
      corBadge = "#000";
      classeStatus = "status-troca";
    }

    let labelOS = "Inspeção Diária";
    if (statusLabel === "Revisão") {
      labelOS = "⏳ Solicitação Pendente";
    } else if (
      tipoManu === "Inspecao" &&
      statusLabel === "Operacional" &&
      !reg.diagnostico?.dataInicioOS
    ) {
      labelOS = "👁️ Inspeção Preditiva";
    } else {
      labelOS = "✅ O.S. Executada";
    }

    const badgeFotos =
      reg.anexos && reg.anexos.quantidade > 0
        ? `<span class="timeline-fotos-badge">📸 ${reg.anexos.quantidade} Foto(s)</span>`
        : "";

    const li = document.createElement("li");
    li.className = `timeline-item ${classeStatus}`;
    li.innerHTML = `
              <span class="timeline-data">${formatarDataHora(
                obterDataSegura(reg)
              )}</span>
              <span class="timeline-status" style="background-color: ${corBadge}">${statusLabel}</span>
              <div class="timeline-tecnico">👷 ${tecnico} | 🏷️ <strong>${labelOS}</strong></div>
              <div class="timeline-relato">${
                relato.length > 100 ? relato.substring(0, 100) + "..." : relato
              }</div>
              ${badgeFotos}
          `;

    li.addEventListener("click", () =>
      abrirModalDetalhes(reg, corBadge, statusLabel, relato, tecnico, tipoManu)
    );
    listaHistorico.appendChild(li);
  });

  renderizarControlesPaginacao();
}

function renderizarControlesPaginacao() {
  const totalPaginas = Math.ceil(historicoFiltrado.length / ITENS_POR_PAGINA);
  let container = document.getElementById("paginacao-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "paginacao-container";
    container.style =
      "display: flex; justify-content: center; gap: 10px; margin-top: 25px; margin-bottom: 25px; flex-wrap: wrap;";
    listaHistorico.parentNode.appendChild(container);
  }

  container.innerHTML = "";
  if (totalPaginas <= 1) return;

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.style = `
            padding: 8px 15px; 
            border-radius: 6px; 
            border: 1px solid var(--primary); 
            background: ${i === paginaAtual ? "var(--primary)" : "white"}; 
            color: ${i === paginaAtual ? "white" : "var(--primary)"}; 
            cursor: pointer; 
            font-weight: bold; 
            transition: 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;

    btn.onclick = () => {
      renderizarPagina(i);
      document
        .querySelector(".cabecalho-maquina")
        .scrollIntoView({ behavior: "smooth" });
    };

    container.appendChild(btn);
  }
}

function abrirModalDetalhes(
  reg,
  corBadge,
  statusLabel,
  relato,
  tecnico,
  tipoManu
) {
  let htmlPecas = "";
  if (reg.estoque && reg.estoque.itens && reg.estoque.itens.length > 0) {
    let lis = reg.estoque.itens
      .map((p) => `<li>${p.quantidade}x ${p.nome}</li>`)
      .join("");
    const tituloPecas =
      statusLabel === "Revisão" ? "Peças Solicitadas" : "Peças Utilizadas";
    htmlPecas = `<div class="modal-pecas"><strong>${tituloPecas}:</strong><ul>${lis}</ul></div>`;
  }

  let htmlCausa = "";
  if (
    reg.analiseFalha &&
    reg.analiseFalha.causaRaiz &&
    reg.analiseFalha.causaRaiz !== "Nao Aplicavel"
  ) {
    htmlCausa = `<p><strong>Causa Raiz:</strong> ${reg.analiseFalha.causaRaiz}</p>`;
    if (reg.analiseFalha.dataLimite) {
      htmlCausa += `<p><strong>Data Limite/Retorno:</strong> ${reg.analiseFalha.dataLimite}</p>`;
    }
  }

  let htmlFotos = "";
  if (reg.anexos && reg.anexos.urlsLinks && reg.anexos.urlsLinks.length > 0) {
    let imgs = reg.anexos.urlsLinks
      .map(
        (url) =>
          `<a href="${url}" target="_blank"><img src="${url}" style="width: 75px; height: 75px; object-fit: cover; border-radius: 8px; border: 1px solid #ccc; margin-right: 8px; margin-top: 10px; transition: 0.2s;"></a>`
      )
      .join("");
    htmlFotos = `<div style="margin-top: 15px;"><strong>Evidências Fotográficas:</strong><br><div style="display: flex; flex-wrap: wrap;">${imgs}</div><small style="color: #666; font-size: 0.8rem;">Clique na imagem para ampliar</small></div>`;
  }

  let btnExecutar = "";
  if (statusLabel === "Revisão") {
    btnExecutar = `
        <a href="formulario-maquinario.html?id=${
          reg.dadosEquipamento?.id || "N/A"
        }&nome=${encodeURIComponent(
      reg.dadosEquipamento?.nome || "Equipamento"
    )}&os_id=${reg.id}" 
           style="display: block; text-align: center; background: #fff8e6; color: #856404; border: 2px solid var(--warning); padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: 0.2s;">
           ⚙️ EXECUTAR / DAR BAIXA NA O.S.
        </a>
      `;
  }

  modalCorpo.innerHTML = `
        <div class="modal-badge" style="background-color: ${corBadge}">${statusLabel}</div>
        <p><strong>Data:</strong> ${formatarDataHora(obterDataSegura(reg))}</p>
        <p><strong>Técnico:</strong> ${tecnico}</p>
        <p><strong>Tipo de Registro:</strong> ${tipoManu}</p>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
        <p><strong>Relatório Completo:</strong><br>${relato}</p>
        ${htmlCausa}
        ${htmlPecas}
        ${htmlFotos}
        
        ${btnExecutar}
        
        <a href="detalhes-relatorio.html?id=${reg.id}" 
           style="display: block; text-align: center; background: var(--primary); color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.2s;">
           Ver Documento Completo ➔
        </a>
    `;

  modal.classList.remove("hidden");
}
