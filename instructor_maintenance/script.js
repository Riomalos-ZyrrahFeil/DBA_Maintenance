let instructorList = [];
let currentSort = { column: "instructor_id", direction: "asc" }; // default sorting

document.addEventListener("DOMContentLoaded", () => {
  loadDepartments();
  loadInstructors();

  document.getElementById("searchInput").addEventListener("keyup", searchInstructors);
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";

  // Handle header click for sorting
  document.querySelectorAll("#instructorTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });

  // Export buttons
  document.getElementById("exportExcel").addEventListener("click", exportExcel);
  document.getElementById("exportPDF").addEventListener("click", exportPDF);
});

// Load Departments dynamically
async function loadDepartments() {
  const deptSelect = document.getElementById("dept_id");
  try {
    const res = await fetch("../department_maintenance/php/fetch_department.php");
    const data = await res.json();

    deptSelect.innerHTML = '<option value="">Select Department</option>';
    data.forEach(dept => {
      const option = document.createElement("option");
      option.value = dept.dept_id;
      option.textContent = dept.dept_name;
      deptSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading departments:", err);
  }
}

// Load Instructors dynamically
async function loadInstructors(query = "") {
  const sortBy = currentSort.column || "instructor_id";
  const order = currentSort.direction || "asc";
  const tbody = document.querySelector("#instructorTable tbody");

  try {
    const res = await fetch(`php/get_instructor.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}`);
    const data = await res.json();

    instructorList = data;
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="no-data">No instructors found</td></tr>`;
      updateSortIndicators();
      return;
    }

    data.forEach(instr => {
      tbody.innerHTML += `
        <tr>
          <td>${instr.instructor_id}</td>
          <td>${instr.first_name} ${instr.last_name}</td>
          <td>${instr.email}</td>
          <td>${instr.dept_name}</td>
          <td>
            <button class="action-btn edit-btn" onclick='editInstructor(${JSON.stringify(instr)})'>Edit</button>
            <button class="action-btn delete-btn" onclick='deleteInstructor(${instr.instructor_id})'>🗑 Delete</button>
          </td>
        </tr>
      `;
    });

    updateSortIndicators();
  } catch (err) {
    console.error("Error loading instructors:", err);
  }
}

// Save Instructor
function saveInstructor() {
  const payload = {
    last_name: document.getElementById("last_name").value.trim(),
    first_name: document.getElementById("first_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    dept_id: document.getElementById("dept_id").value
  };

  if (!payload.last_name || !payload.first_name || !payload.email || !payload.dept_id) {
    alert("Please fill in all fields.");
    return;
  }

  fetch("php/add_instructor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    clearForm();
    loadInstructors();
  })
  .catch(err => console.error("Error saving instructor:", err));
}

// Update Instructor
function updateInstructor() {
  const payload = {
    instructor_id: document.getElementById("instructor_id").value,
    last_name: document.getElementById("last_name").value.trim(),
    first_name: document.getElementById("first_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    dept_id: document.getElementById("dept_id").value
  };

  if (!payload.instructor_id) {
    alert("No instructor selected for update.");
    return;
  }

  fetch("php/update_instructor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    clearForm();
    loadInstructors();
  })
  .catch(err => console.error("Error updating instructor:", err));
}

// Edit Instructor
function editInstructor(instr) {
  document.getElementById("instructor_id").value = instr.instructor_id;
  document.getElementById("last_name").value = instr.last_name;
  document.getElementById("first_name").value = instr.first_name;
  document.getElementById("email").value = instr.email;
  document.getElementById("dept_id").value = instr.dept_id;

  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

// Delete Instructor
function deleteInstructor(id) {
  if (!confirm("Are you sure you want to delete this instructor?")) return;

  fetch("php/delete_instructor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instructor_id: id })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    loadInstructors();
  })
  .catch(err => console.error("Error deleting instructor:", err));
}

// Clear form
function clearForm() {
  document.getElementById("instructor_id").value = "";
  document.getElementById("last_name").value = "";
  document.getElementById("first_name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("dept_id").value = "";

  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";
}

// Cancel Edit
function cancelEdit() {
  clearForm();
}

// Search Instructors
function searchInstructors(e) {
  const query = e.target.value.trim();
  loadInstructors(query);
}

// Sorting
function toggleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }
  const query = document.getElementById("searchInput").value.trim();
  loadInstructors(query);
}

function updateSortIndicators() {
  document.querySelectorAll("#instructorTable thead th[data-column]").forEach((th) => {
    const col = th.getAttribute("data-column");
    const isActive = col === currentSort.column;
    let label = th.getAttribute("data-label") || th.textContent.replace(/ ▲| ▼| ↕/g, "").trim();
    th.setAttribute("data-label", label);

    if (isActive) {
      th.innerHTML = `${label} ${currentSort.direction === "asc" ? "▲" : "▼"}`;
      th.classList.add("active-sort");
    } else {
      th.innerHTML = `${label} ↕`;
      th.classList.remove("active-sort");
    }
  });
}

// Export
function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}
