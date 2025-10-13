document.addEventListener("DOMContentLoaded", () => {
    loadCourses();
    loadPrereqList();

    document.getElementById("saveBtn").addEventListener("click", addPrerequisite);
    document.getElementById("updateBtn").addEventListener("click", updatePrerequisite);
    document.getElementById("cancelBtn").addEventListener("click", resetForm);

    document.getElementById("exportExcel").addEventListener("click", () => {
        window.location.href = "php/export_excel.php";
    });

    document.getElementById("exportPDF").addEventListener("click", () => {
        window.location.href = "php/export_pdf.php";
    });

    document.getElementById("searchInput").addEventListener("input", filterTable);
});

// Load dropdown courses
function loadCourses() {
    fetch("http://localhost/dashboard/MaintenanceModule/course_maintenance/php/get_course.php")
        .then(res => res.json())
        .then(data => {
            const courseSelect = document.getElementById("course_id");
            const prereqSelect = document.getElementById("prereq_course_id");
            courseSelect.innerHTML = "";
            prereqSelect.innerHTML = "";

            data.forEach(course => {
                const option1 = document.createElement("option");
                option1.value = course.course_id;
                option1.textContent = `${course.course_code} - ${course.title}`;
                courseSelect.appendChild(option1);

                const option2 = document.createElement("option");
                option2.value = course.course_id;
                option2.textContent = `${course.course_code} - ${course.title}`;
                prereqSelect.appendChild(option2);
            });
        });
}

// Load prerequisites table
function loadPrereqList() {
    fetch("php/get_prerequisites.php")
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("coursePrereqTableBody");
            tbody.innerHTML = "";

            // ✅ Check if data is an array
            if (!Array.isArray(data) || data.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="5" class="no-data">No prerequisites found</td>`;
                tbody.appendChild(tr);

                // Log error if it's not an array
                if (!Array.isArray(data)) {
                    console.error("Invalid data returned:", data);
                }
                return;
            }

            data.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.course_id}</td>
                    <td>${item.course_title}</td>
                    <td>${item.prerequisite_course_id}</td>
                    <td>${item.prerequisite_title}</td>
                    <td class="actions">
                        <button class="edit-btn" onclick="editPrerequisite(${item.course_id}, ${item.prerequisite_course_id})">Edit</button>
                        <button class="delete-btn" onclick="deletePrerequisite(${item.course_id}, ${item.prerequisite_course_id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error loading prerequisites:", err));
}


// Add prerequisite
function addPrerequisite() {
    const course_id = document.getElementById("course_id").value;
    const prereq_id = document.getElementById("prereq_course_id").value;
    if (course_id === prereq_id) {
        alert("A course cannot be its own prerequisite.");
        return;
    }

    const formData = new FormData();
    formData.append("course_id", course_id);
    formData.append("prereq_course_id", prereq_id);

    fetch("php/add_prerequisite.php", { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("Prerequisite added successfully!");
                resetForm();
                loadPrereqList();
            } else {
                alert("Error: " + data.message);
            }
        });
}

// Edit prerequisite
function editPrerequisite(course_id, prereq_id) {
    document.getElementById("original_course_id").value = course_id;
    document.getElementById("original_prereq_id").value = prereq_id;
    document.getElementById("course_id").value = course_id;
    document.getElementById("prereq_course_id").value = prereq_id;
    document.getElementById("saveBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "inline-block";
}

// Update prerequisite
function updatePrerequisite() {
    const formData = new FormData();
    formData.append("original_course_id", document.getElementById("original_course_id").value);
    formData.append("original_prereq_id", document.getElementById("original_prereq_id").value);
    formData.append("new_course_id", document.getElementById("course_id").value);
    formData.append("new_prereq_id", document.getElementById("prereq_course_id").value);

    fetch("php/update_prerequisite.php", { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("Prerequisite updated successfully!");
                resetForm();
                loadPrereqList();
            } else {
                alert("Error: " + data.message);
            }
        });
}

// Delete prerequisite
function deletePrerequisite(course_id, prereq_id) {
    if (!confirm("Are you sure you want to delete this prerequisite?")) return;

    const formData = new FormData();
    formData.append("course_id", course_id);
    formData.append("prereq_course_id", prereq_id);

    fetch("php/delete_prerequisite.php", { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                loadPrereqList();
            } else {
                alert("Error deleting prerequisite: " + data.message);
            }
        });
}

// Reset form
function resetForm() {
    document.getElementById("course_id").selectedIndex = 0;
    document.getElementById("prereq_course_id").selectedIndex = 0;
    document.getElementById("original_course_id").value = "";
    document.getElementById("original_prereq_id").value = "";
    document.getElementById("saveBtn").style.display = "inline-block";
    document.getElementById("updateBtn").style.display = "none";
}

// Search / Filter
function filterTable() {
    const filter = document.getElementById("searchInput").value.toLowerCase();
    const tbody = document.getElementById("coursePrereqTableBody");
    const rows = Array.from(tbody.querySelectorAll("tr")).filter(r => !r.classList.contains("no-data"));

    let visible = false;
    rows.forEach(row => {
        const course = row.cells[1].textContent.toLowerCase();
        const prereq = row.cells[3].textContent.toLowerCase();
        if (course.includes(filter) || prereq.includes(filter)) {
            row.style.display = "";
            visible = true;
        } else {
            row.style.display = "none";
        }
    });

    if (!visible && !tbody.querySelector(".no-data")) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="5" class="no-data">No matches found</td>`;
        tbody.appendChild(tr);
    } else if (visible) {
        const noData = tbody.querySelector(".no-data");
        if (noData) noData.remove();
    }
}
