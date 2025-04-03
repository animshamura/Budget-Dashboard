document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function(event) {
        event.preventDefault(); // Prevent default form submission

        // Collect and validate form data
        const transaction_id = form.querySelector("input[placeholder='Enter transaction id']").value.trim();
        const spent_amount = parseFloat(form.querySelector("input[placeholder='Enter amount']").value);
        const user_id = form.querySelector("input[placeholder='Enter user id']").value.trim();
        const transaction_date = form.querySelector("input[type='date']").value; // Should be YYYY-MM-DD
        const subsidiary = form.querySelector("select").value;
        const sector = form.querySelectorAll("select")[1].value;

        if (!transaction_id || isNaN(spent_amount) || spent_amount <= 0 || !user_id || !transaction_date || !subsidiary || !sector) {
            alert("Please fill in all fields correctly.");
            return;
        }

        const transactionData = { transaction_id, spent_amount, user_id, transaction_date, subsidiary, sector };

        console.log("Sending Data:", JSON.stringify(transactionData, null, 2));

        try {
            const response = await fetch("http://localhost:8000/add-transaction/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(transactionData)
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = Array.isArray(result.detail)
                    ? result.detail.map(err => `${err.loc}: ${err.msg}`).join("\n")
                    : result.detail || "Failed to add transaction.";
                    
                throw new Error(errorMessage);
            }

            alert("Transaction added successfully!");
            form.reset();
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to add transaction: " + error.message);
        }
    });
});
