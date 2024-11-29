const incomeForm = document.querySelector("#income-form");
const tableBody = document.querySelector("#income-table-body");

let currentPage = 1;
const limit = 10;

// Pagination
async function fetchIncomes(page = currentPage) {
  try {
    const response = await fetch(`../../backend/fetch_incomes.php?page=${page}&limit=${limit}`);
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    renderIncome(data.data);
    renderPagination(data.total, data.page, data.limit);
  } catch (error) {
    console.error("error fetching income: ", error);
  }
}

// Render tabel data pengeluaran
function renderIncome(incomes) {
  const tableBody = document.querySelector("#income-table-body"); // pastiin udah di definisiin
  tableBody.innerHTML = ""; // bersihkan tabel
  incomes.forEach((income) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${income.category}</td>
        <td>${parseFloat(income.amount).toLocaleString()}</td>
        <td>${income.date}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteIncome(${income.id})">Delete</button></td>
    `;
    tableBody.appendChild(row);
  });
}

// Render tombol pagination
function renderPagination(total, currentPage, limit) {
  const totalPages = Math.ceil(total / limit);
  const paginationContainer = document.querySelector("#pagination");
  paginationContainer.innerHTML = ""; // bersihkan pagination

  // Tombol Previous
  const prevItem = document.createElement("li");
  prevItem.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevItem.innerHTML = `
      <a class="page-link" href="#" tabindex="-1">Previous</a>
    `;
  if (currentPage > 1) {
    prevItem.querySelector("a").onclick = (e) => {
      e.preventDefault();
      fetchIncomes(currentPage - 1);
    };
  }
  paginationContainer.appendChild(prevItem);

  // Tombol Halaman
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `
        <a class="page-link" href="#">${i}</a>
      `;
    if (i !== currentPage) {
      pageItem.querySelector("a").onclick = (e) => {
        e.preventDefault();
        fetchIncomes(i);
      };
    }
    paginationContainer.appendChild(pageItem);
  }

  // Tombol Next
  const nextItem = document.createElement("li");
  nextItem.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextItem.innerHTML = `
    <a class="page-link" href="#">Next</a>
  `;
  if (currentPage < totalPages) {
    nextItem.querySelector("a").onclick = (e) => {
      e.preventDefault();
      fetchIncomes(currentPage + 1);
    };
  }
  paginationContainer.appendChild(nextItem);
}

// delete income
async function deleteIncome(id) {
  await fetch("../../backend/delete_incomes.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  fetchChartData();
  fetchIncomes(); //refresh table
}

// add incomes
incomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;

  await fetch("../../backend/add_incomes.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, amount, date }),
  });

  fetchChartData();
  fetchIncomes(); //refresh table
  incomeForm.reset();
});

let monthlyChart;
// fetch data untuk chart
async function fetchChartData() {
  const response = await fetch("../../backend/fetch_incomes_chart.php");
  const data = await response.json();

  renderMonthlyChart(data.monthly);
}

// Render monthly chart
function renderMonthlyChart(monthlyData) {
  if (monthlyChart) monthlyChart.destroy(); // destroy old chart

  const labels = monthlyData.map((item) => item.month);
  const values = monthlyData.map((item) => item.total);

  monthlyChart = new Chart(document.getElementById("monthlyChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Monthly Incomes",
          data: values,
          borderWidth: 2,
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: (ctx) => "Point Style: " + ctx.chart.data.datasets[0].pointStyle,
        },
        legend: { display: true },
      },
    },
  });
}

fetchChartData();
fetchIncomes();
