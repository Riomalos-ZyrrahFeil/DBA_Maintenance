// =================== GLOBAL VARIABLES ===================
let programList = [];
let studentList = [];
let currentSort = { column: "student_id", direction: "asc" }; // default sorting

// =================== ON PAGE LOAD ===================
document.addEventListener("DOMContentLoaded", () => {
  loadPrograms().then(() => loadStudents());

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";

  document.getElementById("saveBtn").addEventListener("click", addStudent);
  document.getElementById("updateBtn").addEventListener("click", updateStudent);
  document.getElementById("search").addEventListener("keyup", searchStudents);

  // Enable sorting by clicking headers
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

// =================== LOAD STUDENTS ===================
async function loadStudents(query = "") {
  const sortBy = currentSort.column || "student_id";
  const order = currentSort.direction || "asc";

  try {
    const res = await fetch(
      `php/get_student.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}`
    );
    const data = await res.json();
    studentList = data;

    const tbody = document.querySelector("#studentTable tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="no-data">No students found</td></tr>`;
      updateSortIndicators();
      return;
    }

    data.forEach(stu => {
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
            <button class="action-btn edit-btn" onclick='editStudent(${JSON.stringify(stu)})'>Edit</button>
            <button class="action-btn delete-btn" onclick='deleteStudent(${stu.student_id})'>Delete</button>
          </td>
        </tr>
      `;
    });

    updateSortIndicators();
  } catch (err) {
    console.error("Error loading students:", err);
  }
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
      loadStudents();
      clearForm();
    })
    .catch(err => console.error("Error updating student:", err));
}

// =================== EDIT STUDENT ===================
function editStudent(stu) {
  document.getElementById("student_id").value = stu.student_id;
  document.getElementById("student_no").value = stu.student_no || "";

  const nameParts = stu.student_name.split(" ");
  document.getElementById("first_name").value = nameParts[0] || "";
  document.getElementById("middle_name").value = nameParts.length === 3 ? nameParts[1] : "";
  document.getElementById("last_name").value = nameParts[nameParts.length - 1] || "";

  document.getElementById("email").value = stu.email;
  document.getElementById("gender").value = stu.gender;
  document.getElementById("birthdate").value = stu.birthdate;
  document.getElementById("year_level").value = stu.year_level;
  document.getElementById("program_id").value = stu.program_id;

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
