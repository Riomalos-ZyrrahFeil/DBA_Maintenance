// ===== Global Variables =====
let sections = [];

// ===== On Page Load =====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";

  loadDropdowns();
  loadSections();

  // Event Listeners
  document.getElementById("saveBtn").addEventListener("click", saveSection);
  document.getElementById("updateBtn").addEventListener("click", updateSection);
  document.getElementById("cancelBtn").addEventListener("click", resetForm);
  document.getElementById("searchInput").addEventListener("input", searchSections);
  document.getElementById("exportExcel").addEventListener("click", exportExcel);
  document.getElementById("exportPDF").addEventListener("click", exportPDF);
});

// ===== Load Dropdown Data =====
function loadDropdowns() {
  fetch('php/fetch_course.php')
    .then(res => res.json())
    .then(data => populateDropdown('course_id', data, 'course_code'));

  fetch('php/fetch_term.php')
    .then(res => res.json())
    .then(data => populateDropdown('term_id', data, 'term_code'));

  fetch('php/fetch_instructor.php')
    .then(res => res.json())
    .then(data => populateDropdown('instructor_id', data, 'instructor_name'));

  fetch('php/fetch_room.php')
    .then(res => res.json())
    .then(data => populateDropdown('room_id', data, 'room_code'));
}

// ===== Populate Dropdown Helper =====
function populateDropdown(id, data, field1, field2='') {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Select</option>';
  data.forEach(item => {
    const text = field2 ? `${item[field1]} - ${item[field2]}` : item[field1];
    select.insertAdjacentHTML('beforeend', `<option value="${item[id.replace('_id','_id')]}">${text}</option>`);
  });
}

// ===== Load Sections =====
function loadSections() {
  fetch('php/get_section.php')
    .then(res => res.json())
    .then(data => {
      sections = data;
      displaySections(sections);
    })
    .catch(err => console.error('Error loading sections:', err));
}

// ===== Display Sections in Table =====
function displaySections(list) {
  const tbody = document.querySelector("#sectionTable tbody");
  tbody.innerHTML = "";

  list.forEach(sec => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sec.section_id}</td>
      <td>${sec.course_code}</td>
      <td>${sec.term_code}</td>
      <td>${sec.instructor_name}</td>
      <td>${sec.room_name}</td>
      <td>${sec.section_code}</td>
      <td>${sec.year}</td>
      <td>${sec.day_pattern}</td>
      <td>${sec.start_time}</td>
      <td>${sec.end_time}</td>
      <td>${sec.max_capacity}</td>
      <td>
        <button class="editBtn" onclick="editSection(${sec.section_id})">Edit</button>
        <button class="deleteBtn" onclick="deleteSection(${sec.section_id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// ===== Form Actions =====
function saveSection() {
  const data = getFormData();
  fetch('php/add_section.php', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(resp => {
    if(resp.status === 'success'){
      loadSections();
      resetForm();
    } else {
      alert('Error: ' + resp.message);
    }
  })
  .catch(err => console.error('Error saving section:', err));
}

function editSection(id) {
  const sec = sections.find(s => s.section_id == id);
  if (!sec) return;

  document.getElementById("section_id").value = sec.section_id;
  document.getElementById("course_id").value = sec.course_id;
  document.getElementById("term_id").value = sec.term_id;
  document.getElementById("instructor_id").value = sec.instructor_id;
  document.getElementById("room_id").value = sec.room_id;
  document.getElementById("section_code").value = sec.section_code;
  document.getElementById("year").value = sec.year;
  document.getElementById("day_pattern").value = sec.day_pattern;
  document.getElementById("start_time").value = sec.start_time;
  document.getElementById("end_time").value = sec.end_time;
  document.getElementById("max_capacity").value = sec.max_capacity;

  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

function updateSection() {
  const data = getFormData();
  fetch('php/update_section.php', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(resp => {
    if(resp.status === 'success'){
      loadSections();
      resetForm();
    } else {
      alert('Error: ' + resp.message);
    }
  })
  .catch(err => console.error('Error updating section:', err));
}

function deleteSection(id) {
  if(!confirm("Are you sure you want to delete this section?")) return;
  fetch(`php/delete_section.php?id=${id}`)
    .then(res => res.json())
    .then(resp => loadSections())
    .catch(err => console.error('Error deleting section:', err));
}

function resetForm() {
  document.getElementById("section_id").value = "";
  document.getElementById("section_code").value = "";
  document.getElementById("year").value = "";
  document.getElementById("day_pattern").value = "";
  document.getElementById("start_time").value = "";
  document.getElementById("end_time").value = "";
  document.getElementById("max_capacity").value = "";
  document.getElementById("course_id").value = "";
  document.getElementById("term_id").value = "";
  document.getElementById("instructor_id").value = "";
  document.getElementById("room_id").value = "";

  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";
}

function getFormData() {
  return {
    section_id: document.getElementById("section_id").value,
    course_id: document.getElementById("course_id").value,
    term_id: document.getElementById("term_id").value,
    instructor_id: document.getElementById("instructor_id").value,
    room_id: document.getElementById("room_id").value,
    section_code: document.getElementById("section_code").value,
    year: document.getElementById("year").value,
    day_pattern: document.getElementById("day_pattern").value,
    start_time: document.getElementById("start_time").value,
    end_time: document.getElementById("end_time").value,
    max_capacity: document.getElementById("max_capacity").value
  };
}

// ===== Search =====
function searchSections() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = sections.filter(sec =>
    sec.section_code.toLowerCase().includes(query) ||
    sec.year.toString().includes(query) ||
    sec.day_pattern.toLowerCase().includes(query) ||
    sec.course_code.toLowerCase().includes(query) ||
    sec.term_code.toLowerCase().includes(query) ||
    sec.instructor_name.toLowerCase().includes(query) ||
    sec.room_name.toLowerCase().includes(query)
  );
  displaySections(filtered);
}

// ===== Export =====
function exportExcel() { window.location.href='php/export_excel.php'; }
function exportPDF() { window.location.href='php/export_pdf.php'; }
