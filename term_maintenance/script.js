document.addEventListener("DOMContentLoaded", () => {
    loadTerms();

    document.getElementById("saveBtn").addEventListener("click", addTerm);
    document.getElementById("updateBtn").addEventListener("click", updateTerm);
    document.getElementById("cancelBtn").addEventListener("click", resetForm);

    document.getElementById("searchInput").addEventListener("input", filterTable);

    document.getElementById("exportExcel").addEventListener("click", () => {
        window.location.href = "php/export_excel.php";
    });

    document.getElementById("exportPDF").addEventListener("click", () => {
        window.location.href = "php/export_pdf.php";
    });
});

// Load terms from backend
function loadTerms() {
    fetch('php/get_term.php')
        .then(response => response.json())
        .then(data => {
            const tbody = document.getElementById("termTableBody");
            tbody.innerHTML = "";

            if (data.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="5" class="no-data">No terms found</td>`;
                tbody.appendChild(tr);
                return;
            }

            data.forEach(term => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${term.term_id}</td>
                    <td>${term.term_code}</td>
                    <td>${term.start_date}</td>
                    <td>${term.end_date}</td>
                    <td class="actions">
                        <button class="edit-btn" onclick="editTerm(${term.term_id})">Edit</button>
                        <button class="delete-btn" onclick="deleteTerm(${term.term_id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error loading terms:", err));
}

// Add new term
function addTerm() {
    const term_code = document.getElementById("term_code").value.trim();
    const start_date = document.getElementById("start_date").value;
    const end_date = document.getElementById("end_date").value;

    if (!term_code || !start_date || !end_date) {
        alert("Please fill all fields");
        return;
    }

    const formData = new FormData();
    formData.append("term_code", term_code);
    formData.append("start_date", start_date);
    formData.append("end_date", end_date);

    fetch("php/add_term.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("Term added successfully!"); // ✅ Alert on success
            resetForm();
            loadTerms();
        } else {
            alert("Error adding term: " + data.message); // ✅ Alert on error
        }
    })
    .catch(err => {
        console.error(err);
        alert("An unexpected error occurred while adding the term.");
    });
}

// Populate form for editing
function editTerm(id) {
    fetch(`php/get_term.php`)
        .then(res => res.json())
        .then(data => {
            const term = data.find(t => t.term_id == id);
            if (!term) return;

            document.getElementById("term_id").value = term.term_id;
            document.getElementById("term_code").value = term.term_code;
            document.getElementById("start_date").value = term.start_date;
            document.getElementById("end_date").value = term.end_date;

            document.getElementById("saveBtn").style.display = "none";
            document.getElementById("updateBtn").style.display = "inline-block";
            document.getElementById("cancelBtn").style.display = "inline-block";
        });
}

// Update term
function updateTerm() {
    const term_id = document.getElementById("term_id").value;
    const term_code = document.getElementById("term_code").value.trim();
    const start_date = document.getElementById("start_date").value;
    const end_date = document.getElementById("end_date").value;

    if (!term_code || !start_date || !end_date) {
        alert("Please fill all fields");
        return;
    }

    const formData = new FormData();
    formData.append("term_id", term_id);
    formData.append("term_code", term_code);
    formData.append("start_date", start_date);
    formData.append("end_date", end_date);

    fetch("php/update_term.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("Term updated successfully!"); // ✅ Alert on success
            resetForm();
            loadTerms();
        } else {
            alert("Error updating term: " + data.message); // ✅ Alert on error
        }
    })
    .catch(err => {
        console.error(err);
        alert("An unexpected error occurred while updating the term.");
    });
}


// Delete term
function deleteTerm(id) {
    if (!confirm("Are you sure you want to delete this term?")) return;

    const formData = new FormData();
    formData.append("term_id", id);

    fetch("php/delete_term.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            loadTerms();
        } else {
            alert("Error deleting term: " + data.message);
        }
    })
    .catch(err => console.error(err));
}

// Reset form
function resetForm() {
    document.getElementById("term_id").value = "";
    document.getElementById("term_code").value = "";
    document.getElementById("start_date").value = "";
    document.getElementById("end_date").value = "";

    document.getElementById("saveBtn").style.display = "inline-block";
    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("cancelBtn").style.display = "inline-block";
}

// Search filter
function filterTable() {
    const filter = document.getElementById("searchInput").value.toLowerCase();
    const tbody = document.getElementById("termTableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    let hasVisible = false;

    // Remove any existing no-data row first
    rows.forEach(row => {
        if (row.classList.contains("no-data")) {
            row.remove();
        }
    });

    // Filter rows
    rows.forEach(row => {
        const termCode = row.cells[1].textContent.toLowerCase();
        if (termCode.includes(filter)) {
            row.style.display = "";
            hasVisible = true;
        } else {
            row.style.display = "none";
        }
    });

    // If no rows are visible, show "No terms found"
    if (!hasVisible) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5" class="no-data">No terms found</td>`;
        tbody.appendChild(tr);
    }
}

// Sort table by column
document.querySelectorAll("th[data-column]").forEach(header => {
    if (!header.hasAttribute("data-order")) header.setAttribute("data-order", "asc");

    header.addEventListener("click", () => {
        const column = header.getAttribute("data-column");
        const order = header.getAttribute("data-order");

        // Toggle order
        const newOrder = order === "asc" ? "desc" : "asc";
        header.setAttribute("data-order", newOrder);

        // Reset all arrows
        document.querySelectorAll("th[data-column]").forEach(th => {
            th.classList.remove("sorted-asc", "sorted-desc");
            const arrow = th.querySelector(".sort-arrow");
            if (arrow) arrow.textContent = "↕";
            if (th !== header) th.setAttribute("data-order", "asc");
        });

        // Set arrow for current header
        header.classList.add(newOrder === "asc" ? "sorted-asc" : "sorted-desc");
        const arrow = header.querySelector(".sort-arrow");
        if (arrow) arrow.textContent = newOrder === "asc" ? "▲" : "▼";

        sortTable(column, newOrder);
    });
});

function sortTable(column, order) {
    const tbody = document.getElementById("termTableBody");
    const rows = Array.from(tbody.querySelectorAll("tr")).filter(r => !r.classList.contains("no-data"));

    rows.sort((a, b) => {
        let aText = a.querySelector(`td:nth-child(${getColumnIndex(column)})`).textContent;
        let bText = b.querySelector(`td:nth-child(${getColumnIndex(column)})`).textContent;

        // Convert term_id to number for proper sorting
        if(column === "term_id") {
            aText = parseInt(aText);
            bText = parseInt(bText);
        }

        if(aText < bText) return order === "asc" ? -1 : 1;
        if(aText > bText) return order === "asc" ? 1 : -1;
        return 0;
    });

    // Re-append rows
    rows.forEach(row => tbody.appendChild(row));
}

// Helper to map column name to td index (1-based)
function getColumnIndex(column) {
    switch(column) {
        case "term_id": return 1;
        case "term_code": return 2;
        case "start_date": return 3;
        case "end_date": return 4;
        default: return 1;
    }
}

