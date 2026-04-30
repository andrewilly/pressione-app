document.addEventListener("DOMContentLoaded", () => {

const form = document.getElementById("form");

let data = JSON.parse(localStorage.getItem("bpData")) || [];

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
    el.innerHTML = "Nessuna misurazione registrata";
    return;
  }

  const avgS = data.reduce((a,b)=>a+b.systolic,0)/data.length;
  const avgD = data.reduce((a,b)=>a+b.diastolic,0)/data.length;

  el.innerHTML = `Media pressoria: ${avgS.toFixed(1)}/${avgD.toFixed(1)} mmHg`;
}

// --------------------
// LISTA
// --------------------
function renderList() {

  const list = document.getElementById("list");
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = "<li>Nessun dato disponibile</li>";
    return;
  }

  data.forEach(d => {
    const li = document.createElement("li");
    li.textContent = `${d.date} → ${d.systolic}/${d.diastolic} bpm:${d.pulse ?? "-"}`;
    list.appendChild(li);
  });
}

// --------------------
// 🧠 ESC / EHS CLASSIFICATION
// --------------------
function renderESC() {

  const el = document.getElementById("escReport");

  if (data.length < 3) {
    el.innerHTML = "Classificazione ESC/EHS disponibile da almeno 3 misurazioni.";
    return;
  }

  const systolic = data.map(d => d.systolic);
  const diastolic = data.map(d => d.diastolic);

  const avgS = systolic.reduce((a,b)=>a+b,0)/systolic.length;
  const avgD = diastolic.reduce((a,b)=>a+b,0)/diastolic.length;

  let category = "";
  let color = "🔵";

  if (avgS < 120 && avgD < 80) {
    category = "Pressione ottimale";
    color = "🟢";
  }
  else if (avgS < 130 && avgD < 85) {
    category = "Pressione normale";
    color = "🟢";
  }
  else if (avgS < 140 || avgD < 90) {
    category = "Normale-alta";
    color = "🟡";
  }
  else if (avgS < 160 || avgD < 100) {
    category = "Ipertensione grado 1";
    color = "🟠";
  }
  else if (avgS < 180 || avgD < 110) {
    category = "Ipertensione grado 2";
    color = "🔴";
  }
  else {
    category = "Ipertensione grado 3";
    color = "🔴";
  }

  el.innerHTML = `
    <strong>Classificazione ESC/EHS</strong><br><br>

    ${color} <strong>${category}</strong><br><br>

    <strong>Valori medi:</strong> ${avgS.toFixed(1)} / ${avgD.toFixed(1)} mmHg<br><br>

    <small>
      Classificazione basata su linee guida ESC/EHS (semplificata per monitoraggio domiciliare).
    </small>
  `;
}

// --------------------
function updateUI() {
  renderStats();
  renderList();
  renderESC();
}

updateUI();

});