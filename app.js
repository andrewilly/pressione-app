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
// STATISTICHE BASE
// --------------------
function renderStats() {

  const el = document.getElementById("stats");

  if (data.length === 0) {
    el.innerHTML = "Nessun dato disponibile";
    return;
  }

  const avgS = (data.reduce((a,b)=>a+b.systolic,0)/data.length).toFixed(1);
  const avgD = (data.reduce((a,b)=>a+b.diastolic,0)/data.length).toFixed(1);

  el.innerHTML = `
    <strong>Media pressione:</strong><br>
    ${avgS}/${avgD} mmHg
  `;
}

// --------------------
// LISTA
// --------------------
function renderList() {

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.date} - ${d.systolic}/${d.diastolic} bpm:${d.pulse ?? "-"}`;
    list.appendChild(li);
  });
}

// --------------------
// GRAFICO
// --------------------
function renderChart() {

  if (data.length === 0) return;

  const labels = data.map(d => d.date);
  const s = data.map(d => d.systolic);
  const d = data.map(d => d.diastolic);
  const p = data.map(d => d.pulse);

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Sistolica", data: s, borderWidth: 3, tension: 0.3 },
        { label: "Diastolica", data: d, borderWidth: 3, tension: 0.3 },
        { label: "Pulsazioni", data: p, borderWidth: 2, borderDash: [4,4], pointRadius: 2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// --------------------
// 🧠 AI MEDICA (CORE)
// --------------------
function renderAI() {

  const el = document.getElementById("aiReport");

  if (data.length < 3) {
    el.innerHTML = "Dati insufficienti per valutazione clinica (minimo 3 misurazioni).";
    return;
  }

  const systolic = data.map(d => d.systolic);
  const diastolic = data.map(d => d.diastolic);

  const avgS = systolic.reduce((a,b)=>a+b,0)/systolic.length;
  const avgD = diastolic.reduce((a,b)=>a+b,0)/diastolic.length;

  const trendS = systolic[systolic.length-1] - systolic[0];
  const trendD = diastolic[diastolic.length-1] - diastolic[0];

  let risk = "basso";
  if (avgS >= 140 || avgD >= 90) risk = "alto";
  else if (avgS >= 130 || avgD >= 85) risk = "moderato";

  let trendText = "";

  if (trendS > 10 || trendD > 10) {
    trendText = "📈 Trend clinico in peggioramento con incremento progressivo dei valori pressori.";
  } else if (trendS < -10 || trendD < -10) {
    trendText = "📉 Trend clinico in miglioramento con riduzione progressiva dei valori pressori.";
  } else {
    trendText = "➖ Trend clinico stabile senza variazioni significative.";
  }

  let clinicalNote = "";

  if (risk === "alto") {
    clinicalNote = "⚠️ Profilo compatibile con ipertensione arteriosa. Si suggerisce valutazione medica.";
  } else if (risk === "moderato") {
    clinicalNote = "⚠️ Valori borderline. Monitoraggio consigliato.";
  } else {
    clinicalNote = "✅ Valori compatibili con range pressorio nella norma.";
  }

  el.innerHTML = `
    <strong>Valutazione clinica automatizzata</strong><br><br>

    ${trendText}<br><br>

    <strong>Rischio stimato:</strong> ${risk}<br><br>

    ${clinicalNote}
  `;
}

// --------------------
// UPDATE UI
// --------------------
function updateUI() {
  renderStats();
  renderList();
  renderChart();
  renderAI();
}

updateUI();

});