import { salvarManutencaoFirebase, obterRelatorioPorId } from "./db.js";

const sessaoAtual = { uid: "USR-001", nome: "Operador Logado" };
const displayTecnico = document.getElementById("nome-tecnico-display");
if (displayTecnico) displayTecnico.textContent = sessaoAtual.nome;

const params = new URLSearchParams(window.location.search);
let idMaquinaURL = params.get("id");
let nomeMaquinaURL = params.get("nome");
let osIdEditando = params.get("os_id");

// 1. TRAVA DE SEGURANÇA PADRÃO
if (!idMaquinaURL && !osIdEditando) {
  alert(
    "⚠️ Erro: Máquina não identificada!\nVerifique se o seu navegador está a cortar os parâmetros da URL."
  );
  window.location.href = "maquinario.html";
}

document.getElementById("display-id").textContent = idMaquinaURL || "---";
document.getElementById("display-nome").textContent =
  nomeMaquinaURL || "A carregar...";

const form = document.getElementById("form-detalhado");
const tipoManutencao = document.getElementById("tipo-manutencao");
const statusButtons = document.querySelectorAll(".btn-status");
const statusInput = document.getElementById("status-selecionado");
const boxSeguranca = document.getElementById("box-seguranca");
const checkSeguranca = document.getElementById("check-seguranca");
const overlay = document.getElementById("overlay");
const labelRelatorio = document.getElementById("label-relatorio");

const secaoMedidores = document.getElementById("secao-medidores");
const secaoDiagnostico = document.getElementById("secao-diagnostico");
const secaoRecursos = document.getElementById("secao-recursos");
const tituloRecursos = document.getElementById("titulo-recursos");
const inputLocalFalha = document.getElementById("local-falha");
const inputSintoma = document.getElementById("sintoma-falha");
const inputCausaRaiz = document.getElementById("causa-raiz");
const inputAcaoTomada = document.getElementById("acao-tomada");
const inputUrgencia = document.getElementById("urgencia-revisao");
const inputDataLimite = document.getElementById("data-limite");
const inputTempoParada = document.getElementById("tempo-parada");
const inputTempoTrabalho = document.getElementById("tempo-trabalho");
const inputHorimetro = document.getElementById("horimetro");
const inputTemperatura = document.getElementById("temperatura");
const inputRelatorio = document.getElementById("relatorio");
const labelPecas = document.getElementById("label-pecas");
const blocoUrgencia = document.getElementById("bloco-urgencia");
const blocoAcaoTomada = document.getElementById("bloco-acao-tomada");
const blocoTempos = document.getElementById("bloco-tempos");
const blocoDatasOs = document.getElementById("bloco-datas-os");
const inputDataInicio = document.getElementById("data-inicio");
const inputDataFim = document.getElementById("data-fim");

let urlsFotosAntigas = [];
let listaPecas = [];

function formatarParaInputLocal(valorTempo) {
  let ms = valorTempo;
  if (!ms) ms = Date.now();
  else if (typeof ms === "object" && typeof ms.toMillis === "function")
    ms = ms.toMillis();
  else if (typeof ms === "object" && ms.seconds) ms = ms.seconds * 1000;
  else if (typeof ms === "string") ms = parseInt(ms) || Date.now();

  try {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Number(ms) - tzOffset).toISOString().slice(0, 16);
  } catch (e) {
    return new Date().toISOString().slice(0, 16);
  }
}

if (osIdEditando) {
  document.getElementById("titulo-pagina").textContent =
    "Execução de O.S. Pendente";
  document.querySelector(".btn-submit").textContent =
    "SALVAR EXECUÇÃO / DAR BAIXA NA O.S.";
  carregarDadosParaEdicao(osIdEditando);
}

async function carregarDadosParaEdicao(id) {
  if (overlay) overlay.classList.remove("hidden");
  try {
    const reg = await obterRelatorioPorId(id);

    // Bloqueia as O.S. corrompidas do passado
    let dbId = reg?.dadosEquipamento?.id;
    if (dbId === "TESTE-999") {
      alert(
        "Esta O.S. está corrompida devido a um erro antigo. Por favor, elimine-a ou ignore-a."
      );
      window.location.href = "maquinario.html";
      return;
    }

    idMaquinaURL = dbId;
    nomeMaquinaURL = reg?.dadosEquipamento?.nome;
    document.getElementById("display-id").textContent = idMaquinaURL;
    document.getElementById("display-nome").textContent = nomeMaquinaURL;

    tipoManutencao.value = reg?.diagnostico?.tipoManutencao || "Corretiva";
    inputLocalFalha.value = reg?.dadosEquipamento?.subconjuntoAfetado || "";
    inputRelatorio.value = reg?.diagnostico?.relatorio || "";
    urlsFotosAntigas = reg?.anexos?.urlsLinks || [];

    const msCriacao =
      reg?.timestampEnvio || reg?.dataCriacaoOficial || Date.now();
    inputDataInicio.value = formatarParaInputLocal(msCriacao);
    inputDataFim.value = formatarParaInputLocal(Date.now());

    statusButtons.forEach((b) => b.classList.remove("selected"));
    const btnOp = Array.from(statusButtons).find(
      (b) => b.getAttribute("data-status") === "Operacional"
    );
    if (btnOp) btnOp.classList.add("selected");
    statusInput.value = "Operacional";

    const itensAntigos = reg?.estoque?.itens || [];
    itensAntigos.forEach((peca) => {
      adicionarPecaNaLista(peca.nome, peca.quantidade);
    });

    atualizarVisibilidadeCampos();
    inputRelatorio.value =
      "[Fecho de O.S.] - " + inputRelatorio.value + "\n\nResolução: ";

    if (overlay) overlay.classList.add("hidden");
  } catch (error) {
    console.error("Erro:", error);
    if (overlay) overlay.classList.add("hidden");
    alert("Erro ao carregar dados da O.S. da nuvem.");
  }
}

