const colorPalettes = ["#00b4d8", "#48cae4", "#0077b6", "#90e0ef", "#023e8a"];

// 🧠 Chart + data storage
const charts = {};
const datasets = {
  assetClass: [],
  sectors: [],
  countries: [],
  currencies: []
};

// ========== 💾 Load & Save Helpers ==========
function saveData() {
  localStorage.setItem("holisticDashboardData", JSON.stringify(datasets));
}

function loadData() {
  const saved = localStorage.getItem("holisticDashboardData");
  if (saved) {
    const parsed = JSON.parse(saved);
    for (const key in parsed) {
      if (datasets[key]) datasets[key] = parsed[key];
    }
  }
}

// ========== 📊 Chart Updating ==========
function updateChart(tab) {
  const ctxId = `${tab.replace("Class", "")}Chart`;
  const ctx = document.getElementById(ctxId);
  if (!ctx) return;

  const data = datasets[tab];
  const categories = {};

  // Sum by category
  data.forEach(d => {
    categories[d.category] = (categories[d.category] || 0) + d.value;
  });

  const labels = Object.keys(categories);
  const values = Object.values(categories);
  const colors = colorPalettes.slice(0, labels.length);

  // Destroy old chart
  if (charts[tab]) charts[tab].destroy();

  // Create new chart
  charts[tab] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "#cfd8e3" } }
      },
      cutout: "70%"
    }
  });

  updateStats(tab, categories);
}

// ========== 📈 Update Totals + Breakdown ==========
function updateStats(tab, categories) {
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  const idBase = tab.replace("Class", "");

  const totalElem = document.getElementById(`${idBase}Total`);
  if (totalElem) totalElem.textContent = `${total.toLocaleString()} €`;

  const breakdown = document.getElementById(`${idBase}Breakdown`);
  if (!breakdown) return;

  breakdown.innerHTML = "";
  for (const [cat, val] of Object.entries(categories)) {
    const li = document.createElement("li");
    const pct = ((val / total) * 100).toFixed(2);
    li.textContent = `${cat}: ${pct}% (${val.toLocaleString()} €)`;
    breakdown.appendChild(li);
  }
}

// ========== 📝 Add Form Functionality ==========
function setupForm(tab) {
  const idBase = tab.replace("Class", "");
  const form = document.getElementById(`${idBase}Form`);
  const list = document.getElementById(`${idBase}List`);
  if (!form || !list) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const cat = form.querySelector("select").value;
    const name = form.querySelector('input[type="text"]').value.trim();
    const val = parseFloat(form.querySelector('input[type="number"]').value);

    if (!name || isNaN(val) || val <= 0) return;

    datasets[tab].push({ category: cat, name, value: val });
    saveData();
    renderList(tab, list);
    updateChart(tab);
    form.reset();
  });
}

// ========== 📋 Render Lists ==========
function renderList(tab, list) {
  list.innerHTML = "";
  datasets[tab].forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = `${item.category}: ${item.name} — ${item.value.toLocaleString()} €`;

    // Click to delete
    li.addEventListener("click", () => {
      datasets[tab].splice(i, 1);
      saveData();
      renderList(tab, list);
      updateChart(tab);
    });

    list.appendChild(li);
  });
}

// ========== 🗂️ Tab Switching ==========
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
    updateChart(tab);
  });
});

// ========== 🚀 Initialize ==========
loadData();

["assetClass", "sectors", "countries", "currencies"].forEach(tab => {
  setupForm(tab);
  const list = document.getElementById(`${tab.replace("Class", "")}List`);
  renderList(tab, list);
  updateChart(tab);
});