let programList = [];
let departmentList = [];
let currentSort = { column: "program_id", direction: "desc" }; // default sorting

document.addEventListener("DOMContentLoaded", () => {
  loadDepartments();  // load departments first
  loadPrograms();     // then load programs

  document.getElementById("search").addEventListener("keyup", searchPrograms);
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";

  // Handle header click for sorting
  document.querySelectorAll("#programTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });
});

// ==================== LOAD DEPARTMENTS ====================
async function loadDepartments() {
  try {
    const res = await fetch("../department_maintenance/php/fetch_department.php");
    const data = await res.json();
    departmentList = data;

    const deptSelect = document.getElementById("dept_id");
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    data.forEach(d => {
      deptSelect.innerHTML += `<option value="${d.dept_id}">${d.dept_name}</option>`;
    });
  } catch (err) {
    console.error("Error loading departments:", err);
  }
}

// ==================== LOAD PROGRAMS ====================
async function loadPrograms(query = "") {
  const sortBy = currentSort.column || "program_id";
  const order = currentSort.direction || "desc";

  try {
    const res = await fetch(
      `php/get_program.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}`
    );
    const data = await res.json();
    programList = data;

    const tbody = document.querySelector("#programTable tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="no-data">No programs found</td></tr>`;
      updateSortIndicators();
      return;
    }

    data.forEach((p) => {
      tbody.innerHTML += `
        <tr>
          <td>${p.program_id}</td>
          <td>${p.program_code}</td>
          <td>${p.program_name}</td>
          <td>${p.dept_name}</td>
          <td>
            <button class="action-btn edit-btn" onclick='editProgram(${p.program_id})'>Edit</button>
            <button class="action-btn delete-btn" onclick='deleteProgram(${p.program_id})'>Delete</button>
          </td>
        </tr>
      `;
    });

    updateSortIndicators();
  } catch (err) {
    console.error("Error loading programs:", err);
  }
}

// ==================== SAVE PROGRAM ====================
function saveProgram() {
  const data = collectFormData();
  if (!data.program_code || !data.program_name || !data.dept_id) {
    alert("Please fill out all fields!");
    return;
  }

  fetch("php/add_program.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      clearForm();
      loadPrograms();
    })
    .catch(err => console.error("Error saving program:", err));
}

// ==================== UPDATE PROGRAM ====================
function updateProgram() {
  const data = collectFormData();
  if (!data.program_id) {
    alert("No program selected for update.");
    return;
  }

  fetch("php/update_program.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      clearForm();
      loadPrograms();
    })
    .catch(err => console.error("Error updating program:", err));
}

// ==================== EDIT PROGRAM ====================
function editProgram(id) {
  const p = programList.find(pr => pr.program_id == id);
  if (!p) return;

  document.getElementById("program_id").value = p.program_id;
  document.getElementById("program_code").value = p.program_code;
  document.getElementById("program_name").value = p.program_name;
  document.getElementById("dept_id").value = p.dept_id;

  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "inline-block";
}


// ==================== DELETE PROGRAM ====================
function deleteProgram(id) {
  if (!confirm("Are you sure you want to delete this program?")) return;

  fetch("php/delete_program.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program_id: id })
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      loadPrograms();
    })
    .catch(err => console.error("Error deleting program:", err));
}

// ==================== COLLECT FORM DATA ====================
function collectFormData() {
  return {
    program_id: document.getElementById("program_id").value,
    program_code: document.getElementById("program_code").value.trim(),
    program_name: document.getElementById("program_name").value.trim(),
    dept_id: document.getElementById("dept_id").value
  };
}

// ==================== CLEAR FORM ====================
function clearForm() {
  document.getElementById("program_id").value = "";
  document.getElementById("program_code").value = "";
  document.getElementById("program_name").value = "";
  document.getElementById("dept_id").value = "";

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
}

// ==================== CANCEL EDIT ====================
function cancelEdit() {
  clearForm();
}

// ==================== EXPORT ====================
function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}

// ==================== SORTING ====================
function toggleSort(column) {
  if (currentSort.column === column) {
    // toggle direction
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "desc"; // default to DESC on new column
  }

  const searchValue = document.getElementById("search").value.trim();
  loadPrograms(searchValue);
}

function updateSortIndicators() {
  document.querySelectorAll("#programTable thead th[data-column]").forEach((th) => {
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

function searchPrograms(e) {
  const query = e.target ? e.target.value.trim() : e;
  loadPrograms(query);
}
