const form = document.getElementById("form");
const ctx = document.getElementById("chart").getContext("2d");

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
  localStorage.setItem("bpData", JSON.stringify(data));

  form.reset();
  renderChart();
});

function renderChart() {
  const labels = data.map(d => d.date);
  const systolic = data.map(d => d.systolic);
  const diastolic = data.map(d => d.diastolic);

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sistolica",
          data: systolic,
          borderWidth: 2
        },
        {
          label: "Diastolica",
          data: diastolic,
          borderWidth: 2
        }
      ]
    }
  });
}

renderChart();