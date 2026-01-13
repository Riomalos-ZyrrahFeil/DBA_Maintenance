let enrollmentList = [];
let currentSort = { column: "enrollment_id", direction: "desc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalRecords = 0;
let allSections = [];
let allStudents = {};

const userRole = "<?php echo $_SESSION['role']; ?>";
const studentSessionId = "<?php echo $_SESSION['student_id'] ?? 0; ?>";

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) { 
    console.error("Fetch Error:", err);
    return { status: 'error', data: [] }; 
  }
}

async function saveEnrollment() {
  const payload = getFormData();
  if (!payload) return;
  const resp = await fetchJSON('php/add_enrollment.php', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(payload) 
  });
  if (resp.status === "success") { window.closeModal(); loadEnrollments(); }
  else alert(resp.message);
}

async function updateEnrollment() {
  const payload = getFormData();
  if (!payload) return;
  payload.enrollment_id = document.getElementById('enrollment_id').value;
  const resp = await fetchJSON('php/update_enrollment.php', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(payload) 
  });
  if (resp.status === "success") { window.closeModal(); loadEnrollments(); }
  else alert(resp.message);
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById('enrollmentModal');
  const exportModal = document.getElementById('exportModal');
  const courseDetailsModal = document.getElementById('courseDetailsModal');
  const studentSearchInput = document.getElementById('studentSearchInput');
  const exportDropdown = document.getElementById('export_student_id');
  const searchInput = document.getElementById('search');

  loadStudents();
  loadSections();
  loadEnrollments();

  if (userRole === 'student') {
    document.getElementById('openModalBtn').style.display = 'none';
  }

  document.getElementById('openModalBtn').onclick = () => {
      document.getElementById('modalTitle').innerText = "Add New Enrollment";
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden';
  };

  document.getElementById('saveBtn').onclick = saveEnrollment;
  document.getElementById('updateBtn').onclick = updateEnrollment;

  searchInput.addEventListener('input', e => {
    currentPage = 1;
    loadEnrollments(e.target.value.trim());
  });

  document.querySelectorAll('#enrollmentTable thead th[data-column]').forEach(th => {
    th.addEventListener('click', () => toggleSort(th.getAttribute('data-column')));
  });

    document.getElementById('exportPdfBtn').onclick = (e) => {
      const role = window.PHP_VARS.userRole;
      const sId = window.PHP_VARS.studentId;

      if (role === 'student') {
        window.location.href = `php/export_pdf.php?student_id=${sId}`;
      } else {
        populateExportDropdown();
        document.getElementById('studentSearchInput').value = "";
        exportModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
  };

  studentSearchInput.addEventListener('input', function() {
    const filter = this.value.toLowerCase();
    const options = exportDropdown.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === "all") continue;
      options[i].style.display = options[i].text.toLowerCase().includes(filter) ? "" : "none";
    }
  });

  document.getElementById('confirmExportBtn').onclick = () => {
    window.location.href = `php/export_pdf.php?student_id=${exportDropdown.value}`;
    window.closeModal();
  };

  window.closeModal = () => {
    modal.style.display = 'none';
    exportModal.style.display = 'none';
    courseDetailsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    clearForm();
  };

  ['closeModalBtn', 'cancelBtn', 'closeExportModalBtn', 'cancelExportBtn', 
   'closeCourseDetailsBtn', 'closeCourseDetailsModalBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = window.closeModal;
  });

  document.getElementById('enrollment_type').onchange = updateSectionDropdown;
  document.getElementById('student_id').onchange = updateSectionDropdown;

  window.onclick = e => {
    if (e.target === modal || e.target === exportModal || e.target === courseDetailsModal) window.closeModal();
  };

  window.editEnrollment = editEnrollment;
  window.deleteEnrollment = deleteEnrollment;
  window.openCourseDetailsModal = openCourseDetailsModal;
});

async function loadStudents() {
  const data = await fetchJSON('php/fetch_students.php');
  const select = document.getElementById('student_id');
  select.innerHTML = '<option value="">Select Student</option>';
  const students = Array.isArray(data) ? data : (data.data || []);
  students.forEach(s => {
    select.innerHTML += `<option value="${s.student_id}">${s.student_name} (${s.student_id})</option>`;
    allStudents[s.student_id] = s;
  });
}

