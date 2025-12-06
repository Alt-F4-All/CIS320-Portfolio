let datasets = [];
let portfolioChart = null;
let projectionChart = null;

function saveData() {
  localStorage.setItem("portfolioData", JSON.stringify(datasets));
}
function loadData() {
  const saved = localStorage.getItem("portfolioData");
  if (saved) datasets = JSON.parse(saved);
}

// ====== Portfolio Chart ======
function updatePortfolio() {
  const ctx = document.getElementById("portfolioChart");
  const categories = {};
  datasets.forEach(d => categories[d.category] = (categories[d.category] || 0) + d.value);
  const labels = Object.keys(categories);
  const values = Object.values(categories);

  if (portfolioChart) portfolioChart.destroy();
  portfolioChart = new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data: values, backgroundColor: ["#00b4d8","#48cae4","#0077b6","#90e0ef","#023e8a"] }] },
    options: { plugins: { legend: { labels: { color: "#cfd8e3" } } }, cutout: "70%" }
  });

  const total = values.reduce((a,b)=>a+b,0);
  document.getElementById("portfolioTotal").textContent = `${total.toLocaleString()} €`;
  const breakdown = document.getElementById("portfolioBreakdown");
  breakdown.innerHTML = "";
  for (const [cat,val] of Object.entries(categories)) {
    const pct = ((val/total)*100).toFixed(2);
    const li = document.createElement("li");
    li.textContent = `${cat}: ${pct}% (${val.toLocaleString()} €)`;
    breakdown.appendChild(li);
  }
}

document.getElementById("portfolioForm").addEventListener("submit", e => {
  e.preventDefault();
  const category = document.getElementById("portfolioCategory").value;
  const name = document.getElementById("portfolioName").value.trim();
  const value = parseFloat(document.getElementById("portfolioValue").value);
  if (!name || isNaN(value) || value <= 0) return;
  datasets.push({ category, name, value });
  saveData();
  renderPortfolioList();
  updatePortfolio();
  e.target.reset();
});

function renderPortfolioList() {
  const list = document.getElementById("portfolioList");
  list.innerHTML = "";
  datasets.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = `${item.category}: ${item.name} — ${item.value.toLocaleString()} €`;
    li.addEventListener("click", () => {
      datasets.splice(i, 1);
      saveData();
      renderPortfolioList();
      updatePortfolio();
    });
    list.appendChild(li);
  });
}

// ====== Projection Calculator ======
document.getElementById("projectionForm").addEventListener("submit", e => {
  e.preventDefault();

  const initial = parseFloat(document.getElementById("projInitial").value);
  const monthly = parseFloat(document.getElementById("projMonthly").value);
  const annualReturn = parseFloat(document.getElementById("projReturn").value);
  const years = parseInt(document.getElementById("projYears").value);

  if (isNaN(initial) || isNaN(monthly) || isNaN(annualReturn) || isNaN(years)) return;

  const r = annualReturn / 100 / 12;
  const n = years * 12;
  let balance = initial;
  const data = [];
  const labels = [];

  for (let i = 1; i <= n; i++) {
    balance = balance * (1 + r) + monthly;
    if (i % 12 === 0) {
      data.push(balance);
      labels.push(`Year ${i / 12}`);
    }
  }

  if (projectionChart) projectionChart.destroy();
  projectionChart = new Chart(document.getElementById("projectionChart"), {
    type: "line",
    data: { 
      labels, 
      datasets: [{
        label: "Projected Growth (€)",
        data,
        borderColor: "#00b4d8",
        backgroundColor: "#00b4d833",
        fill: true,
        tension: 0.3
      }]
    },
    options: { plugins: { legend: { labels: { color: "#cfd8e3" } } } }
  });
});

// ====== Tabs + Theme ======
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.getElementById(tab).classList.add("active");
  });
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
});

// ====== Init ======
loadData();
renderPortfolioList();
updatePortfolio();