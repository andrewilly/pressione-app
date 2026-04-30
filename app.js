document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form");
const ctx = document.getElementById("chart").getContext("2d");
const list = document.getElementById("list");
const statsDiv = document.getElementById("stats");

let data = JSON.parse(localStorage.getItem("bpData")) || [];

// --------------------
// SALVATAGGIO DATI
// --------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const entry = {
    date: document.getElementById("date").value,
    systolic: +document.getElementById("systolic").value,
    diastolic: +document.getElementById("diastolic").value,
    pulse: +document.getElementById("pulse").value || null
  };

  data.push(entry);
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  localStorage.setItem("bpData", JSON.stringify(data));

  form.reset();
  updateUI();
});

// --------------------
// STATISTICHE
// --------------------
function renderStats() {
  if (data.length === 0) {
    statsDiv.innerHTML = "Nessun dato disponibile";
    return;
  }

  const avgS = (data.reduce((a,b)=>a+b.systolic,0)/data.length).toFixed(1);
  const avgD = (data.reduce((a,b)=>a+b.diastolic,0)/data.length).toFixed(1);

  statsDiv.innerHTML = `
    <strong>Media pressione:</strong><br>
    Sistolica: ${avgS} mmHg<br>
    Diastolica: ${avgD} mmHg
  `;
}

// --------------------
// LISTA
// --------------------
function renderList() {
  list.innerHTML = "";

  data.forEach(d => {
    const li = document.createElement("li");
    li.className = "item";

    li.innerHTML = `
      <strong>${d.date}</strong><br>
      ${d.systolic}/${d.diastolic} mmHg
    `;

    list.appendChild(li);
  });
}

// --------------------
// GRAFICO MEDICO
// --------------------
function renderChart() {
  if (data.length === 0) return;

  const labels = data.map(d => d.date);
  const systolic = data.map(d => d.systolic);
  const diastolic = data.map(d => d.diastolic);

  const s120 = labels.map(()=>120);
  const s140 = labels.map(()=>140);
  const d80 = labels.map(()=>80);
  const d90 = labels.map(()=>90);

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Sistolica",
          data: systolic,
          borderWidth: 3,
          tension: 0.25,
          pointRadius: 3
        },
        {
          label: "Diastolica",
          data: diastolic,
          borderWidth: 3,
          tension: 0.25,
          pointRadius: 3
        },

        {
          label: "120",
          data: s120,
          borderDash: [6,6],
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: "140",
          data: s140,
          borderDash: [6,6],
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: "80",
          data: d80,
          borderDash: [6,6],
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: "90",
          data: d90,
          borderDash: [6,6],
          borderWidth: 1,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        title: {
          display: true,
          text: "Referto pressione arteriosa"
        },
        legend: {
          position: "top"
        }
      },

      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          grid: { color: "#eee" },
          ticks: { stepSize: 10 }
        }
      }
    }
  });
}

// --------------------
// UPDATE UI
// --------------------
function updateUI() {
  renderStats();
  renderList();
  renderChart();
}

updateUI();

});