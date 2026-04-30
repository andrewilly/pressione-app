const form = document.getElementById("form");
const ctx = document.getElementById("chart").getContext("2d");
const list = document.getElementById("list");
const statsDiv = document.getElementById("stats");

let data = JSON.parse(localStorage.getItem("bpData")) || [];

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const entry = {
    date: document.getElementById("date").value,
    systolic: +document.getElementById("systolic").value,
    diastolic: +document.getElementById("diastolic").value,
    pulse: +document.getElementById("pulse").value || null
  };

  data.push(entry);
  data.sort((a,b) => new Date(a.date) - new Date(b.date));

  localStorage.setItem("bpData", JSON.stringify(data));

  form.reset();
  updateUI();
});

function getRiskClass(s, d) {
  if (s < 130 && d < 85) return "normal";
  if (s < 140 && d < 90) return "warning";
  return "danger";
}

function renderList() {
  list.innerHTML = "";

  data.forEach((d, index) => {
    const li = document.createElement("li");
    li.className = `item ${getRiskClass(d.systolic, d.diastolic)}`;

    li.innerHTML = `
      <strong>${d.date}</strong><br>
      ${d.systolic}/${d.diastolic} mmHg
    `;

    list.appendChild(li);
  });
}

function renderStats() {
  if (data.length === 0) {
    statsDiv.innerHTML = "Nessun dato";
    return;
  }

  const avgS = (data.reduce((sum,d)=>sum+d.systolic,0)/data.length).toFixed(1);
  const avgD = (data.reduce((sum,d)=>sum+d.diastolic,0)/data.length).toFixed(1);

  statsDiv.innerHTML = `
    <strong>Media:</strong><br>
    Sistolica: ${avgS} mmHg<br>
    Diastolica: ${avgD} mmHg
  `;
}

function renderChart() {
  const labels = data.map(d => d.date);
  const systolic = data.map(d => d.systolic);
  const diastolic = data.map(d => d.diastolic);

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Sistolica", data: systolic },
        { label: "Diastolica", data: diastolic }
      ]
    }
  });
}

function updateUI() {
  renderList();
  renderStats();
  renderChart();
}

updateUI();