function atualizarVisibilidadeCampos() {
  const tipo = tipoManutencao.value;
  const status = statusInput.value;

  if (tipo === "Inspecao" || tipo === "Preventiva")
    secaoMedidores.classList.remove("hidden-smart");
  else secaoMedidores.classList.add("hidden-smart");

  if (status === "Parada" || status === "Troca")
    boxSeguranca.classList.remove("hidden-smart");
  else {
    boxSeguranca.classList.add("hidden-smart");
    checkSeguranca.checked = false;
  }

  blocoDatasOs.style.display = "none";

  if (status === "Operacional") {
    secaoDiagnostico.classList.add("hidden-smart");
    inputCausaRaiz.value = "Nao Aplicavel";
    inputSintoma.value = "Nenhum";
    inputAcaoTomada.value = "Inspecionado";
    if (labelRelatorio)
      labelRelatorio.textContent = "Observações / Solução Aplicada";

    if (osIdEditando) {
      if (tituloRecursos)
        tituloRecursos.textContent = "4. Tempos e Recursos (Fecho de O.S.)";
      secaoRecursos.classList.remove("hidden-smart");
      blocoTempos.style.display = "grid";
      blocoDatasOs.style.display = "grid";
      labelPecas.textContent = "Peças Efetivamente Utilizadas na O.S.";
    } else {
      if (tituloRecursos)
        tituloRecursos.textContent = "4. Materiais Utilizados";
      if (tipo === "Inspecao") {
        secaoRecursos.classList.add("hidden-smart");
        if (inputRelatorio.value.trim() === "")
          inputRelatorio.value = "Equipamento operando nos padrões normais.";
      } else {
        secaoRecursos.classList.remove("hidden-smart");
        blocoTempos.style.display = "none";
        labelPecas.textContent = "Peças / Consumíveis Utilizados";
      }
    }
  } else if (status === "Revisão") {
    if (tituloRecursos) tituloRecursos.textContent = "4. Previsão de Recursos";
    secaoDiagnostico.classList.remove("hidden-smart");
    secaoRecursos.classList.remove("hidden-smart");
    secaoDiagnostico.className = "form-section box-alerta alerta-revisao";
    document.getElementById("titulo-diagnostico").textContent =
      "3. Planeamento de O.S. (Amarelo)";

    blocoAcaoTomada.style.display = "none";
    blocoTempos.style.display = "none";
    blocoUrgencia.style.display = "flex";
    inputUrgencia.value = "Média";
    labelPecas.textContent = "Peças Necessárias para a O.S. (Comprar)";
    labelRelatorio.textContent = "Relatório da Restrição / Problema";
    inputCausaRaiz.value = "Nao Aplicavel";
    inputAcaoTomada.value = "Pendente";
  } else if (status === "Parada" || status === "Troca") {
    if (tituloRecursos)
      tituloRecursos.textContent = "4. Tempos e Recursos (O.S.)";
    secaoDiagnostico.classList.remove("hidden-smart");
    secaoRecursos.classList.remove("hidden-smart");
    secaoDiagnostico.className = "form-section box-alerta alerta-parada";
    document.getElementById("titulo-diagnostico").textContent =
      "3. Análise de Falha Crítica (O.S. Imediata)";

    blocoAcaoTomada.style.display = "block";
    blocoTempos.style.display = "grid";
    blocoDatasOs.style.display = "grid";
    if (!inputDataInicio.value)
      inputDataInicio.value = formatarParaInputLocal(Date.now());
    if (!inputDataFim.value)
      inputDataFim.value = formatarParaInputLocal(Date.now());

    blocoUrgencia.style.display = "none";
    labelPecas.textContent = "Peças Substituídas na O.S.";
    labelRelatorio.textContent = "Relatório Técnico da Causa e Solução";
    if (!inputCausaRaiz.value || inputCausaRaiz.value === "Nao Aplicavel")
      inputCausaRaiz.value = "Desgaste Natural";
    if (!inputAcaoTomada.value || inputAcaoTomada.value === "Pendente")
      inputAcaoTomada.value = "Substituido";
  }
}

tipoManutencao.addEventListener("change", atualizarVisibilidadeCampos);
statusButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    statusButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    statusInput.value = btn.getAttribute("data-status");
    atualizarVisibilidadeCampos();
  });
});

