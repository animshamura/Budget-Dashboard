const apiUrl = "https://budget-be-production.up.railway.app/transactions/";
let currentPage = 1;
const limit = 10;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", function () {
    fetchTransactions();
    
    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchTransactions();
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchTransactions();
        }
    });
});

async function fetchTransactions() {
    const skip = (currentPage - 1) * limit;

    try {
        const response = await fetch(`${apiUrl}?skip=${skip}&limit=${limit}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Update total pages
        totalPages = Math.ceil(data.total_count / limit);

        // Update the table
        updateTable(data.transactions);

        // Update pagination controls
        document.getElementById("pageNumber").textContent = `Page: ${currentPage}`;
        document.getElementById("prevPage").disabled = currentPage === 1;
        document.getElementById("nextPage").disabled = currentPage === totalPages;
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("There was an error fetching the transactions. Please try again.");
    }
}

function updateTable(transactions) {
    const tableBody = document.querySelector("#transactionTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    transactions.forEach(transaction => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.t_id}</td>
            <td>${transaction.amount.toFixed(2)}</td>
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.subsidiary_id}</td>
            <td>${transaction.sector}</td>
            <td>${transaction.user_id}</td>
        `;
        tableBody.appendChild(row);
    });
}
