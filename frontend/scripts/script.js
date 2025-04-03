const colorPalette = [
    "#FF6F61", // Coral
    "#6B8E23", // Olive Drab
    "#FFD700", // Gold
    "#00BFFF", // Deep Sky Blue
    "#8A2BE2", // Blue Violet
    "#FF6347"  // Tomato
];

async function fetchSubsidiaryData() {
    try {
        const response = await fetch("https://budget-be-production.up.railway.app/subsidiaries/");
        const data = await response.json();

        const tableBody = document.getElementById("subsidiary-table");
        tableBody.innerHTML = "";

        const labels = [];
        const usedBudgets = [];
        const remainingBudgets = [];
        const pieColors = [];

        data.forEach((item, index) => {
            labels.push(item.name);
            usedBudgets.push(item.used_budget);
            remainingBudgets.push(item.remaining_budget);
            pieColors.push(colorPalette[index % colorPalette.length]); // Loop through the colors

            tableBody.innerHTML += ` 
                <tr>
                    <td>${item.name}</td>
                    <td>$${item.allocated_budget.toFixed(2)}</td>
                    <td>$${item.used_budget.toFixed(2)}</td>
                    <td>$${item.remaining_budget.toFixed(2)}</td>
                </tr>
            `;
        });

        // Bar Chart for Subsidiary Budget Usage (single color for each budget)
        const barCtx = document.getElementById("subsidiaryBarChart").getContext("2d");
        new Chart(barCtx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Used Budget",
                        data: usedBudgets,
                        backgroundColor: colorPalette[0],  // First color from the palette
                        borderRadius: 8,
                        borderWidth: 1,
                    },
                    {
                        label: "Remaining Budget",
                        data: remainingBudgets,
                        backgroundColor: colorPalette[1],  // Second color from the palette
                        borderRadius: 8,
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "#ddd"
                        }
                    }
                }
            }
        });

        // Pie Chart for Subsidiary Budget Usage (with different colors for each segment)
        const pieCtx = document.getElementById("subsidiaryPieChart").getContext("2d");
        new Chart(pieCtx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [
                    {
                        data: usedBudgets,
                        backgroundColor: pieColors,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': $' + tooltipItem.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching subsidiary data:", error);
        document.getElementById("subsidiary-table").innerHTML = "<tr><td colspan='4'>Failed to load data.</td></tr>";
    }
}

async function fetchSectorData() {
    try {
        const response = await fetch("https://budget-be-production.up.railway.app/sector_spendings/");
        const data = await response.json();

        const sectorTableBody = document.getElementById("sector-table");
        sectorTableBody.innerHTML = "";

        const labels = [];
        const totalSpent = [];
        const pieColors = [];

        data.forEach((item, index) => {
            labels.push(item.sector);
            totalSpent.push(item.total_spent);
            pieColors.push(colorPalette[index % colorPalette.length]); // Loop through the colors

            sectorTableBody.innerHTML += `
                <tr>
                    <td>${item.sector}</td>
                    <td>$${item.allocated_budget.toFixed(2)}</td>
                    <td>$${item.total_spent.toFixed(2)}</td>
                    <td>$${item.remaining_budget.toFixed(2)}</td>
                </tr>
            `;
        });

        // Bar Chart for Sector Budget Usage (single color for total spent)
        const barCtx = document.getElementById("sectorBarChart").getContext("2d");
        new Chart(barCtx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Total Spent",
                        data: totalSpent,
                        backgroundColor: colorPalette[2],  // Third color from the palette
                        borderRadius: 8,
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "#ddd"
                        }
                    }
                }
            }
        });

        // Pie Chart for Sector Budget Usage (with different colors for each segment)
        const pieCtx = document.getElementById("sectorPieChart").getContext("2d");
        new Chart(pieCtx, {
            type: "pie",
            data: {
                labels: labels,
                datasets: [
                    {
                        data: totalSpent,
                        backgroundColor: pieColors,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': $' + tooltipItem.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching sector data:", error);
        document.getElementById("sector-table").innerHTML = "<tr><td colspan='4'>Failed to load data.</td></tr>";
    }
}

async function fetchTransactions() {
    const skip = (currentPage - 1) * limit;

    try {
        const response = await fetch(`http://localhost:8000/transactions/`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Update total pages
        totalPages = Math.ceil(data.total_count / limit);

        // Update the table
        updateTable(data.transactions);
        
        // Update pagination controls
        pageNumber.textContent = `Page: ${currentPage}`;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('There was an error fetching the transactions. Please try again later.');
    }
}

fetchSubsidiaryData();
fetchSectorData();
fetchTransactions();