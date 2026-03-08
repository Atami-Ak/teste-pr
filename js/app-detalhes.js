import { obterRelatorioPorId } from "./db.js";

const params = new URLSearchParams(window.location.search);
const idRelatorio = params.get("id");
const loadingDiv = document.getElementById("loading");
const conteudoDiv = document.getElementById("os-conteudo");

const temporizadorErro = setTimeout(() => {
  if (loadingDiv && loadingDiv.style.display !== "none") {
    loadingDiv.innerHTML = `
      <div style="background: #fdf1f2; border: 2px solid var(--danger); padding: 20px; border-radius: 8px; color: #721c24;">
          <h3 style="margin-bottom: 10px;">⚠️ Tempo Esgotado</h3>
          <p>Falha ao carregar o documento da Nuvem.</p>
          <a href="maquinario.html" style="background: var(--danger); color: white; padding: 10px; border-radius: 6px; display: inline-block;">Voltar</a>
      </div>`;
  }
}, 6000);

if (!idRelatorio) {
  clearTimeout(temporizadorErro);
  alert("Relatório não identificado na URL.");
  window.location.href = "maquinario.html";
} else {
  carregarDetalhesOS();
}

function formatarDataSimples(strData) {
  if (!strData) return "N/A";
  const d = new Date(strData);
  if (isNaN(d)) return strData;
  return (
    d.toLocaleDateString("pt-BR") +
    " às " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

async function carregarDetalhesOS() {
  try {
    const reg = await obterRelatorioPorId(idRelatorio);
    clearTimeout(temporizadorErro);

    if (loadingDiv) {
      loadingDiv.classList.add("hidden");
      loadingDiv.style.display = "none";
    }
    if (conteudoDiv) {
      conteudoDiv.classList.remove("hidden");
      conteudoDiv.style.display = "block";
    }

    const statusLabel =
      reg?.diagnostico?.statusFinal || reg?.status || "Status Desconhecido";
    const tipoManu =
      reg?.diagnostico?.tipoManutencao || reg?.tipoManutencao || "Manutenção";

    // INTELIGÊNCIA DE NOMEAÇÃO DO DOCUMENTO
    let tipoDocumentoOficial = "Registo de Intervenção";
    let subTitulo = "Detalhes da Atividade";

    if (statusLabel === "Revisão") {
      tipoDocumentoOficial = "📝 SOLICITAÇÃO PENDENTE";
      subTitulo = "Aguardando Execução e Peças (Revisão)";
    } else if (
      tipoManu === "Inspecao" &&
      statusLabel === "Operacional" &&
      !reg?.diagnostico?.dataInicioOS
    ) {
      tipoDocumentoOficial = "👁️ REGISTO DE INSPEÇÃO";
      subTitulo = "Rotina / Manutenção Preditiva";
    } else {
      tipoDocumentoOficial = "✅ ORDEM DE SERVIÇO (O.S.) EXECUTADA";
      subTitulo = "Documento Final de Intervenção";
    }

    document.querySelector(".sub-header h2").textContent = tipoDocumentoOficial;
    document.querySelector(".os-titulo h3").textContent =
      reg?.dadosEquipamento?.nome || "Equipamento";
    document.getElementById("os-maquina-id").textContent =
      reg?.dadosEquipamento?.id || "---";
    document.getElementById("os-local").textContent =
      reg?.dadosEquipamento?.subconjuntoAfetado || "Geral";

    const badge = document.getElementById("os-status");
    if (badge) {
      badge.textContent = statusLabel;
      if (statusLabel === "Operacional")
        badge.style.backgroundColor = "var(--success)";
      else if (statusLabel === "Revisão")
        badge.style.backgroundColor = "var(--warning)";
      else if (statusLabel === "Parada")
        badge.style.backgroundColor = "var(--danger)";
      else badge.style.backgroundColor = "#000";
    }

    const timestampSeguro =
      reg?.timestampEnvio ||
      reg?.timestamp ||
      reg?.dataCriacaoOficial?.toMillis() ||
      Date.now();
    document.getElementById("os-data").innerHTML = `${formatarDataSimples(
      timestampSeguro
    )} <br><small style="color:var(--text-muted)">(${subTitulo})</small>`;

    document.getElementById("os-tecnico").textContent =
      reg?.dadosOperador?.nome || "Desconhecido";
    document.getElementById("os-tipo").textContent = tipoManu;
    document.getElementById("os-relatorio").textContent =
      reg?.diagnostico?.relatorio || "Sem relatório";

    // INDICADORES DA O.S. (Ignorado se for apenas revisão ou inspeção simples)
    if (reg?.diagnostico?.dataInicioOS || reg?.diagnostico?.dataFimOS) {
      const blocoCausa = document.getElementById("bloco-causa");
      blocoCausa.style.display = "block";

      const dtInicio = formatarDataSimples(reg.diagnostico.dataInicioOS);
      const dtFim = formatarDataSimples(reg.diagnostico.dataFimOS);

      blocoCausa.innerHTML = `
            <h4>Indicadores da O.S.</h4>
            <div class="info-box" style="border-left: 4px solid var(--success); margin-bottom: 15px;">
                <strong>Início do Trabalho:</strong> ${dtInicio} <br>
                <strong>Término do Trabalho:</strong> ${dtFim} <br>
                <strong>Máquina Parada:</strong> ${
                  reg.diagnostico.tempoParada || 0
                } Hrs | <strong>Mão de Obra:</strong> ${
        reg.diagnostico.horasTrabalhadas || 0
      } Hrs
            </div>
            ${blocoCausa.innerHTML} 
        `;
    }

    if (
      reg?.analiseFalha?.causaRaiz &&
      reg?.analiseFalha?.causaRaiz !== "Nao Aplicavel"
    ) {
      document.getElementById("bloco-causa").style.display = "block";
      document.getElementById("os-causa").textContent =
        reg.analiseFalha.causaRaiz;
      document.getElementById("os-downtime").textContent =
        reg.diagnostico?.tempoParada || 0;
    }

    const estoqueItens = reg?.estoque?.itens || [];
    if (estoqueItens.length > 0) {
      document.getElementById("bloco-pecas").style.display = "block";
      if (statusLabel === "Revisão")
        document.getElementById("titulo-pecas").textContent =
          "Peças Solicitadas";
      else
        document.getElementById("titulo-pecas").textContent =
          "BOM - Peças e Materiais Utilizados";

      const tbody = document.getElementById("os-lista-pecas");
      tbody.innerHTML = "";
      estoqueItens.forEach((peca) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td style="font-weight:bold; width: 60px; text-align:center;">${peca.quantidade}</td><td>${peca.nome}</td>`;
        tbody.appendChild(tr);
      });
    }

    const linksFotos = reg?.anexos?.urlsLinks || [];
    if (linksFotos.length > 0) {
      document.getElementById("bloco-fotos").style.display = "block";
      const galeria = document.getElementById("os-galeria");
      galeria.innerHTML = "";
      linksFotos.forEach((url) => {
        if (typeof url === "string") {
          galeria.innerHTML += `<a href="${url}" target="_blank"><img src="${url}" title="Ampliar"></a>`;
        }
      });
    }

    if (statusLabel === "Revisão") {
      const btnExecutar = `
          <div id="area-fecho-os" style="margin-top: 35px; padding-top: 25px; border-top: 2px dashed #cbd5e1; text-align: center; background: #f8fafc; border-radius: 8px; padding-bottom: 25px;">
              <h4 style="color: var(--primary); margin-bottom: 10px;">🚨 Esta Solicitação está Pendente</h4>
              <p style="font-size: 0.85rem; color: #666; margin-bottom: 15px;">Aguardando a sua intervenção. Clique abaixo para executar e transformar em O.S.</p>
              <a href="formulario-maquinario.html?id=${
                reg?.dadosEquipamento?.id || "N/A"
              }&nome=${encodeURIComponent(
        reg?.dadosEquipamento?.nome || "Equipamento"
      )}&os_id=${reg.id}" 
                 style="background: var(--warning); color: #856404; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-size: 1.05rem; font-weight: 800; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: 0.2s;">
                 ⚙️ DAR BAIXA NA O.S.
              </a>
          </div>
      `;
      if (conteudoDiv) conteudoDiv.insertAdjacentHTML("beforeend", btnExecutar);
    }
  } catch (error) {
    clearTimeout(temporizadorErro);
    console.error(error);
  }
}
