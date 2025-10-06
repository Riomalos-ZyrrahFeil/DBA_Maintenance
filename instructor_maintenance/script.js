document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("saveBtn");
    const updateBtn = document.getElementById("updateBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const searchInput = document.getElementById("searchInput");
    const instructorTable = document.getElementById("instructorTable").querySelector("tbody");
    const deptSelect = document.getElementById("dept_id");

    // Load departments dynamically
    function loadDepartments() {
        fetch("../department_maintenance/php/fetch_department.php")
            .then(res => res.json())
            .then(data => {
                deptSelect.innerHTML = '<option value="">Select Department</option>';
                data.forEach(dept => {
                    const option = document.createElement("option");
                    option.value = dept.dept_id;
                    option.textContent = dept.dept_name;
                    deptSelect.appendChild(option);
                });
            })
            .catch(err => console.error("Error loading departments:", err));
    }

    loadDepartments();

    // Load instructors dynamically
    function loadInstructors() {
        fetch("php/get_instructor.php")
            .then(res => res.json())
            .then(data => {
                instructorTable.innerHTML = "";
                data.forEach(instr => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${instr.instructor_id}</td>
                        <td>${instr.first_name} ${instr.last_name}</td>
                        <td>${instr.email}</td>
                        <td>${instr.dept_name}</td>
                        <td>
                            <button class="action-btn edit-btn" onclick="editInstructor(${instr.instructor_id})">Edit</button>
                            <button class="action-btn delete-btn" onclick="deleteInstructor(${instr.instructor_id})">Delete</button>
                        </td>
                    `;
                    instructorTable.appendChild(tr);
                });
            })
            .catch(err => console.error("Error loading instructors:", err));
    }

    loadInstructors();

    // Save button
    saveBtn.addEventListener("click", () => {
        const payload = {
            last_name: document.getElementById("last_name").value,
            first_name: document.getElementById("first_name").value,
            email: document.getElementById("email").value,
            dept_id: deptSelect.value
        };

        fetch("php/add_instructor.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(res => {
            alert(res.message);
            loadInstructors();
            clearForm();
        });
    });

    // Update button
    updateBtn.addEventListener("click", () => {
        const payload = {
            instructor_id: document.getElementById("instructor_id").value,
            last_name: document.getElementById("last_name").value,
            first_name: document.getElementById("first_name").value,
            email: document.getElementById("email").value,
            dept_id: deptSelect.value
        };

        fetch("php/update_instructor.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(res => {
            alert(res.message);
            loadInstructors();
            clearForm();
        });
    });

    // Cancel button
    cancelBtn.addEventListener("click", clearForm);

    function clearForm() {
        document.getElementById("instructor_id").value = "";
        document.getElementById("last_name").value = "";
        document.getElementById("first_name").value = "";
        document.getElementById("email").value = "";
        deptSelect.value = "";
        saveBtn.style.display = "inline-block";
        updateBtn.style.display = "none";
        cancelBtn.style.display = "none";
    }

    // Search functionality
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        document.querySelectorAll("#instructorTable tbody tr").forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(query) ? "" : "none";
        });
    });

    // Placeholder functions for Edit and Delete
    window.editInstructor = (id) => {
        fetch(`php/get_instructor.php?id=${id}`)
            .then(res => res.json())
            .then(instr => {
                document.getElementById("instructor_id").value = instr.instructor_id;
                document.getElementById("last_name").value = instr.last_name;
                document.getElementById("first_name").value = instr.first_name;
                document.getElementById("email").value = instr.email;
                deptSelect.value = instr.dept_id;
                saveBtn.style.display = "none";
                updateBtn.style.display = "inline-block";
                cancelBtn.style.display = "inline-block";
            });
    };

    window.deleteInstructor = (id) => {
        if (confirm("Are you sure you want to delete this instructor?")) {
            fetch(`php/delete_instructor.php?id=${id}`, { method: "POST" })
                .then(res => res.json())
                .then(res => {
                    alert(res.message);
                    loadInstructors();
                });
        }
    };

    // Export buttons
    document.getElementById("exportExcel").addEventListener("click", () => {
        window.location.href = "php/export_excel.php";
    });

    document.getElementById("exportPDF").addEventListener("click", () => {
        window.location.href = "php/export_pdf.php";
    });
});