async function loadSections() {
  const data = await fetchJSON('php/fetch_sections.php');
  allSections = Array.isArray(data) ? data : (data.data || []);
  updateSectionDropdown();
}

function updateSectionDropdown() {
    const type = document.getElementById('enrollment_type').value;
    const studentId = document.getElementById('student_id').value;
    const sectionSelect = document.getElementById('section_id');
    
    if (!studentId) {
        sectionSelect.innerHTML = '<option value="">Select Student First</option>';
        sectionSelect.disabled = true;
        return;
    }

    const student = allStudents[studentId];
    sectionSelect.disabled = false;

    const isIrregular = (student.status === 'Irregular' || type === 'Irregular');

    let filtered = [];

    if (!isIrregular) {
        const [yr, sem] = student.year_level.split('-');
        const programBase = student.program_code.split('-')[0];
        const targetSection = `${programBase}-${yr}-${sem}-TG`;
        
        filtered = allSections.filter(sec => sec.section_code === targetSection);
        
        if (filtered.length === 0) {
            console.warn("No block section found for: " + targetSection);
        }
    } else {
        const programBase = student.program_code.split('-')[0];
        filtered = allSections.filter(sec => sec.section_code.startsWith(programBase));
    }

    sectionSelect.innerHTML = filtered.length ? '<option value="">Select Section</option>' : '<option value="">No Sections Available</option>';
    filtered.forEach(sec => {
        sectionSelect.innerHTML += `<option value="${sec.section_id}">${sec.section_code} (${sec.display_text || 'Generic'})</option>`;
    });
}

async function loadEnrollments(query = "") {
  const url = `php/get_enrollment.php?search=${encodeURIComponent(query)}&sort_by=${currentSort.column}&order=${currentSort.direction}&page=${currentPage}&limit=${rowsPerPage}`;
  const response = await fetchJSON(url);
  const data = response.data || [];
  totalRecords = response.total_records || 0;

  const tbody = document.querySelector('#enrollmentTable tbody');
  tbody.innerHTML = data.length ? "" : '<tr><td colspan="7" class="no-data">No enrollments found</td></tr>';

  const role = window.PHP_VARS.userRole; 
  const isAdminOrFaculty = (role === 'super_admin' || role === 'faculty');

  data.forEach(e => {
    tbody.innerHTML += `
      <tr>
        <td>${e.enrollment_id}</td>
        <td>${e.student_name}</td>
        <td>${e.section_code}</td>
        <td>${e.enrollment_type}</td>
        <td>${e.date_enrolled}</td>
        <td>${e.status}</td>
        <td class="actions-cell">
          <button class="action-btn show-courses-btn" onclick="openCourseDetailsModal(${e.student_id})">Courses</button>
          ${isAdminOrFaculty ? `
            <button class="action-btn edit-btn" onclick="editEnrollment(${e.enrollment_id})">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteEnrollment(${e.enrollment_id})">Delete</button>
          ` : ''}
        </td>
      </tr>`;
  });
  renderPagination();
  updateSortIndicators();
}

async function openCourseDetailsModal(studentId) {
  const student = allStudents[studentId];
  const title = document.getElementById('courseDetailsTitle');
  const content = document.getElementById('courseDetailsContent');
  const modal = document.getElementById('courseDetailsModal');

  title.textContent = `Enrolled Courses for ${student ? student.student_name : 'Student'}`;
  content.innerHTML = '<p>Loading...</p>';
  modal.style.display = 'block';

  const response = await fetchJSON(`php/fetch_student_enrollments.php?student_id=${studentId}`);
  const enrollments = Array.isArray(response) ? response : (response.data || []);

  if (enrollments.length === 0) {
    content.innerHTML = '<p>No current active enrollments.</p>';
  } else {
    let html = '<ul style="list-style: none; padding-left: 0;">';
    enrollments.forEach(e => {
      html += `<li><strong>${e.course_code}</strong> (${e.section_code}) - <em>${e.status}</em></li>`;
    });
    content.innerHTML = html + '</ul>';
  }
}

