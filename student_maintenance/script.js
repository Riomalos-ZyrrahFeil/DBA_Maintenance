// =================== GLOBAL VARIABLES ===================
let programList = []; // stores all programs from DB

// =================== ON PAGE LOAD ===================
document.addEventListener("DOMContentLoaded", () => {
  loadPrograms().then(() => {
    loadStudents(); // load students only after programs are loaded
  });

  document.getElementById("updateBtn").style.display = "none"; // hide Update initially
  document.getElementById("saveBtn").style.display = "inline-block"; // show Save

  document.getElementById("saveBtn").addEventListener("click", addStudent);
  document.getElementById("updateBtn").addEventListener("click", updateStudent);
  document.getElementById("search").addEventListener("keyup", searchStudents);
});

// =================== LOAD PROGRAMS ===================
async function loadPrograms() {
  try {
    const res = await fetch("../program_maintenance/php/fetch_program.php");
    const data = await res.json();
    programList = data; // store for later use

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
function loadStudents(query = "") {
  fetch(`php/fetch_student.php?search=${query}`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#studentTable tbody");
      tbody.innerHTML = "";

      data.forEach(stu => {
        const programName = getProgramName(stu.program_id);
        tbody.innerHTML += `
          <tr>
            <td>${stu.student_id}</td>
            <td>${stu.student_name}</td>
            <td>${stu.email}</td>
            <td>${stu.gender}</td>
            <td>${stu.birthdate}</td>
            <td>${stu.year_level}</td>
            <td>${programName}</td>
            <td>
              <button class="edit-btn" onclick='editStudent(${JSON.stringify(stu)})'>✏️ Edit</button>
              <button class="delete-btn" onclick='deleteStudent(${stu.student_id})'>🗑 Delete</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => console.error("Error loading students:", err));
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

  // Split full name
  const nameParts = stu.student_name.split(" ");
  document.getElementById("first_name").value = nameParts[0] || "";
  document.getElementById("middle_name").value =
    nameParts.length === 3 ? nameParts[1] : "";
  document.getElementById("last_name").value =
    nameParts[nameParts.length - 1] || "";

  document.getElementById("email").value = stu.email;
  document.getElementById("gender").value = stu.gender;
  document.getElementById("birthdate").value = stu.birthdate;
  document.getElementById("year_level").value = stu.year_level;
  document.getElementById("program_id").value = stu.program_id;

  // Toggle buttons
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

// =================== SEARCH STUDENTS ===================
function searchStudents(e) {
  loadStudents(e.target.value);
}

// =================== CLEAR FORM ===================
function clearForm() {
  document.querySelectorAll("input, select").forEach(el => (el.value = ""));
  document.getElementById("student_id").value = "";

  // Reset buttons
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
}

// =================== HELPER: COLLECT FORM DATA ===================
function collectFormData() {
  const id = document.getElementById("student_id").value;

  const firstName = document.getElementById("first_name").value.trim();
  const middleName = document.getElementById("middle_name").value.trim();
  const lastName = document.getElementById("last_name").value.trim();
  const studentName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  return {
    student_id: id,
    student_name: studentName,
    email: document.getElementById("email").value.trim(),
    gender: document.getElementById("gender").value,
    birthdate: document.getElementById("birthdate").value,
    year_level: document.getElementById("year_level").value,
    program_id: document.getElementById("program_id").value,
  };
}

// =================== HELPER: GET PROGRAM NAME ===================
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
