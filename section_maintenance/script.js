// ===== Global Variables =====
let sections = [];
const modal = document.getElementById("sectionModal");
const modalTitle = document.querySelector(".modal-header h2");

// ===== Modal Control =====
function openModal() {
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// ===== Populate Dropdown Helper =====
function populateDropdown(id, data, field1, field2 = "") {
  const select = document.getElementById(id);
  select.innerHTML = '<option value="">Select</option>';
  data.forEach(item => {
    const text = field2 ? `${item[field1]} - ${item[field2]}` : item[field1];
    const valueKey = Object.keys(item).find(k => k.endsWith("_id"));
    select.insertAdjacentHTML(
      "beforeend",
      `<option value="${item[valueKey]}">${text}</option>`
    );
  });
}

// ===== Load Dropdown Data =====
function loadDropdowns() {
  fetch("php/fetch_course.php")
    .then(res => res.json())
    .then(data => populateDropdown("course_id", data, "course_code"))
    .catch(() => alert("⚠️ Failed to load course data."));

  fetch("php/fetch_term.php")
    .then(res => res.json())
    .then(data => populateDropdown("term_id", data, "term_code"))
    .catch(() => alert("⚠️ Failed to load term data."));

  fetch("php/fetch_instructor.php")
    .then(res => res.json())
    .then(data => populateDropdown("instructor_id", data, "instructor_name"))
    .catch(() => alert("⚠️ Failed to load instructor data."));

  fetch("php/fetch_room.php")
    .then(res => res.json())
    .then(data => populateDropdown("room_id", data, "room_code"))
    .catch(() => alert("⚠️ Failed to load room data."));
}

// ===== Load Sections =====
function loadSections() {
  fetch("php/get_section.php")
    .then(res => res.json())
    .then(data => {
      sections = data;
      displaySections(sections);
    })
    .catch(() => alert("⚠️ Failed to load sections. Please refresh the page."));
}

// ===== Display Sections =====
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

// ===== Get Form Data =====
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
    max_capacity: document.getElementById("max_capacity").value,
  };
}

// ===== Reset Form =====
function resetForm() {
  document.querySelectorAll("#sectionModal input, #sectionModal select").forEach(el => el.value = "");
  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";
}

// ===== Validate Form =====
function validateForm(data) {
  const requiredFields = ["course_id", "term_id", "instructor_id", "room_id", "section_code", "year", "day_pattern", "start_time", "end_time", "max_capacity"];
  for (const field of requiredFields) {
    if (!data[field]) {
      alert("⚠️ Please fill in all required fields before saving.");
      return false;
    }
  }
  return true;
}

// ===== Save Section =====
function saveSection() {
  const data = getFormData();
  if (!validateForm(data)) return;

  fetch("php/add_section.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.status === "success") {
        alert("✅ Section added successfully!");
        loadSections();
        resetForm();
        closeModal();
      } else {
        alert("⚠️ Error adding section: " + resp.message);
      }
    })
    .catch(() => alert("⚠️ Failed to add section. Please try again later."));
}

// ===== Edit Section =====
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

  modalTitle.textContent = "Edit Section";
  openModal();
}

// ===== Update Section =====
function updateSection() {
  const data = getFormData();
  if (!validateForm(data)) return;

  fetch("php/update_section.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(resp => {
      if (resp.status === "success") {
        alert("✅ Section updated successfully!");
        loadSections();
        resetForm();
        closeModal();
      } else {
        alert("⚠️ Error updating section: " + resp.message);
      }
    })
    .catch(() => alert("⚠️ Failed to update section. Please try again later."));
}

// ===== Delete Section =====
function deleteSection(id) {
  if (!confirm("🗑️ Are you sure you want to delete this section?")) return;

  fetch(`php/delete_section.php?id=${id}`)
    .then(res => res.json())
    .then(resp => {
      if (resp.status === "success") {
        alert("✅ Section deleted successfully!");
        loadSections();
      } else {
        alert("⚠️ Error deleting section: " + resp.message);
      }
    })
    .catch(() => alert("⚠️ Failed to delete section. Please try again later."));
}

// ===== Search Sections =====
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
function exportExcel() { window.location.href = "php/export_excel.php"; }
function exportPDF() { window.location.href = "php/export_pdf.php"; }

// ===== On Page Load =====
document.addEventListener("DOMContentLoaded", () => {
  // Hide Update & Cancel buttons
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";

  // Load dropdowns and sections
  loadDropdowns();
  loadSections();

  // Event listeners
  document.getElementById("saveBtn").addEventListener("click", saveSection);
  document.getElementById("updateBtn").addEventListener("click", updateSection);
  document.getElementById("cancelBtn").addEventListener("click", () => { resetForm(); closeModal(); });
  document.getElementById("searchInput").addEventListener("input", searchSections);
  document.getElementById("exportExcel").addEventListener("click", exportExcel);
  document.getElementById("exportPDF").addEventListener("click", exportPDF);
  document.getElementById("addSectionBtn").addEventListener("click", () => { resetForm(); modalTitle.textContent = "Add Section"; openModal(); });
  document.getElementById("closeModal").addEventListener("click", closeModal);
  window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
});