async function editEnrollment(id) {
  const data = await fetchJSON(`php/get_enrollment.php?id=${id}`);
  document.getElementById('enrollment_id').value = data.enrollment_id;
  document.getElementById('student_id').value = data.student_id;
  document.getElementById('enrollment_type').value = data.enrollment_type;
  updateSectionDropdown();
  setTimeout(() => { document.getElementById('section_id').value = data.section_id; }, 100);
  document.getElementById('date_enrolled').value = data.date_enrolled;
  document.getElementById('status').value = data.status;
  document.getElementById('letter_grade').value = data.letter_grade;
  
  document.getElementById('saveBtn').style.display = 'none';
  document.getElementById('updateBtn').style.display = 'inline-block';
  document.getElementById('enrollmentModal').style.display = 'block';
}

async function deleteEnrollment(id) {
  if (!confirm("Are you sure?")) return;
  const resp = await fetchJSON(`php/delete_enrollment.php?id=${id}`);
  if (resp.status === "success") loadEnrollments();
}

function getFormData() {
  const data = {
    student_id: document.getElementById('student_id').value,
    enrollment_type: document.getElementById('enrollment_type').value,
    section_id: document.getElementById('section_id').value,
    date_enrolled: document.getElementById('date_enrolled').value,
    status: document.getElementById('status').value,
    letter_grade: document.getElementById('letter_grade').value
  };
  if (!data.student_id || !data.section_id || !data.date_enrolled) { alert("Please fill required fields"); return null; }
  return data;
}

function clearForm() {
  ["enrollment_id", "date_enrolled", "status", "letter_grade"].forEach(id => document.getElementById(id).value = "");
  document.getElementById('student_id').value = "";
  document.getElementById('enrollment_type').value = "Regular";
  document.getElementById('saveBtn').style.display = 'inline-block';
  document.getElementById('updateBtn').style.display = 'none';
}

function toggleSort(column) {
  currentSort.direction = (currentSort.column === column && currentSort.direction === "asc") ? "desc" : "asc";
  currentSort.column = column;
  currentPage = 1;
  loadEnrollments(document.getElementById('search').value.trim());
}

function renderPagination() {
  const pages = Math.ceil(totalRecords / rowsPerPage);
  const controls = document.getElementById('pagination-controls');
  const info = document.getElementById('pagination-info');
  controls.innerHTML = '';
  if (totalRecords === 0) { info.textContent = "No records found."; return; }
  info.textContent = `Showing ${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(currentPage * rowsPerPage, totalRecords)} of ${totalRecords}`;
  if (pages <= 1) return;
  const createBtn = (text, target, disabled, active = false) => {
    const btn = document.createElement('button');
    btn.textContent = text; btn.disabled = disabled; btn.className = 'page-button' + (active ? ' active' : '');
    btn.onclick = () => { currentPage = target; loadEnrollments(document.getElementById('search').value.trim()); };
    controls.appendChild(btn);
  };
  createBtn('« Previous', currentPage - 1, currentPage === 1);
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      createBtn(i, i, i === currentPage, i === currentPage);
    }
  }
  createBtn('Next »', currentPage + 1, currentPage === pages);
}

function updateSortIndicators() {
  document.querySelectorAll('th[data-column]').forEach(th => {
    const col = th.getAttribute('data-column');
    const label = th.getAttribute('data-label') || th.textContent.replace(/[↕▲▼]/g, '').trim();
    th.setAttribute('data-label', label);
    th.innerHTML = `${label} ${col === currentSort.column ? (currentSort.direction === "asc" ? "▲" : "▼") : "↕"}`;
  });
}

function populateExportDropdown() {
  const exportDropdown = document.getElementById('export_student_id');
  exportDropdown.innerHTML = '<option value="all">All Students</option>';
  Object.keys(allStudents).forEach(id => {
    exportDropdown.innerHTML += `<option value="${id}">${allStudents[id].student_name}</option>`;
  });
}