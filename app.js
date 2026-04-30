document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form");
const ctx = document.getElementById("chart").getContext("2d");

let data = JSON.parse(localStorage.getItem("bpData")) || [];

// --------------------
// SALVATAGGIO
// --------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  data.push({
    date: document.getElementById("date").value,
    systolic: +document.getElementById("systolic").value,
    diastolic: +document.getElementById("diastolic").value,
    pulse: +document.getElementById("pulse").value || null
  });

  data.sort((a,b)=> new Date(a.date) - new Date(b.date));

  localStorage.setItem("bpData", JSON.stringify(data));

  form.reset();
  updateUI();
});

// --------------------
// MEDIA
// --------------------
function renderStats() {

  const el = document.getElementById("stats");

  if (data.length === 0) {
    el.innerHTML = "Nessun dato disponibile";
    return;
  }

  const avgS = (data.reduce((a,b)=>a+b.systolic,0)/data.length).toFixed(1);
  const avgD = (data.reduce((a,b)=>a+b.diastolic,0)/data.length).toFixed(1);

  el.innerHTML = `Media pressione: ${avgS}/${avgD} mmHg`;
}

// --------------------
// LISTA
// --------------------
function renderList() {

  const list = document.getElementById("list");

  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = "<li>Nessuna misurazione disponibile</li>";
    return;
  }

  data.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.date} → ${d.systolic}/${d.diastolic} bpm:${d.pulse ?? "-"}`;
    list.appendChild(li);
  });
}

// --------------------
// 🧠 AI CLINICA EVOLUTA
// --------------------
function renderAI() {

  const el = document.getElementById("aiReport");

  if (data.length < 3) {
    el.innerHTML = "Dati insufficienti per analisi clinica (minimo 3 misurazioni).";
    return;
  }

  const systolic = data.map(d => d.systolic);
  const diastolic = data.map(d => d.diastolic);

  const avgS = systolic.reduce((a,b)=>a+b,0)/systolic.length;
  const avgD = diastolic.reduce((a,b)=>a+b,0)/diastolic.length;

  const trendS = systolic[systolic.length-1] - systolic[0];
  const trendD = diastolic[diastolic.length-1] - diastolic[0];

  let risk = "basso";
  let reasons = [];

  // --------------------
  // CRITERI CLINICI SEMPLIFICATI
  // --------------------

  if (avgS >= 140 || avgD >= 90) {
    risk = "alto";
    reasons.push("pressione media sopra soglia ipertensiva (≥140/90 mmHg)");
  } else if (avgS >= 130 || avgD >= 85) {
    risk = "moderato";
    reasons.push("valori medi in fascia borderline (130–139 / 85–89 mmHg)");
  } else {
    reasons.push("valori medi nei range considerati normali");
  }

  // Trend
  if (trendS > 10 || trendD > 10) {
    reasons.push("trend in aumento progressivo dei valori pressori");
  } else if (trendS < -10 || trendD < -10) {
    reasons.push("trend in riduzione dei valori pressori");
  } else {
    reasons.push("andamento stabile nel tempo");
  }

  // Variabilità
  const variabilityS = Math.max(...systolic) - Math.min(...systolic);
  if (variabilityS > 25) {
    reasons.push("elevata variabilità della pressione sistolica");
  }

  // --------------------
  // OUTPUT CLINICO
  // --------------------
  el.innerHTML = `
    <strong>Valutazione clinica AI</strong><br><br>

    <strong>Rischio stimato:</strong> ${risk}<br><br>

    <strong>Motivazione clinica:</strong><br>
    <ul style="margin:8px 0 0 18px; padding:0;">
      ${reasons.map(r => `<li>${r}</li>`).join("")}
    </ul>

    <br>
    <small>
      Parametri analizzati: media pressoria, trend temporale, variabilità dei valori.
    </small>
  `;
}

// --------------------
// GRAFICO
// --------------------
function renderChart() {

  if (data.length === 0) return;

  const labels = data.map(d => d.date);
  const s = data.map(d => d.systolic);
  const d = data.map(d => d.diastolic);

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Sistolica", data: s, borderWidth: 3, tension: 0.3 },
        { label: "Diastolica", data: d, borderWidth: 3, tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// --------------------
// UPDATE UI
// --------------------
function updateUI() {
  renderStats();
  renderList();
  renderAI();
  renderChart();
}

updateUI();

});