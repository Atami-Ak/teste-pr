import { catalogoMaquinas } from "./dados-maquinas.js";

const painelAtivos = document.getElementById("painel-ativos");
const modal = document.getElementById("modal-relatorio");
const btnFecharModal = document.getElementById("btn-fechar-modal");
const modalCorpo = document.getElementById("modal-corpo");

if (btnFecharModal && modal) {
  btnFecharModal.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
}

function formatarData(timestamp) {
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

function renderizarCardsBase() {
  if (!painelAtivos) return;
  painelAtivos.innerHTML = "";

  catalogoMaquinas.forEach((maquina) => {
    const urlFormulario = `formulario-maquinario.html?id=${
      maquina.id
    }&nome=${encodeURIComponent(maquina.nome)}`;

    const cardHTML = `
      <div class="card-ativo" id="card-${maquina.id}">
          <div class="card-header">
              <div class="info">
                  <span class="tag-id">${maquina.id}</span>
                  <h3>${maquina.nome}</h3>
              </div>
              <a href="${urlFormulario}" class="btn-add-registro" title="Novo Registro">+</a>
          </div>
          
          <div class="status-atual" id="status-${
            maquina.id
          }" style="transition: 0.3s;">⏳ A ligar ao servidor...</div>
          
          <div id="acoes-rapidas-${maquina.id}"></div>
          
          <div class="historico-resumo">
              <div class="historico-header" id="toggle-${maquina.id}">
                  <h4>Últimos Registos</h4>
                  <span class="seta-toggle">▼</span>
              </div>
              <div id="container-lista-${maquina.id}" class="lista-oculta">
                  <ul id="lista-${
                    maquina.id
                  }"><li>Aguarde, a carregar dados...</li></ul>
                  <a href="historico-maquina.html?id=${
                    maquina.id
                  }&nome=${encodeURIComponent(
      maquina.nome
    )}" class="btn-ver-todos">Ver Histórico Completo da Máquina</a>
              </div>
          </div>
      </div>
    `;
    painelAtivos.insertAdjacentHTML("beforeend", cardHTML);

    const headerToggle = document.getElementById(`toggle-${maquina.id}`);
    const containerLista = document.getElementById(
      `container-lista-${maquina.id}`
    );
    const seta = headerToggle.querySelector(".seta-toggle");

    if (headerToggle && containerLista && seta) {
      headerToggle.addEventListener("click", () => {
        containerLista.classList.toggle("lista-oculta");
        seta.classList.toggle("aberta");
      });
    }
  });
}

function abrirModalDetalhes(reg) {
  const relato = reg.diagnostico ? reg.diagnostico.relatorio : reg.relatorio;
  const statusLabel = reg.diagnostico
    ? reg.diagnostico.statusFinal
    : reg.status;
  const tipoManu = reg.diagnostico
    ? reg.diagnostico.tipoManutencao
    : "Não informado";
  const tecnico = reg.dadosOperador ? reg.dadosOperador.nome : "Desconhecido";

  let corBadge = "#6c757d";
  if (statusLabel === "Operacional") corBadge = "var(--success)";
  if (statusLabel === "Revisão") corBadge = "var(--warning)";
  if (statusLabel === "Parada") corBadge = "var(--danger)";

  let htmlPecas = "";
  if (reg.estoque && reg.estoque.itens && reg.estoque.itens.length > 0) {
    let lis = reg.estoque.itens
      .map((p) => `<li>${p.quantidade}x ${p.nome}</li>`)
      .join("");
    htmlPecas = `<div class="modal-pecas"><strong>Itens Associados:</strong><ul>${lis}</ul></div>`;
  }

  let htmlCausa = "";
  if (
    reg.analiseFalha &&
    reg.analiseFalha.causaRaiz &&
    reg.analiseFalha.causaRaiz !== "Nao Aplicavel"
  ) {
    htmlCausa = `<p><strong>Causa Raiz:</strong> ${reg.analiseFalha.causaRaiz}</p>`;
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
        <p><strong>Data:</strong> ${formatarData(obterDataSegura(reg))}</p>
        <p><strong>Técnico:</strong> ${tecnico}</p>
        <p><strong>Tipo:</strong> ${tipoManu}</p>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
        <p><strong>Relatório:</strong><br>${relato}</p>
        ${htmlCausa}
        ${htmlPecas}
        
        ${btnExecutar}
        
        <a href="detalhes-relatorio.html?id=${reg.id}" 
           style="display: block; text-align: center; background: var(--primary); color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.2s;">
           Ver Documento Completo ➔
        </a>
    `;
  modal.classList.remove("hidden");
}

async function carregarDadosFirebase() {
  try {
    const { obterHistoricoMaquina } = await import("./db.js");

    for (const maquina of catalogoMaquinas) {
      const listaEl = document.getElementById(`lista-${maquina.id}`);
      const statusEl = document.getElementById(`status-${maquina.id}`);
      const cardEl = document.getElementById(`card-${maquina.id}`);
      const acoesRapidasEl = document.getElementById(
        `acoes-rapidas-${maquina.id}`
      );

      if (!listaEl || !statusEl || !cardEl) continue;

      try {
        let historico = await obterHistoricoMaquina(maquina.id);

        if (historico.length === 0) {
          listaEl.innerHTML = "<li>Nenhum registo encontrado.</li>";
          statusEl.textContent = "⚪ Sem dados operacionais";
          continue;
        }

        historico.sort((a, b) => obterDataSegura(b) - obterDataSegura(a));

        const ultimoRegistro = historico[0];
        const statusAtual = ultimoRegistro.status || "Desconhecido";

        let corBorda = "var(--gray)";
        let corFundo = "#f8fafc";
        let corTexto = "var(--text-muted)";

        if (statusAtual === "Operacional") {
          corBorda = "var(--success)";
          corFundo = "#d1fae5";
          corTexto = "#065f46";
        } else if (statusAtual === "Revisão") {
          corBorda = "var(--warning)";
          corFundo = "#fef3c7";
          corTexto = "#92400e";
        } else if (statusAtual === "Parada") {
          corBorda = "var(--danger)";
          corFundo = "#fee2e2";
          corTexto = "#991b1b";
        } else if (statusAtual === "Troca") {
          corBorda = "#000";
          corFundo = "#e2e8f0";
          corTexto = "#0f172a";
        }

        cardEl.style.borderLeftColor = corBorda;
        statusEl.textContent = statusAtual.toUpperCase();
        statusEl.style.backgroundColor = corFundo;
        statusEl.style.color = corTexto;
        statusEl.style.borderColor = corBorda;

        if (acoesRapidasEl) {
          if (statusAtual === "Revisão") {
            acoesRapidasEl.innerHTML = `
                    <a href="formulario-maquinario.html?id=${
                      maquina.id
                    }&nome=${encodeURIComponent(maquina.nome)}&os_id=${
              ultimoRegistro.id
            }" 
                       style="display: block; text-align: center; background: var(--warning); color: #856404; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 800; font-size: 0.95rem; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eab308; transition: 0.2s;">
                       ⚙️ EXECUTAR O.S. PENDENTE
                    </a>
                `;
          } else {
            acoesRapidasEl.innerHTML = "";
          }
        }

        listaEl.innerHTML = "";
        const ultimosTres = historico.slice(0, 3);

        ultimosTres.forEach((reg) => {
          const li = document.createElement("li");
          li.title = "Clique para ver pormenores";

          const relato = reg.diagnostico
            ? reg.diagnostico.relatorio
            : reg.relatorio;
          const statusLabel = reg.diagnostico
            ? reg.diagnostico.statusFinal
            : reg.status;
          const tipoManu = reg.diagnostico
            ? reg.diagnostico.tipoManutencao
            : "Manutenção";
          const resumoRelato =
            relato.length > 40 ? relato.substring(0, 40) + "..." : relato;

          // IDENTIFICAÇÃO VISUAL DA CATEGORIA
          let labelOS = "";
          if (statusLabel === "Revisão") {
            labelOS =
              "<strong style='color: var(--warning); font-size: 0.75rem;'>[📝 SOLICITAÇÃO PENDENTE]</strong>";
          } else if (
            tipoManu === "Inspecao" &&
            statusLabel === "Operacional" &&
            !reg.diagnostico?.dataInicioOS
          ) {
            labelOS =
              "<em style='color: var(--primary); font-size: 0.75rem;'>[👁️ Inspeção]</em>";
          } else {
            labelOS =
              "<strong style='color: var(--success); font-size: 0.75rem;'>[✅ O.S. EXECUTADA]</strong>";
          }

          li.innerHTML = `<strong>${formatarData(
            obterDataSegura(reg)
          )}</strong> ${labelOS}<br> 
                          <span style="color: #666; font-size: 0.8rem;">${statusLabel} - ${resumoRelato}</span>`;

          li.addEventListener("click", () => abrirModalDetalhes(reg));
          listaEl.appendChild(li);
        });
      } catch (error) {
        console.error(`Erro ao carregar a máquina ${maquina.id}:`, error);
        listaEl.innerHTML =
          '<li style="color: red;">Falha ao carregar dados desta máquina.</li>';
        statusEl.textContent = "⚠️ Erro de Leitura";
      }
    }
  } catch (erroCritico) {
    console.error("ERRO FATAL DE BASE DE DADOS:", erroCritico);
  }
}

function iniciarDashboard() {
  renderizarCardsBase();
  carregarDadosFirebase();
}

iniciarDashboard();
