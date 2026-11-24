
const form = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalSpending = document.getElementById("total-spending");

// Load previously saved expenses
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Add a new expense
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("expense-name").value.trim();
    const amount = Number(document.getElementById("expense-amount").value);
    const category = document.getElementById("expense-category").value;
    const date = document.getElementById("expense-date").value;

    if (!name || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid expense.");
        return;
    }

    const expense = {
    id: Date.now() + Math.random(),
    name: name,
    amount: amount,
    category: category
};

    expenses.push(expense);

    saveExpenses();
    displayExpenses();

    form.reset();
});

// Save expenses in the browser
function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Delete an expense
function deleteExpense(id) {
    expenses = expenses.filter(function(expense) {
        return expense.id !== id;
    });

    saveExpenses();
    displayExpenses();
}

// Display expenses and total spending
function displayExpenses() {
    expenseList.innerHTML = "";

    let total = 0;

    expenses.forEach(function(expense) {
        total += expense.amount;

        const item = document.createElement("li");

        const details = document.createElement("span");
        details.textContent = expense.name + " (" + expense.category + ")";

        const amount = document.createElement("strong");
        amount.textContent = "$" + expense.amount.toFixed(2);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", function() {
            deleteExpense(expense.id);
        });

        item.appendChild(details);
        item.appendChild(amount);
        item.appendChild(deleteButton);

        expenseList.appendChild(item);
    });

    totalSpending.textContent = "$" + total.toFixed(2);
    displayCategoryChart();
}

// Display saved expenses when the page opens
displayExpenses();

// Display spending by category
function displayCategoryChart() {
    const chart = document.getElementById("category-chart");

    chart.innerHTML = "";

    const categoryTotals = {};

    expenses.forEach(function(expense) {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += expense.amount;
    });

    const total = Object.values(categoryTotals).reduce(
        (sum, amount) => sum + amount, 0
    );

    if (total === 0) {
        chart.textContent = "Add an expense to see your chart.";
        return;
    }

    Object.keys(categoryTotals).forEach(function(category) {
        const amount = categoryTotals[category];
        const percentage = (amount / total) * 100;

        const row = document.createElement("div");
        row.className = "chart-row";

        const label = document.createElement("div");
        label.className = "chart-label";
        label.textContent =
            category + " — $" + amount.toFixed(2) +
            " (" + percentage.toFixed(1) + "%)";

        const barBackground = document.createElement("div");
        barBackground.className = "chart-bar-background";

        const bar = document.createElement("div");
        bar.className = "chart-bar";
        bar.style.width = percentage + "%";

        barBackground.appendChild(bar);
        row.appendChild(label);
        row.appendChild(barBackground);
        chart.appendChild(row);
    });
}


// Show the chart when the page opens
displayCategoryChart();

// CSV EXPENSE IMPORT

const csvFileInput = document.getElementById("csv-file");
const importButton = document.getElementById("import-button");
const importMessage = document.getElementById("import-message");

importButton.addEventListener("click", async function() {
    const file = csvFileInput.files[0];

    if (!file) {
        importMessage.textContent = "Please choose a CSV file first.";
        return;
    }

    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);

    if (lines.length < 2) {
        importMessage.textContent = "The CSV file has no transactions.";
        return;
    }

    const headers = lines[0].split(",").map(
        header => header.trim().toLowerCase()
    );

    const descriptionIndex = headers.indexOf("description");
    const amountIndex = headers.indexOf("amount");
    const categoryIndex = headers.indexOf("category");

    if (descriptionIndex === -1 || amountIndex === -1) {
        importMessage.textContent =
            "CSV must contain Description and Amount columns.";
        return;
    }

    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",").map(
            value => value.trim()
        );

        const name = columns[descriptionIndex];
        const amount = Number(columns[amountIndex]);
        const category = categoryIndex >= 0
            ? columns[categoryIndex] || "Other"
            : "Other";

        if (!name || !Number.isFinite(amount) || amount <= 0) {
            continue;
        }

        expenses.push({
            id: Date.now() + Math.random(),
            name: name,
            amount: amount,
            category: category
        });

        importedCount++;
    }

    saveExpenses();
    displayExpenses();

    importMessage.textContent =
        importedCount + " expenses imported successfully.";

    csvFileInput.value = "";
});
