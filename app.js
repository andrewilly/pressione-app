const form = document.getElementById("form");
const ctx = document.getElementById("chart").getContext("2d");
const list = document.getElementById("list");
const statsDiv = document.getElementById("stats");

let data = JSON.parse(localStorage.getItem("bpData")) || [];

// ----------------------
// SALVATAGGIO DATI
// ----------------------
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

// ----------------------
// RISCHIO CLINICO
// ----------------------
function getRiskClass(s, d) {
  if (s < 130 && d < 85) return "normal";
  if (s < 140 || d < 90) return "warning";
  return "danger";
}

// ----------------------
// LISTA DATI
// ----------------------
function renderList() {
  list.innerHTML = "";

  data.forEach(d => {
    const li = document.createElement("li");
    li.className = `item ${getRiskClass(d.systolic, d.diastolic)}`;

    li.innerHTML = `
      <strong>${d.date}</strong><br>
      ${d.systolic}/${d.diastolic} mmHg
    `;

    list.appendChild(li);
  });
}

// ----------------------
// STATISTICHE
// ----------------------
function renderStats() {
  if (data.length === 0) {
    statsDiv.innerHTML = "Nessun dato disponibile";
    return;
  }

  const avgS = (data.reduce((a,b)=>a+b.systolic,0)/data.length).toFixed(1);
  const avgD = (data.reduce((a,b)=>a+b.diastolic,0)/data.length).toFixed(1);

  let status = "Normale";
  if (avgS >= 140 || avgD >= 90) status = "Ipertensione";
  else if (avgS >= 130 || avgD >= 85) status = "Borderline";

  statsDiv.innerHTML = `
    <strong>Media pressione:</strong><br>
    Sistolica: ${avgS} mmHg<br>
    Diastolica: ${avgD} mmHg<br><br>
    <strong>Valutazione:</strong> ${status}
  `;
}

// ----------------------
// GRAFICO REFERTI MEDICO
// ----------------------
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
          pointRadius: 4
        },
        {
          label: "Diastolica",
          data: diastolic,
          borderWidth: 3,
          tension: 0.25,
          pointRadius: 4
        },

        // Soglie cliniche
        {
          label: "120 (normale)",
          data: s120,
          borderDash: [6,6],
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: "140 (rischio)",
          data: s140,
          borderDash: [6,6],
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: "80 (diastolica normale)",
          data: d80,
          borderDash: [6,6],
          borderWidth: 1,
          pointRadius: 0
        },
        {
          label: "90 (rischio)",
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
          text: "Referto andamento pressione arteriosa"
        },
        legend: {
          position: "top"
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} mmHg`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          grid: { color: "#e0e0e0" },
          ticks: { stepSize: 10 }
        }
      }
    }
  });
}

// ----------------------
// UPDATE UI
// ----------------------
function updateUI() {
  renderList();
  renderStats();
  renderChart();
}

updateUI();