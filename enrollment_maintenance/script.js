let enrollmentList = [];
let currentSort = { column: "enrollment_id", direction: "desc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalRecords = 0;
let allSections = [];
let allStudents = {};

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById('enrollmentModal');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const saveBtn = document.getElementById('saveBtn');
  const updateBtn = document.getElementById('updateBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const studentSelect = document.getElementById('student_id');
  const typeSelect = document.getElementById('enrollment_type');
  const searchInput = document.getElementById('search');

  loadStudents();
  loadSections();
  loadEnrollments();

  const openModal = (title = "Enrollment Form") => {
    document.getElementById('modalTitle').innerText = title;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    clearForm();
  };

  openModalBtn.onclick = () => { clearForm(); openModal("Add New Enrollment"); };
  closeModalBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;
  window.onclick = e => { if (e.target === modal) closeModal(); };

  searchInput.addEventListener('input', e => {
    currentPage = 1;
    loadEnrollments(e.target.value.trim());
  });
  typeSelect.onchange = updateSectionDropdown;
  studentSelect.onchange = updateSectionDropdown;

  saveBtn.onclick = saveEnrollment;
  updateBtn.onclick = updateEnrollment;

  document.querySelectorAll('#enrollmentTable thead th[data-column]').forEach(th => {
    th.addEventListener('click', () => {
      const column = th.getAttribute('data-column');
      if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        currentSort.column = column;
        currentSort.direction = "asc";
      }
      currentPage = 1;
      loadEnrollments(searchInput.value.trim());
    });
  });

  async function populateCourseDetailsModal(studentId, studentName) {
    const title = document.getElementById('courseDetailsTitle');
    const content = document.getElementById('courseDetailsContent');
    const modal = document.getElementById('courseDetailsModal');

    title.textContent = `Enrolled Courses for ${studentName}`;
    content.innerHTML = '<p>Loading course data...</p>';
    modal.style.display = 'block';

    const url = `php/fetch_student_enrollments.php?student_id=${studentId}`;
    const response = await fetchJSON(url); 
    
    if (!response || response.status === 'error') {
      content.innerHTML = `<p style="color: #dc3545;">Error loading enrollments.</p>`;
      return;
    }
    
    const enrollments = Array.isArray(response) ? response : (response.data || []);

    if (enrollments.length === 0) {
      content.innerHTML = `<p>Student has no current active enrollments.</p>`;
    } else {
      let html = '<ul style="list-style: none; padding-left: 0;">';
      enrollments.forEach(e => {
        html += `<li><strong>${e.course_code}</strong> (${e.section_code}) - <em>${e.status}</em></li>`;
      });
      html += '</ul>';
      content.innerHTML = html;
    }
  }

  window.openCourseDetailsModal = (studentId) => {
    const student = allStudents[studentId];
    const studentName = student ? student.student_name : `Student ID ${studentId}`;
    populateCourseDetailsModal(studentId, studentName);
  };

  window.closeCourseDetailsModal = () => {
    document.getElementById('courseDetailsModal').style.display = 'none';
  };

  document.getElementById('closeCourseDetailsBtn').onclick = window.closeCourseDetailsModal;
  document.getElementById('closeCourseDetailsModalBtn').onclick = window.closeCourseDetailsModal;
  document.getElementById('exportExcelBtn').onclick = () => window.location.href = 'php/export_excel.php';
  document.getElementById('exportPdfBtn').onclick = () => window.location.href = 'php/export_pdf.php';

  window.editEnrollment = editEnrollment;
  window.deleteEnrollment = deleteEnrollment;
  window.closeModal = closeModal;
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

  sectionSelect.innerHTML = '<option value="">Select Section</option>';
  if (!studentId) {
    sectionSelect.disabled = true;
    return;
  }

  const student = allStudents[studentId];
  sectionSelect.disabled = false;

  let filtered = [];
  if (type === 'Regular' && student) {
    const [yr, sem] = student.year_level.split('-');
    const progBase = student.program_code.replace(/-TG$/, '');
    const target = `${progBase}-${yr}-${sem}-TG`;
    filtered = allSections.filter(sec => sec.section_code === target);
  } else {
    filtered = allSections;
  }

  filtered.forEach(sec => {
    sectionSelect.innerHTML += `<option value="${sec.section_id}">${sec.section_code} - ${sec.display_text || sec.year}</option>`;
  });
}

