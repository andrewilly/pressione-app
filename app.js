const form = document.getElementById("form");
const ctx = document.getElementById("chart").getContext("2d");
const list = document.getElementById("list");
const statsDiv = document.getElementById("stats");

let data = JSON.parse(localStorage.getItem("bpData")) || [];

// Salvataggio dati
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

// Classificazione rischio
function getRiskClass(s, d) {
  if (s < 130 && d < 85) return "normal";
  if (s < 140 && d < 90) return "warning";
  return "danger";
}

// Lista dati
function renderList() {
  list.innerHTML = "";

  data.forEach((d) => {
    const li = document.createElement("li");
    li.className = `item ${getRiskClass(d.systolic, d.diastolic)}`;

    li.innerHTML = `
      <strong>${d.date}</strong><br>
      ${d.systolic}/${d.diastolic} mmHg
    `;

    list.appendChild(li);
  });
}

// Statistiche
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

// Grafico
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

// Export PNG
document.getElementById("exportBtn").addEventListener("click", () => {
  if (!window.chart) return;

  const url = window.chart.toBase64Image();

  const link = document.createElement("a");
  link.href = url;
  link.download = "grafico_pressione.png";
  link.click();
});

// Export PDF
document.getElementById("pdfBtn").addEventListener("click", () => {
  if (data.length === 0) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const avgS = (data.reduce((s,d)=>s+d.systolic,0)/data.length).toFixed(1);
  const avgD = (data.reduce((s,d)=>s+d.diastolic,0)/data.length).toFixed(1);

  let status = "Normale";
  if (avgS >= 140 || avgD >= 90) status = "Ipertensione";
  else if (avgS >= 130 || avgD >= 85) status = "Borderline";

  doc.setFontSize(16);
  doc.text("Report Pressione Arteriosa", 10, 15);

  const startDate = data[0].date;
  const endDate = data[data.length - 1].date;

  doc.setFontSize(10);
  doc.text(`Periodo: ${startDate} - ${endDate}`, 10, 25);
  doc.text(`Media Sistolica: ${avgS} mmHg`, 10, 35);
  doc.text(`Media Diastolica: ${avgD} mmHg`, 10, 42);
  doc.text(`Valutazione: ${status}`, 10, 52);

  const chartImg = window.chart.toBase64Image();
  doc.addImage(chartImg, "PNG", 10, 60, 180, 80);

  doc.save("report_pressione.pdf");
});

// Update UI
function updateUI() {
  renderList();
  renderStats();
  renderChart();
}

updateUI();