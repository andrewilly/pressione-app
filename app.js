document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form");
const ctx = document.getElementById("chart");

let data = JSON.parse(localStorage.getItem("bpData")) || [];

// --------------------
// SALVA DATI
// --------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  data.push({
    date: document.getElementById("date").value,
    systolic: +document.getElementById("systolic").value,
    diastolic: +document.getElementById("diastolic").value
  });

  data.sort((a,b)=> new Date(a.date) - new Date(b.date));

  localStorage.setItem("bpData", JSON.stringify(data));

  form.reset();
  updateUI();
});

// --------------------
// GRAFICO (FIX MOBILE ROBUSTO)
// --------------------
function renderChart() {

  if (data.length === 0) return;

  const labels = data.map(d => d.date);
  const s = data.map(d => d.systolic);
  const d = data.map(d => d.diastolic);

  const s120 = labels.map(()=>120);
  const s140 = labels.map(()=>140);

  // 🔥 FIX IMPORTANTE: distruggi sicuro
  if (window.chart) {
    window.chart.destroy();
  }

  window.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Sistolica", data: s, borderWidth: 3, tension: 0.3 },
        { label: "Diastolica", data: d, borderWidth: 3, tension: 0.3 },

        { label: "120", data: s120, borderDash: [6,6], pointRadius: 0 },
        { label: "140", data: s140, borderDash: [6,6], pointRadius: 0 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // 🔥 FONDAMENTALE
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
function renderStats() {
  const el = document.getElementById("stats");

  if (data.length === 0) {
    el.innerHTML = "Nessun dato";
    return;
  }

  const avgS = (data.reduce((a,b)=>a+b.systolic,0)/data.length).toFixed(1);
  const avgD = (data.reduce((a,b)=>a+b.diastolic,0)/data.length).toFixed(1);

  el.innerHTML = `Media: ${avgS}/${avgD} mmHg`;
}

// --------------------
function renderList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.date} - ${d.systolic}/${d.diastolic}`;
    list.appendChild(li);
  });
}

// --------------------
function updateUI() {
  renderStats();
  renderList();

  // 🔥 FIX: delay per mobile rendering
  setTimeout(() => {
    renderChart();
  }, 100);
}

updateUI();

});