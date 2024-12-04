const expenseForm = document.getElementById("expense-form");
const tableBody = document.getElementById("expense-table-body");

let currentPage = 1; // Halaman sekarang
const limit = 10;

// Pagination
async function fetchExpenses(page = currentPage) {
  // Gunakan default value dari currentPage
  try {
    const response = await fetch(`../backend/fetch_expenses.php?page=${page}&limit=${limit}`); // Perbaiki query string
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    renderExpenses(data.data); // Render data ke tabel
    renderPagination(data.total, data.page, data.limit); // Render tombol pagination
  } catch (error) {
    console.error("Error fetching expenses:", error);
  }
}

// Render tabel data pengeluaran
function renderExpenses(expenses) {
  const tableBody = document.getElementById("expense-table-body"); // Pastikan ini didefinisikan
  tableBody.innerHTML = ""; // Bersihkan tabel
  expenses.forEach((expense) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${expense.category}</td>
        <td>${parseFloat(expense.amount).toLocaleString()}</td>
        <td>${expense.date}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button></td>
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
      fetchExpenses(currentPage - 1);
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
        fetchExpenses(i);
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
      fetchExpenses(currentPage + 1);
    };
  }
  paginationContainer.appendChild(nextItem);
}

// add expenses
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;

  await fetch("../backend/add_expenses.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, amount, date }),
  });

  fetchExpenses(); // Refresh table
  fetchChartData(); // Refresh charts
  expenseForm.reset();
});

// Delete expense
async function deleteExpense(id) {
  await fetch("../backend/delete_expenses.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });

  fetchExpenses(); // Refresh table
  fetchChartData(); // Refresh charts
}

let dailyChart, monthlyChart, categoryChart;

// fetch data untuk chart
async function fetchChartData() {
  const response = await fetch("../backend/fetch_expenses_chart.php");
  const data = await response.json();

  if (data.error) {
    console.log(data.error);
    return;
  }

  renderDailyChart(data.daily);
  renderMonthlyChart(data.monthly);
  renderCategoryChart(data.category);
}

// Render daily chart
function renderDailyChart(dailyData) {
  if (dailyChart) dailyChart.destroy(); // Hapus chart lama jika ada

  const labels = dailyData.map((item) => item.date); // Dates
  const values = dailyData.map((item) => item.total); // Totals

  dailyChart = new Chart(document.getElementById("dailyChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Pengeluaran Harian",
          data: values,
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        text: (ctx) => "Point Style: " + ctx.chart.data.datasets[0].pointStyle,
        legend: { display: true },
      },
    },
  });
}

// Render monthly chart
function renderMonthlyChart(monthlyData) {
  if (monthlyChart) monthlyChart.destroy(); // Hapus chart lama jika ada

  const labels = monthlyData.map((item) => item.month); // Months
  const values = monthlyData.map((item) => item.total); // Totals

  monthlyChart = new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Pengeluaran Bulanan",
          data: values,
          backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(255, 205, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(201, 203, 207, 0.2)"],
          borderColor: ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
    },
  });
}

// Render Category chart
function renderCategoryChart(categoryData) {
  if (categoryChart) categoryChart.destroy(); // Hapus chart lama jika ada

  const labels = categoryData.map((item) => item.category); // Kategori sebagai labels
  const values = categoryData.map((item) => parseFloat(item.total)); // Total sebagai data

  // Hitung total semua kategori
  const totalSum = values.reduce((sum, value) => sum + value, 0);

  categoryChart = new Chart(document.getElementById("categoryChart"), {
    type: "doughnut", // Ganti menjadi doughnut untuk kategori
    data: {
      labels: labels, // Kategori
      datasets: [
        {
          label: "Pengeluaran Berdasarkan Kategori",
          data: values, // Total pengeluaran
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#2877b3", "#63ffde", "#FF1748"], // Tambahkan warna untuk setiap kategori
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,

      plugins: {
        legend: {
          display: true,
          position: "top", // Posisi legend
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const label = tooltipItem.label || "";
              const value = tooltipItem.raw || 0;

              // Hitung persentase
              const percentage = ((value / totalSum) * 100).toFixed(2);

              return `${label}: Rp ${value.toLocaleString()} (${Math.round(percentage)}%)`;
            },
          },
        },
      },
    },
  });
}

fetchChartData();

fetchExpenses();
