let departmentList = []; // stores all departments from DB

// =================== ON PAGE LOAD ===================
document.addEventListener("DOMContentLoaded", () => {
  loadDepartments();

  document.getElementById("search").addEventListener("keyup", searchDepartments);
  document.getElementById("updateBtn").style.display = "none"; // hide Update initially
  document.getElementById("saveBtn").style.display = "inline-block"; // show Save
});

// =================== LOAD DEPARTMENTS ===================
async function loadDepartments(query = "") {
  console.log("Loading departments with query:", query);

  try {
    const res = await fetch(`php/get_department.php?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    console.log("Data received:", data);

    const tbody = document.querySelector("#departmentTable tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No departments found</td></tr>`;
      return;
    }

    data.forEach(dept => {
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
  } catch (err) {
    console.error("Error loading departments:", err);
  }
}

// =================== SAVE DEPARTMENT ===================
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

// =================== UPDATE DEPARTMENT ===================
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

// =================== EDIT DEPARTMENT ===================
function editDepartment(dept) {
  document.getElementById("department_id").value = dept.dept_id;
  document.getElementById("department_code").value = dept.dept_code;
  document.getElementById("department_name").value = dept.dept_name;

  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";
}

// =================== DELETE DEPARTMENT ===================
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

// =================== SEARCH DEPARTMENTS ===================
function searchDepartments(e) {
  console.log("Search triggered:", e.target.value);
  loadDepartments(e.target.value);
}

// =================== CLEAR FORM ===================
function clearForm() {
  document.getElementById("department_id").value = "";
  document.getElementById("department_code").value = "";
  document.getElementById("department_name").value = "";

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
}

// =================== CANCEL EDIT ===================
function cancelEdit() {
  clearForm();
}


// =================== EXPORT FUNCTIONS ===================
function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}
