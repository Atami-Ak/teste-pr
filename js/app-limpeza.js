import { catalogoZonas, equipeLimpeza } from "./dados-limpeza.js";
import { obterTodasAuditoriasLimpeza } from "./db.js";

const gridZonas = document.getElementById("grid-zonas");

function renderizarZonasVazias() {
  gridZonas.innerHTML = "";
  catalogoZonas.forEach((zona) => {
    // Transforma os IDs em Nomes Reais
    const nomesResponsaveis = zona.responsaveis
      .map((id) => {
        const func = equipeLimpeza.find((e) => e.id === id);
        return func ? func.nome : id;
      })
      .join(", ");

    const card = document.createElement("div");
    card.className = "card-zona";

    // NOVO: Transforma o Card num link para o histórico da zona
    card.style.cursor = "pointer";
    card.onclick = () => {
      window.location.href = `historico-limpeza.html?zona_id=${zona.id}`;
    };

    // O onclick="event.stopPropagation()" no botão evita que o clique vá para o histórico quando queremos apenas fazer auditoria
    card.innerHTML = `
            <div class="zona-header">
                <div class="zona-icone">${zona.icone}</div>
                <div class="zona-titulo">
                    <span>${zona.id}</span>
                    <h3>${zona.nome}</h3>
                </div>
            </div>
            <p style="font-size: 0.85rem; color: #666; margin-bottom: 10px; line-height: 1.4;">
                ${zona.descricao}
            </p>
            <div style="font-size: 0.8rem; background: #f8fafc; padding: 8px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
                <strong>👷 Responsáveis:</strong> ${nomesResponsaveis}
            </div>
            <div class="zona-status" id="status-${zona.id}">
                ⏳ A carregar status...
            </div>
            <a href="formulario-limpeza.html?zona_id=${zona.id}" class="btn-auditoria" onclick="event.stopPropagation()">
                📋 Iniciar Auditoria (5S)
            </a>
        `;
    gridZonas.appendChild(card);
  });
}

function atualizarStatusZonas(auditorias) {
  catalogoZonas.forEach((zona) => {
    const statusEl = document.getElementById(`status-${zona.id}`);
    const ultimaAuditoria = auditorias.find((a) => a.zonaId === zona.id);

    if (!ultimaAuditoria) {
      statusEl.textContent = "⚪ Sem registos";
      statusEl.style.background = "#f1f5f9";
      statusEl.style.color = "#475569";
    } else {
      const status = ultimaAuditoria.statusVisual;
      if (status === "Conforme") {
        statusEl.textContent = "🟢 Limpo / Conforme";
        statusEl.style.background = "#d1fae5";
        statusEl.style.color = "#065f46";
      } else if (status === "Atencao") {
        statusEl.textContent = "🟡 Requer Atenção";
        statusEl.style.background = "#fef3c7";
        statusEl.style.color = "#92400e";
      } else if (status === "Critico") {
        statusEl.textContent = "🔴 Crítico / Sujo";
        statusEl.style.background = "#fee2e2";
        statusEl.style.color = "#991b1b";
      }
    }
  });
}

function calcularMelhorFuncionario(auditorias, dias) {
  const limiteTempo = Date.now() - dias * 24 * 60 * 60 * 1000;
  const auditoriasValidas = auditorias.filter(
    (a) => (a.timestampEnvio || 0) >= limiteTempo
  );

  if (auditoriasValidas.length === 0) return null;

  const pontuacoes = {};
  auditoriasValidas.forEach((a) => {
    const funcId = a.funcionarioAvaliado;
    if (!pontuacoes[funcId]) pontuacoes[funcId] = { soma: 0, count: 0 };
    pontuacoes[funcId].soma += parseFloat(a.notaLimpeza || 0);
    pontuacoes[funcId].count += 1;
  });

  let melhorId = null;
  let melhorMedia = -1;

  for (const [id, dados] of Object.entries(pontuacoes)) {
    const media = dados.soma / dados.count;
    if (media > melhorMedia) {
      melhorMedia = media;
      melhorId = id;
    }
  }

  const funcObj = equipeLimpeza.find((f) => f.id === melhorId);
  return { nome: funcObj ? funcObj.nome : "Desconhecido", nota: melhorMedia };
}

function atualizarPodios(auditorias) {
  const destaqueSemana = calcularMelhorFuncionario(auditorias, 7);
  const destaqueMes = calcularMelhorFuncionario(auditorias, 30);

  // Atualiza Semana
  const elNomeSemana = document.getElementById("destaque-semana-nome");
  const elNotaSemana = document.getElementById("destaque-semana-nota");
  if (destaqueSemana) {
    elNomeSemana.textContent = destaqueSemana.nome;
    elNotaSemana.innerHTML = `${destaqueSemana.nota.toFixed(
      1
    )}<span style='font-size:0.7rem; margin-left:2px;'>/10</span>`;
    if (destaqueSemana.nota >= 8) elNotaSemana.style.color = "var(--success)";
    else if (destaqueSemana.nota >= 5)
      elNotaSemana.style.color = "var(--warning)";
    else elNotaSemana.style.color = "var(--danger)";
  } else {
    elNomeSemana.textContent = "Sem avaliações";
    elNotaSemana.textContent = "--";
  }

  // Atualiza Mês
  const elNomeMes = document.getElementById("destaque-mes-nome");
  const elNotaMes = document.getElementById("destaque-mes-nota");
  if (destaqueMes) {
    elNomeMes.textContent = destaqueMes.nome;
    elNotaMes.innerHTML = `${destaqueMes.nota.toFixed(
      1
    )}<span style='font-size:0.7rem; margin-left:2px;'>/10</span>`;
    if (destaqueMes.nota >= 8) elNotaMes.style.color = "#065f46";
    else if (destaqueMes.nota >= 5) elNotaMes.style.color = "#856404";
    else elNotaMes.style.color = "#991b1b";
  } else {
    elNomeMes.textContent = "Sem avaliações";
    elNotaMes.textContent = "--";
  }
}

async function iniciarPainelLimpeza() {
  renderizarZonasVazias();
  try {
    const auditorias = await obterTodasAuditoriasLimpeza();
    atualizarStatusZonas(auditorias);
    atualizarPodios(auditorias);
  } catch (error) {
    console.error("Erro na BD:", error);
    document.getElementById("destaque-semana-nome").textContent =
      "Erro de Ligação";
    document.getElementById("destaque-mes-nome").textContent =
      "Erro de Ligação";
  }
}

document.addEventListener("DOMContentLoaded", iniciarPainelLimpeza);
