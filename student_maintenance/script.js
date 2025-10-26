// =================== GLOBAL VARIABLES ===================
let programList = [];
let studentList = [];
let currentSort = { column: "student_id", direction: "desc" }; // default sorting

let currentPage = 1;
const recordsPerPage = 10;
let totalRecords = 0;

// =================== ON PAGE LOAD ===================
document.addEventListener("DOMContentLoaded", () => {
  loadPrograms().then(() => loadStudents());

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";

  document.getElementById("saveBtn").addEventListener("click", addStudent);
  document.getElementById("updateBtn").addEventListener("click", updateStudent);
  document.getElementById("search").addEventListener("keyup", searchStudents);

  document.querySelectorAll("#studentTable thead th[data-column]").forEach(th => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });
});

// =================== LOAD PROGRAMS ===================
async function loadPrograms() {
  try {
    const res = await fetch("../program_maintenance/php/fetch_program.php");
    const data = await res.json();
    programList = data;

    const select = document.getElementById("program_id");
    select.innerHTML = '<option value="">Select Program</option>';

    data.forEach(program => {
      const opt = document.createElement("option");
      opt.value = program.program_id;
      opt.textContent = program.program_code;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error loading programs:", err);
  }
}

// =================== LOAD STUDENTS===================
async function loadStudents(query = "", page = currentPage, limit = recordsPerPage) {
  const sortBy = currentSort.column || "student_id";
  const order = currentSort.direction || "asc";

  try {
    const res = await fetch(
      `php/get_student.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}&page=${page}&limit=${limit}`
    );
    
    const result = await res.json();

    studentList = result.data || [];
    totalRecords = result.total_records || 0;
    currentPage = result.current_page || 1; 

    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(studentList) || studentList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="no-data">No students found</td></tr>`;
      updateSortIndicators();
      document.getElementById('pagination-info').textContent = 'Total: 0 records';
      document.getElementById('pagination-controls').innerHTML = '';
      return;
    }

    studentList.forEach(stu => {
      const programName = getProgramName(stu.program_id);
      
      tbody.innerHTML += `
        <tr>
          <td>${stu.student_id}</td>
          <td>${stu.student_no}</td>
          <td>${stu.student_name}</td>
          <td>${stu.email}</td>
          <td>${stu.gender}</td>
          <td>${stu.birthdate}</td>
          <td>${stu.year_level}</td>
          <td>${programName}</td>
          <td>
            <div style="display: flex; justify-content: center; gap: 5px;">
              <button class="action-btn edit-btn" onclick='editStudent(${stu.student_id})'>Edit</button>
              <button class="action-btn delete-btn" onclick='deleteStudent(${stu.student_id})'>Delete</button>
            </div>
           </td>
        </tr>
      `;
    });

    updateSortIndicators();
    renderPagination();

  } catch (err) {
    console.error("Error loading students:", err);
    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = `<tr><td colspan="9" class="no-data">Error loading data. Check console.</td></tr>`;
    document.getElementById('pagination-info').textContent = '';
    document.getElementById('pagination-controls').innerHTML = '';
  }
}

// =================== PAGINATION HANDLERS ===================
function renderPagination() {
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const controlsContainer = document.getElementById('pagination-controls');
  const infoContainer = document.getElementById('pagination-info');
  controlsContainer.innerHTML = '';

  if (totalPages <= 1) {
    infoContainer.textContent = `Total: ${totalRecords} records`;
    return;
  }

  // Calculate start and end indices for display
  const startRecord = (currentPage - 1) * recordsPerPage + 1;
  const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);
  
  infoContainer.textContent = `Showing ${startRecord} to ${endRecord} of ${totalRecords} records (Page ${currentPage} of ${totalPages})`;

  // Previous Button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '« Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => goToPage(currentPage - 1);
  controlsContainer.appendChild(prevBtn);
  // Page Buttons
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.classList.add('page-btn');
    if (i === currentPage) {
        pageBtn.classList.add('active');
        pageBtn.disabled = true;
    }
    pageBtn.onclick = () => goToPage(i);
    controlsContainer.appendChild(pageBtn);
  }

  // Next Button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next »';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => goToPage(currentPage + 1);
  controlsContainer.appendChild(nextBtn);
}

function goToPage(page) {
  if (page < 1 || page > Math.ceil(totalRecords / recordsPerPage)) return;
  currentPage = page;
  const query = document.getElementById("search").value.trim();
  loadStudents(query, currentPage, recordsPerPage);
}

// =================== SEARCH HANDLER ===================
function searchStudents(e) {
  const query = e.target.value.trim();
  currentPage = 1;
  loadStudents(query);
}

function toggleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }

  currentPage = 1;
  const query = document.getElementById("search").value.trim();
  loadStudents(query);
}

// =================== SORT HANDLERS ===================
function toggleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }

  const query = document.getElementById("search").value.trim();
  loadStudents(query);
}

function updateSortIndicators() {
  document.querySelectorAll("#studentTable thead th[data-column]").forEach(th => {
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

// =================== ADD STUDENT ===================
function addStudent() {
  const studentData = collectFormData();

  if (!studentData.student_name || !studentData.email) {
    alert("Please fill out all required fields.");
    return;
  }

  fetch("php/add_student.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      currentPage = 1
      loadStudents();
      clearForm();
    })
    .catch(err => console.error("Error adding student:", err));
}

// =================== UPDATE STUDENT ===================
function updateStudent() {
  const studentData = collectFormData();

  if (!studentData.student_id) {
    alert("No student selected for update.");
    return;
  }

  fetch("php/update_student.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      currentPage = 1;
      loadStudents();
      clearForm();
    })
    .catch(err => console.error("Error updating student:", err));
}

// =================== EDIT STUDENT ===================
function editStudent(studentId) {
  const stuData = studentList.find(s => s.student_id == studentId);
  
  if (!stuData) {
    alert("Student data not found in the current list. Refreshing may help.");
    return;
  }

  document.getElementById("student_id").value = stuData.student_id;
  document.getElementById("student_no").value = stuData.student_no || "";

  const nameParts = stuData.student_name.split(" ");
  document.getElementById("first_name").value = nameParts[0] || "";

  const isMiddleNamePresent = nameParts.length > 2 && nameParts[1] !== nameParts[nameParts.length - 1];
  document.getElementById("middle_name").value = isMiddleNamePresent ? nameParts[1] : ""; 
  
  document.getElementById("last_name").value = nameParts[nameParts.length - 1] || "";

  document.getElementById("email").value = stuData.email;
  document.getElementById("gender").value = stuData.gender;
  document.getElementById("birthdate").value = stuData.birthdate;
  document.getElementById("year_level").value = stuData.year_level;
  document.getElementById("program_id").value = stuData.program_id;

  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";
}

// =================== DELETE STUDENT ===================
function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  fetch("php/delete_student.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      currentPage = 1;
      loadStudents();
    })
    .catch(err => console.error("Error deleting student:", err));
}

// =================== SEARCH ===================
function searchStudents(e) {
  const query = e.target.value.trim();
  loadStudents(query);
}

// =================== CLEAR FORM ===================
function clearForm() {
  document.querySelectorAll("input, select").forEach(el => (el.value = ""));
  document.getElementById("student_id").value = "";
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
}

// =================== HELPER FUNCTIONS ===================
function collectFormData() {
  const id = document.getElementById("student_id").value;
  const firstName = document.getElementById("first_name").value.trim();
  const middleName = document.getElementById("middle_name").value.trim();
  const lastName = document.getElementById("last_name").value.trim();
  const studentName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  return {
    student_id: id,
    student_no: document.getElementById("student_no").value.trim(),
    student_name: studentName,
    email: document.getElementById("email").value.trim(),
    gender: document.getElementById("gender").value,
    birthdate: document.getElementById("birthdate").value,
    year_level: document.getElementById("year_level").value,
    program_id: document.getElementById("program_id").value,
  };
}

function getProgramName(id) {
  const program = programList.find(p => p.program_id == id);
  return program ? program.program_code : "Unknown";
}

// =================== EXPORT FUNCTIONS ===================
function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}
