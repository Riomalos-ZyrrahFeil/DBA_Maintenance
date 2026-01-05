let instructorList = [];
let currentSort = { column: "instructor_id", direction: "asc" };

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("formModal");
  const addBtn = document.getElementById("addBtn");
  const closeBtn = document.querySelector(".close-modal");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const modalTitle = document.getElementById("modalTitle");

  loadDepartments();
  loadInstructors();

  const openModal = (title = "Add New Instructor") => {
    modalTitle.innerText = title;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    clearForm();
  };

  if (addBtn) {
    addBtn.onclick = () => {
      openModal("Add New Instructor");
      saveBtn.style.display = "inline-block";
      updateBtn.style.display = "none";
    };
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  window.onclick = (e) => { if (e.target === modal) closeModal(); };

  document.getElementById("search").addEventListener("keyup", (e) => {
    loadInstructors(e.target.value.trim());
  });

  saveBtn.onclick = saveInstructor;
  updateBtn.onclick = updateInstructor;

  document.querySelectorAll("#instructorTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => toggleSort(th.getAttribute("data-column")));
  });

  window.editInstructor = (instr) => {
    document.getElementById("instructor_id").value = instr.instructor_id;
    document.getElementById("last_name").value = instr.last_name;
    document.getElementById("first_name").value = instr.first_name;
    document.getElementById("email").value = instr.email;
    document.getElementById("dept_id").value = instr.dept_id;

    saveBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
    openModal("Edit Instructor");
  };

  window.closeModal = closeModal;
});

async function loadDepartments() {
  try {
    const res = await fetch("../department_maintenance/php/fetch_department.php");
    const data = await res.json();
    const deptSelect = document.getElementById("dept_id");
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    data.forEach(dept => {
      const option = document.createElement("option");
      option.value = dept.dept_id;
      option.textContent = dept.dept_name;
      deptSelect.appendChild(option);
    });
  } catch (err) { console.error("Error loading departments:", err); }
}

async function loadInstructors(query = "") {
  const url = `php/get_instructor.php?search=${encodeURIComponent(query)}&sort_by=${currentSort.column}&order=${currentSort.direction}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    instructorList = data;
    const tbody = document.querySelector("#instructorTable tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="no-data">No instructors found</td></tr>`;
    } else {
      data.forEach(instr => {
        tbody.innerHTML += `
          <tr>
            <td>${instr.instructor_id}</td>
            <td>${instr.first_name} ${instr.last_name}</td>
            <td>${instr.email}</td>
            <td>${instr.dept_name}</td>
            <td>
              <button class="action-btn edit-btn" onclick='editInstructor(${JSON.stringify(instr)})'>Edit</button>
              <button class="action-btn delete-btn" onclick='deleteInstructor(${instr.instructor_id})'>Delete</button>
            </td>
          </tr>`;
      });
    }
    updateSortIndicators();
  } catch (err) { console.error("Error loading instructors:", err); }
}

function saveInstructor() {
  const payload = {
    last_name: document.getElementById("last_name").value.trim(),
    first_name: document.getElementById("first_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    dept_id: document.getElementById("dept_id").value
  };

  if (!payload.last_name || !payload.first_name || !payload.email || !payload.dept_id) return alert("Fill all fields");

  fetch("php/add_instructor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    if(msg.status === "success") {
      window.closeModal();
      loadInstructors();
    }
  });
}

function updateInstructor() {
  const payload = {
    instructor_id: document.getElementById("instructor_id").value,
    last_name: document.getElementById("last_name").value.trim(),
    first_name: document.getElementById("first_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    dept_id: document.getElementById("dept_id").value
  };

  fetch("php/update_instructor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    if(msg.status === "success") {
      window.closeModal();
      loadInstructors();
    }
  });
}

function deleteInstructor(id) {
  if (!confirm("Are you sure?")) return;
  fetch("php/delete_instructor.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instructor_id: id })
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    loadInstructors(document.getElementById("search").value.trim());
  });
}

function clearForm() {
  ["instructor_id", "last_name", "first_name", "email", "dept_id"].forEach(id => document.getElementById(id).value = "");
}

function toggleSort(column) {
  currentSort.direction = (currentSort.column === column && currentSort.direction === "asc") ? "desc" : "asc";
  currentSort.column = column;
  loadInstructors(document.getElementById("search").value.trim());
}

function updateSortIndicators() {
  document.querySelectorAll("#instructorTable thead th[data-column]").forEach((th) => {
    const col = th.getAttribute("data-column");
    const isActive = col === currentSort.column;
    let label = th.getAttribute("data-label") || th.textContent.replace(/ ▲| ▼| ↕/g, "").trim();
    th.setAttribute("data-label", label);
    th.innerHTML = `${label} ${isActive ? (currentSort.direction === "asc" ? "▲" : "▼") : "↕"}`;
  });
}

function exportExcel() { window.location.href = "php/export_excel.php"; }
function exportPDF() { window.location.href = "php/export_pdf.php"; }