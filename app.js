document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form");

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
// 🧠 AI CLINICA
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

  // soglie cliniche semplificate
  if (avgS >= 140 || avgD >= 90) {
    risk = "alto";
    reasons.push("pressione media sopra soglia ipertensiva (≥140/90 mmHg)");
  } else if (avgS >= 130 || avgD >= 85) {
    risk = "moderato";
    reasons.push("valori medi borderline (130–139 / 85–89 mmHg)");
  } else {
    reasons.push("valori medi nei range normali");
  }

  // trend
  if (trendS > 10 || trendD > 10) {
    reasons.push("trend in aumento dei valori pressori");
  } else if (trendS < -10 || trendD < -10) {
    reasons.push("trend in diminuzione dei valori pressori");
  } else {
    reasons.push("andamento stabile nel tempo");
  }

  el.innerHTML = `
    <strong>Valutazione clinica AI</strong><br><br>

    <strong>Rischio stimato:</strong> ${risk}<br><br>

    <strong>Motivazione:</strong>
    <ul style="margin:8px 0 0 18px; padding:0;">
      ${reasons.map(r => `<li>${r}</li>`).join("")}
    </ul>
  `;
}

// --------------------
// UPDATE UI
// --------------------
function updateUI() {
  renderStats();
  renderList();
  renderAI();
}

updateUI();

});