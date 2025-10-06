// =================== GLOBAL VARIABLES ===================
let departmentList = []; // stores all departments from DB

// =================== ON PAGE LOAD ===================
document.addEventListener("DOMContentLoaded", () => {
  loadDepartments();

  document.getElementById("updateBtn").style.display = "none"; // hide Update initially
  document.getElementById("saveBtn").style.display = "inline-block"; // show Save

  document.getElementById("saveBtn").addEventListener("click", saveDepartment);
  document.getElementById("updateBtn").addEventListener("click", updateDepartment);
  document.getElementById("search").addEventListener("keyup", searchDepartments);
});

// =================== LOAD DEPARTMENTS ===================
async function loadDepartments(query = "") {
  try {
    const res = await fetch(`php/get_department.php?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    departmentList = data; // store globally

    const tbody = document.querySelector("#departmentTable tbody");
    tbody.innerHTML = "";

    data.forEach(dept => {
      tbody.innerHTML += `
        <tr>
          <td>${dept.dept_id}</td>
          <td>${dept.dept_code}</td>
          <td>${dept.dept_name}</td>
          <td>
            <button class="action-btn edit-btn" onclick='editDepartment(${JSON.stringify(dept)})'>✏️ Edit</button>
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

// =================== EXPORT FUNCTIONS ===================
function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}