function adicionarPecaNaLista(nome, qtd) {
  listaPecas.push({
    id: Date.now() + Math.random(),
    nome: nome,
    quantidade: qtd,
  });
  renderizarListaPecas();
}

const btnAddPeca = document.getElementById("btn-add-peca");
const inputNomePeca = document.getElementById("input-nome-peca");
const inputQtdPeca = document.getElementById("input-qtd-peca");
const listaPecasUI = document.getElementById("lista-pecas-ui");

btnAddPeca.addEventListener("click", () => {
  let nome = inputNomePeca.value.trim();
  let qtd = parseInt(inputQtdPeca.value);
  if (!nome || isNaN(qtd) || qtd <= 0)
    return alert("Informe peça e quantidade.");
  adicionarPecaNaLista(nome, qtd);
  inputNomePeca.value = "";
  inputQtdPeca.value = "";
  inputNomePeca.focus();
});

function renderizarListaPecas() {
  listaPecasUI.innerHTML = "";
  listaPecas.forEach((peca) => {
    const li = document.createElement("li");
    li.innerHTML = `<span><strong>${peca.quantidade}x</strong> ${peca.nome}</span>
                    <button type="button" class="btn-remove-peca" onclick="removerPeca(${peca.id})">×</button>`;
    listaPecasUI.appendChild(li);
  });
}
window.removerPeca = function (idPeca) {
  listaPecas = listaPecas.filter((p) => p.id !== idPeca);
  renderizarListaPecas();
};

let arquivosFotos = [];
const fotoInput = document.getElementById("foto-input");
const previewGallery = document.getElementById("preview-gallery");
const contadorFotos = document.getElementById("contador-fotos");

fotoInput.addEventListener("change", (e) => {
  const novosArquivos = Array.from(e.target.files);
  if (
    arquivosFotos.length + novosArquivos.length + urlsFotosAntigas.length >
    20
  ) {
    alert("⚠️ Limite de 20 fotos.");
    return;
  }
  arquivosFotos = arquivosFotos.concat(novosArquivos);
  renderizarGaleriaFotos();
});

function renderizarGaleriaFotos() {
  previewGallery.innerHTML = "";
  contadorFotos.textContent = arquivosFotos.length + urlsFotosAntigas.length;
  arquivosFotos.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      previewGallery.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (
    !boxSeguranca.classList.contains("hidden-smart") &&
    !checkSeguranca.checked
  ) {
    return alert("⚠️ Confirme a desenergização (LOTO).");
  }
  if (!tipoManutencao.value || !statusInput.value)
    return alert("Preencha Tipo e Status.");

  const isRevisao = statusInput.value === "Revisão";
  const isRegistroSimples =
    statusInput.value === "Operacional" && !osIdEditando;

  const payloadCompleto = {
    dadosEquipamento: {
      id: idMaquinaURL,
      nome: nomeMaquinaURL,
      subconjuntoAfetado: inputLocalFalha.value || "Geral",
    },
    dadosOperador: { id: sessaoAtual.uid, nome: sessaoAtual.nome },
    diagnostico: {
      tipoManutencao: tipoManutencao.value,
      statusFinal: statusInput.value,
      tempoParada:
        isRevisao || isRegistroSimples
          ? 0
          : parseFloat(inputTempoParada.value) || 0,
      horasTrabalhadas:
        isRevisao || isRegistroSimples
          ? 0
          : parseFloat(inputTempoTrabalho.value) || 0,
      dataInicioOS:
        isRevisao || isRegistroSimples ? null : inputDataInicio.value || null,
      dataFimOS:
        isRevisao || isRegistroSimples ? null : inputDataFim.value || null,
      relatorio: inputRelatorio.value.trim(),
    },
    medidores: {
      horimetro: parseFloat(inputHorimetro.value) || null,
      temperaturaC: parseFloat(inputTemperatura.value) || null,
    },
    analiseFalha: {
      sintoma: inputSintoma.value,
      causaRaiz: inputCausaRaiz.value,
      acaoTomada: inputAcaoTomada.value,
      urgencia: inputUrgencia.value || "Baixa",
      dataLimite: inputDataLimite.value || null,
    },
    seguranca: { equipamentoBloqueadoLOTO: checkSeguranca.checked },
    estoque: { itens: listaPecas },
    anexos: { urlsLinks: urlsFotosAntigas, arquivosEmMemoria: arquivosFotos },
  };

  if (overlay) overlay.classList.remove("hidden");
  try {
    await salvarManutencaoFirebase(payloadCompleto, osIdEditando);
    if (overlay) overlay.classList.add("hidden");
    alert(
      osIdEditando
        ? "✅ O.S. Executada e Fechada com Sucesso!"
        : "✅ Registo salvo com Sucesso!"
    );
    window.location.href = "maquinario.html";
  } catch (error) {
    console.error(error);
    if (overlay) overlay.classList.add("hidden");
    alert("Erro ao salvar no banco de dados.");
  }
});