async function loadEnrollments(query = "") {
  const url = `php/get_enrollment.php?search=${encodeURIComponent(query)}&sort_by=${currentSort.column}&order=${currentSort.direction}&page=${currentPage}&limit=${rowsPerPage}`;
  const response = await fetchJSON(url);
  const data = response.data || [];
  totalRecords = response.total_records || 0;

  const tbody = document.querySelector('#enrollmentTable tbody');
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">No enrollments found</td></tr>';
  } else {
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
            <button class="action-btn edit-btn" onclick="editEnrollment(${e.enrollment_id})">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteEnrollment(${e.enrollment_id})">Delete</button>
          </td>
        </tr>`;
    });
  }
  renderPagination();
  updateSortIndicators();
}

async function saveEnrollment() {
  const payload = getFormData();
  if (!payload) return;
  const resp = await fetchJSON('php/add_enrollment.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (resp.status === "success") { window.closeModal(); loadEnrollments(); }
  else alert(resp.message);
}

async function updateEnrollment() {
  const payload = getFormData();
  if (!payload) return;
  payload.enrollment_id = document.getElementById('enrollment_id').value;
  const resp = await fetchJSON('php/update_enrollment.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (resp.status === "success") { window.closeModal(); loadEnrollments(); }
  else alert(resp.message);
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
  else alert(resp.message);
}

// Utility Helpers
function clearForm() {
  ["enrollment_id", "date_enrolled", "status", "letter_grade"].forEach(id => document.getElementById(id).value = "");
  document.getElementById('student_id').value = "";
  document.getElementById('enrollment_type').value = "Regular";
  document.getElementById('saveBtn').style.display = 'inline-block';
  document.getElementById('updateBtn').style.display = 'none';
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
  if (!data.student_id || !data.section_id || !data.date_enrolled) {
    alert("Please fill required fields");
    return null;
  }
  return data;
}

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) { console.error(err); return { status: 'error', data: [] }; }
}

function toggleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }

  currentPage = 1;

  const query = document.getElementById('search').value.trim();
  loadEnrollments(query);
}

function renderPagination() {
  const pages = Math.ceil(totalRecords / rowsPerPage);
  const container = document.getElementById('pagination-controls');
  const info = document.getElementById('pagination-info');
  container.innerHTML = '';
  info.textContent = totalRecords ? `Showing ${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(currentPage * rowsPerPage, totalRecords)} of ${totalRecords}` : "";
  if (pages <= 1) return;
  const btn = (txt, target, disabled, active) => {
    const b = document.createElement('button');
    b.textContent = txt; b.disabled = disabled; b.className = 'page-button' + (active ? ' active' : '');
    b.onclick = () => { currentPage = target; loadEnrollments(document.getElementById('search').value); };
    container.appendChild(b);
  };
  btn('« Prev', currentPage - 1, currentPage === 1);
  for(let i=1; i<=pages; i++) btn(i, i, i === currentPage, i === currentPage);
  btn('Next »', currentPage + 1, currentPage === pages);
}

function updateSortIndicators() {
  document.querySelectorAll('th[data-column]').forEach(th => {
    const col = th.getAttribute('data-column');
    const label = th.getAttribute('data-label') || th.textContent.replace(/[↕▲▼]/g, '').trim();
    th.setAttribute('data-label', label);
    if (col === currentSort.column) {
      th.innerHTML = `${label} ${currentSort.direction === "asc" ? "▲" : "▼"}`;
      th.classList.add('active-sort');
    } else {
      th.innerHTML = `${label} ↕`;
      th.classList.remove('active-sort');
    }
  });
}