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
// LISTA MISURAZIONI
// --------------------
function renderList() {

  const list = document.getElementById("list");

  if (!list) return;

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
// AI CLINICA
// --------------------
function renderAI() {

  const el = document.getElementById("aiReport");

  if (data.length < 3) {
    el.innerHTML = "Dati insufficienti per analisi clinica (minimo 3 misurazioni).";
    return;
  }

  const s = data.map(d => d.systolic);
  const d = data.map(d => d.diastolic);

  const avgS = s.reduce((a,b)=>a+b,0)/s.length;
  const avgD = d.reduce((a,b)=>a+b,0)/d.length;

  let risk = "basso";
  if (avgS >= 140 || avgD >= 90) risk = "alto";
  else if (avgS >= 130 || avgD >= 85) risk = "moderato";

  el.innerHTML = `
    <strong>Valutazione clinica AI</strong><br>
    Rischio stimato: ${risk}
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
        {
          label: "Sistolica",
          data: s,
          borderWidth: 3,
          tension: 0.3
        },
        {
          label: "Diastolica",
          data: d,
          borderWidth: 3,
          tension: 0.3
        }
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