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
    
    document.querySelectorAll('#coursePrereqTable th[data-column]').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            const currentDirection = header.getAttribute('data-sort-dir') || 'asc';
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
            
            sortTable(column, newDirection);
            document.querySelectorAll('#coursePrereqTable th[data-column]').forEach(h => {
                h.removeAttribute('data-sort-dir');
                h.querySelector('.sort-arrow').textContent = '↕';
            });
            header.setAttribute('data-sort-dir', newDirection);
            header.querySelector('.sort-arrow').textContent = newDirection === 'asc' ? '▲' : '▼';
        });
    });
});

// Load dropdown courses
function loadCourses() {
    fetch("http://localhost/dashboard/MaintenanceModule/course_prerequisite_maintenance/php/fetch_course.php")
        .then(res => res.json())
        .then(data => {
            const courseSelect = document.getElementById("course_id");
            const prereqSelect = document.getElementById("prereq_course_id");
            courseSelect.innerHTML = "";
            prereqSelect.innerHTML = "";
            courseSelect.appendChild(document.createElement("option")).textContent = "-- Select Course --";
            prereqSelect.appendChild(document.createElement("option")).textContent = "-- Select Prerequisite --";

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

            if (!Array.isArray(data) || data.length === 0) {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td colspan="6" class="no-data">No prerequisites found</td>`;
                tbody.appendChild(tr);

                if (!Array.isArray(data)) {
                    console.error("Invalid data returned:", data);
                }
                return;
            }
            data.forEach(item => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.prerequisite_id}</td>
                    <td>${item.course_code}</td>
                    <td>${item.course_title}</td>
                    <td>${item.prerequisite_code}</td>
                    <td>${item.prerequisite_title}</td>
                    <td class="actions">
                        <button class="edit-btn" onclick="editPrerequisite(${item.prerequisite_id}, ${item.course_id}, ${item.prerequisite_course_id})">Edit</button>
                        <button class="delete-btn" onclick="deletePrerequisite(${item.prerequisite_id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error loading prerequisites:", err));
}

function sortTable(column, direction) {
    const tbody = document.getElementById("coursePrereqTableBody");
    const rows = Array.from(tbody.querySelectorAll("tr")).filter(r => !r.classList.contains("no-data"));
    const columnIndexMap = {
        'prerequisite_id': 0,
        'course_code': 1,
        'course_title': 2,
        'prerequisite_code': 3,
        'prerequisite_name': 4
    };

    const columnIndex = columnIndexMap[column];
    if (columnIndex === undefined) return;
    const isNumeric = column === 'prerequisite_id';

    rows.sort((a, b) => {
        let aText = a.cells[columnIndex].textContent.trim();
        let bText = b.cells[columnIndex].textContent.trim();
        let comparison = 0;
        if (isNumeric) {
            const aNum = parseInt(aText);
            const bNum = parseInt(bText);
            comparison = aNum - bNum;
        } else {
            comparison = aText.localeCompare(bText);
        }
        return direction === 'asc' ? comparison : comparison * -1;
    });
    rows.forEach(row => tbody.appendChild(row));
}

// Add prerequisite
function addPrerequisite() {
    const course_id = document.getElementById("course_id").value;
    const prereq_id = document.getElementById("prereq_course_id").value;
    
    if (course_id === "" || prereq_id === "" || course_id.includes("Select Course") || prereq_id.includes("Select Prerequisite")) {
        alert("Please select both a Course and a Prerequisite Course.");
        return;
    }
    
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

function editPrerequisite(prerequisite_id_row, course_id, prereq_course_id) {
    document.getElementById("original_prereq_id").value = prerequisite_id_row;
    document.getElementById("original_course_id").value = course_id; 

    document.getElementById("course_id").value = course_id;
    document.getElementById("prereq_course_id").value = prereq_course_id;

    document.getElementById("saveBtn").style.display = "none";
    document.getElementById("updateBtn").style.display = "inline-block";
}

function updatePrerequisite() {
    const formData = new FormData();
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
function deletePrerequisite(prerequisite_id) {
    if (!confirm("Are you sure you want to delete this prerequisite?")) return;

    const formData = new FormData();
    formData.append("prerequisite_id_to_delete", prerequisite_id); 

    fetch("php/delete_prerequisite.php", { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                alert("Prerequisite successfully deleted!"); 
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
        const course_code = row.cells[1].textContent.toLowerCase();
        const course_title = row.cells[2].textContent.toLowerCase();
        const prereq_code = row.cells[3].textContent.toLowerCase();
        const prereq_name = row.cells[4].textContent.toLowerCase();

        // Search by ANY of the four fields (Code or Title/Name)
        if (course_code.includes(filter) || 
            course_title.includes(filter) ||
            prereq_code.includes(filter) ||
            prereq_name.includes(filter)) 
        { 
            row.style.display = "";
            visible = true;
        } else {
            row.style.display = "none";
        }
    });

    const noDataRow = tbody.querySelector(".no-data");
    if (!visible && !noDataRow) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="6" class="no-data">No matches found</td>`;
        tbody.appendChild(tr);
    } else if (visible && noDataRow) {
        noDataRow.remove();
    }
}