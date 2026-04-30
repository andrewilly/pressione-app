document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form");
const ctx = document.getElementById("chart").getContext("2d");

let data = JSON.parse(localStorage.getItem("bpData")) || [];

// --------------------
// SALVA
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
// GRAFICO STABILE MOBILE
// --------------------
function renderChart() {

  if (data.length === 0) return;

  const labels = data.map(d => d.date);
  const s = data.map(d => d.systolic);
  const d = data.map(d => d.diastolic);
  const p = data.map(d => d.pulse);

  const s120 = labels.map(()=>120);
  const s140 = labels.map(()=>140);

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
        },
        {
          label: "Pulsazioni",
          data: p,
          borderWidth: 2,
          borderDash: [4,4],
          pointRadius: 2
        },
        {
          label: "120",
          data: s120,
          borderDash: [6,6],
          pointRadius: 0
        },
        {
          label: "140",
          data: s140,
          borderDash: [6,6],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" }
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "#eee" } }
      }
    }
  });
}

// --------------------
// STATISTICHE
// --------------------
function renderStats() {

  const el = document.getElementById("stats");

  if (data.length === 0) {
    el.innerHTML = "Nessun dato";
    return;
  }

  const avgS = (data.reduce((a,b)=>a+b.systolic,0)/data.length).toFixed(1);
  const avgD = (data.reduce((a,b)=>a+b.diastolic,0)/data.length).toFixed(1);

  let status = "Normale";
  if (avgS >= 140 || avgD >= 90) status = "Ipertensione";
  else if (avgS >= 130 || avgD >= 85) status = "Borderline";

  el.innerHTML = `
    Media: ${avgS}/${avgD} mmHg<br>
    Stato: ${status}
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
// UPDATE UI
// --------------------
function updateUI() {
  renderStats();
  renderList();

  // 🔥 fix mobile rendering
  setTimeout(() => {
    renderChart();
  }, 120);
}

updateUI();

});