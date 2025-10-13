let departmentList = [];
let currentSort = { column: "dept_id", direction: "asc" }; // default sorting

document.addEventListener("DOMContentLoaded", () => {
  loadDepartments();

  document.getElementById("search").addEventListener("keyup", searchDepartments);
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";

  // Handle header click for sorting
  document.querySelectorAll("#departmentTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });
});

async function loadDepartments(query = "") {
  const sortBy = currentSort.column || "dept_id";
  const order = currentSort.direction || "asc";

  try {
    const res = await fetch(
      `php/get_department.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}`
    );
    const data = await res.json();

    departmentList = data;
    const tbody = document.querySelector("#departmentTable tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="no-data">No departments found</td></tr>`;
      updateSortIndicators();
      return;
    }

    data.forEach((dept) => {
      tbody.innerHTML += `
        <tr>
          <td>${dept.dept_id}</td>
          <td>${dept.dept_code}</td>
          <td>${dept.dept_name}</td>
          <td>
            <button class="action-btn edit-btn" onclick='editDepartment(${JSON.stringify(dept)})'>Edit</button>
            <button class="action-btn delete-btn" onclick='deleteDepartment(${dept.dept_id})'>🗑 Delete</button>
          </td>
        </tr>
      `;
    });

    updateSortIndicators();
  } catch (err) {
    console.error("Error loading departments:", err);
  }
}

function saveDepartment() {
  const code = document.getElementById("department_code").value.trim();
  const name = document.getElementById("department_name").value.trim();

  if (!code || !name) {
    alert("Please fill in all fields.");
    return;
  }

  fetch("php/add_department.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dept_code: code, dept_name: name }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      clearForm();
      loadDepartments();
    })
    .catch(err => console.error("Error saving department:", err));
}

function updateDepartment() {
  const id = document.getElementById("department_id").value;
  const code = document.getElementById("department_code").value.trim();
  const name = document.getElementById("department_name").value.trim();

  if (!id) {
    alert("No department selected for update.");
    return;
  }

  fetch("php/update_department.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dept_id: id, dept_code: code, dept_name: name }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      clearForm();
      loadDepartments();
    })
    .catch(err => console.error("Error updating department:", err));
}

function editDepartment(dept) {
  document.getElementById("department_id").value = dept.dept_id;
  document.getElementById("department_code").value = dept.dept_code;
  document.getElementById("department_name").value = dept.dept_name;

  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";
}

function deleteDepartment(id) {
  if (!confirm("Are you sure you want to delete this department?")) return;

  fetch("php/delete_department.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dept_id: id }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      loadDepartments();
    })
    .catch(err => console.error("Error deleting department:", err));
}

function toggleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }

  const searchValue = document.getElementById("search").value.trim();
  loadDepartments(searchValue);
}

function updateSortIndicators() {
  document.querySelectorAll("#departmentTable thead th[data-column]").forEach((th) => {
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

function searchDepartments(e) {
  const query = e.target.value.trim();
  loadDepartments(query);
}

function clearForm() {
  document.getElementById("department_id").value = "";
  document.getElementById("department_code").value = "";
  document.getElementById("department_name").value = "";

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
}

function cancelEdit() {
  clearForm();
}

function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}
