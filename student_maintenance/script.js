let programList = [];
let studentList = [];
let currentSort = { column: "student_id", direction: "desc" };
let currentPage = 1;
const recordsPerPage = 10;
let totalRecords = 0;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("formModal");
  const addBtn = document.getElementById("addBtn");
  const closeBtn = document.querySelector(".close-modal");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const modalTitle = document.getElementById("modalTitle");

  loadPrograms().then(() => loadStudents());

  // Modal Control
  const openModal = (title = "Add Student") => {
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
      openModal("Add Student");
      saveBtn.style.display = "inline-block";
      updateBtn.style.display = "none";
    };
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  window.onclick = (e) => { if (e.target === modal) closeModal(); };

  document.getElementById("search").addEventListener("keyup", (e) => {
    currentPage = 1;
    loadStudents(e.target.value.trim());
  });

  saveBtn.onclick = addStudent;
  updateBtn.onclick = updateStudent;

  document.querySelectorAll("#studentTable thead th[data-column]").forEach(th => {
    th.addEventListener("click", () => toggleSort(th.getAttribute("data-column")));
  });

  window.editStudent = (studentId) => {
    const stu = studentList.find(s => s.student_id == studentId);
    if (!stu) return;

    document.getElementById("student_id").value = stu.student_id;
    document.getElementById("student_no").value = stu.student_no;
    const nameParts = stu.student_name.split(" ");
    document.getElementById("first_name").value = nameParts[0] || "";
    document.getElementById("middle_name").value = nameParts.length > 2 ? nameParts[1] : "";
    document.getElementById("last_name").value = nameParts[nameParts.length - 1] || "";
    document.getElementById("email").value = stu.email;
    document.getElementById("gender").value = stu.gender;
    document.getElementById("birthdate").value = stu.birthdate;
    document.getElementById("year_level").value = stu.year_level;
    document.getElementById("program_id").value = stu.program_id;

    saveBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
    openModal("Edit Student");
  };

  window.closeModal = closeModal;
});

async function loadPrograms() {
  const res = await fetch("../program_maintenance/php/fetch_program.php");
  const data = await res.json();
  programList = data;
  const select = document.getElementById("program_id");
  select.innerHTML = '<option value="">Select Program</option>';
  data.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.program_id;
    opt.textContent = p.program_code;
    select.appendChild(opt);
  });
}

async function loadStudents(query = "") {
  const url = `php/get_student.php?search=${encodeURIComponent(query)}&sort_by=${currentSort.column}&order=${currentSort.direction}&page=${currentPage}&limit=${recordsPerPage}`;
  const res = await fetch(url);
  const result = await res.json();
  studentList = result.data || [];
  totalRecords = result.total_records || 0;
  
  const tbody = document.querySelector("#studentTable tbody");
  tbody.innerHTML = "";

  if (studentList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="no-data">No students found</td></tr>';
  } else {
    studentList.forEach(stu => {
      const prog = programList.find(p => p.program_id == stu.program_id);
      tbody.innerHTML += `
        <tr>
          <td>${stu.student_id}</td>
          <td>${stu.student_no}</td>
          <td>${stu.student_name}</td>
          <td>${stu.email}</td>
          <td>${stu.gender}</td>
          <td>${stu.year_level}</td>
          <td>${prog ? prog.program_code : 'N/A'}</td>
          <td>
            <button class="action-btn edit-btn" onclick='editStudent(${stu.student_id})'>Edit</button>
            <button class="action-btn delete-btn" onclick='deleteStudent(${stu.student_id})'>Delete</button>
          </td>
        </tr>`;
    });
  }
  renderPagination();
}

function addStudent() {
  const data = collectFormData();
  fetch("php/add_student.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.text()).then(msg => {
    alert(msg);
    window.closeModal();
    loadStudents();
  });
}

function updateStudent() {
  const data = collectFormData();
  fetch("php/update_student.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(res => res.text()).then(msg => {
    alert(msg);
    window.closeModal();
    loadStudents();
  });
}

function deleteStudent(id) {
  if (!confirm("Are you sure?")) return;
  fetch("php/delete_student.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  }).then(() => loadStudents());
}

function collectFormData() {
  const fName = document.getElementById("first_name").value.trim();
  const mName = document.getElementById("middle_name").value.trim();
  const lName = document.getElementById("last_name").value.trim();
  return {
    student_id: document.getElementById("student_id").value,
    student_no: document.getElementById("student_no").value.trim(),
    student_name: [fName, mName, lName].filter(Boolean).join(" "),
    email: document.getElementById("email").value.trim(),
    gender: document.getElementById("gender").value,
    birthdate: document.getElementById("birthdate").value,
    year_level: document.getElementById("year_level").value,
    program_id: document.getElementById("program_id").value,
  };
}

function clearForm() {
  document.querySelectorAll("#formModal input, #formModal select").forEach(el => el.value = "");
  document.getElementById("student_id").value = "";
}

function toggleSort(column) {
  currentSort.direction = (currentSort.column === column && currentSort.direction === "asc") ? "desc" : "asc";
  currentSort.column = column;
  loadStudents(document.getElementById("search").value.trim());
}

function renderPagination() {
  const pages = Math.ceil(totalRecords / recordsPerPage);
  const controls = document.getElementById('pagination-controls');
  const info = document.getElementById('pagination-info');
  controls.innerHTML = '';
  info.textContent = `Showing ${(currentPage - 1) * recordsPerPage + 1} to ${Math.min(currentPage * recordsPerPage, totalRecords)} of ${totalRecords}`;
  if (pages <= 1) return;
  
  const createBtn = (t, target, disabled, active) => {
    const btn = document.createElement('button');
    btn.textContent = t; btn.disabled = disabled; btn.className = 'page-button' + (active ? ' active' : '');
    btn.onclick = () => { currentPage = target; loadStudents(document.getElementById("search").value.trim()); };
    controls.appendChild(btn);
  };
  createBtn('« Prev', currentPage - 1, currentPage === 1);
  for(let i=1; i<=pages; i++) createBtn(i, i, i === currentPage, i === currentPage);
  createBtn('Next »', currentPage + 1, currentPage === pages);
}

function exportExcel() { window.location.href = "php/export_excel.php"; }
function exportPDF() { window.location.href = "php/export_pdf.php"; }