document.getElementById("uploadForm").addEventListener("submit", async e => {
  e.preventDefault();
  const file = document.getElementById("fileInput").files[0];
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/upload", { method: "POST", body: file });
  const data = await res.json();

  const tbody = document.querySelector("#results tbody");
  tbody.innerHTML = "";
  data.investments.forEach(inv => {
    const row = `<tr>
      <td>${inv.symbol}</td>
      <td>${inv.quantity}</td>
      <td>${inv.buyPrice.toFixed(2)}</td>
      <td>${inv.currentPrice.toFixed(2)}</td>
      <td>${inv.profitLoss.toFixed(2)}</td>
    </tr>`;
    tbody.innerHTML += row;
  });

  document.getElementById("summary").innerHTML =
    `<h3>Total Value: $${data.totalValue.toFixed(2)} | Total P/L: $${data.totalProfitLoss.toFixed(2)}</h3>`;
});