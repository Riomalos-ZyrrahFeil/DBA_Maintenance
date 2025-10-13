// ===== Global Variables =====
let sections = [];
let currentSort = { column: "section_id", direction: "asc" }; // default sort
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

// ===== Load Dropdowns =====
function loadDropdowns() {
  fetch("php/fetch_course.php").then(r => r.json()).then(d => populateDropdown("course_id", d, "course_code"));
  fetch("php/fetch_term.php").then(r => r.json()).then(d => populateDropdown("term_id", d, "term_code"));
  fetch("php/fetch_instructor.php").then(r => r.json()).then(d => populateDropdown("instructor_id", d, "instructor_name"));
  fetch("php/fetch_room.php").then(r => r.json()).then(d => populateDropdown("room_id", d, "room_code"));
}

// ===== Load Sections =====
function loadSections(query = "") {
  const sortBy = currentSort.column;
  const order = currentSort.direction;

  fetch(`php/get_section.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}`)
    .then(res => res.json())
    .then(data => {
      sections = data;
      displaySections(sections);
      updateSortIndicators();
    })
    .catch(() => alert("⚠️ Failed to load sections. Please refresh the page."));
}

// ===== Display Sections =====
function displaySections(list) {
  const tbody = document.querySelector("#sectionTable tbody");
  tbody.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12">No sections found</td></tr>`;
    return;
  }

  list.forEach(sec => {
    tbody.innerHTML += `
      <tr>
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
          <button onclick="editSection(${sec.section_id})">Edit</button>
          <button onclick="deleteSection(${sec.section_id})">Delete</button>
        </td>
      </tr>
    `;
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

  fetch("php/add_section.php", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })
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

  fetch("php/update_section.php", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })
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
function searchSections(e) {
  const query = e.target.value.trim().toLowerCase();
  loadSections(query);
}

// ===== Sorting =====
function toggleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }
  const searchInput = document.getElementById("searchInput").value.trim();
  loadSections(searchInput);
}

function updateSortIndicators() {
  document.querySelectorAll("#sectionTable thead th[data-column]").forEach((th) => {
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

// ===== Export =====
function exportExcel() { window.location.href = "php/export_excel.php"; }
function exportPDF() { window.location.href = "php/export_pdf.php"; }

// ===== On Page Load =====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";

  loadDropdowns();
  loadSections();

  document.getElementById("saveBtn").addEventListener("click", saveSection);
  document.getElementById("updateBtn").addEventListener("click", updateSection);
  document.getElementById("cancelBtn").addEventListener("click", () => { resetForm(); closeModal(); });
  document.getElementById("searchInput").addEventListener("input", searchSections);
  document.getElementById("addSectionBtn").addEventListener("click", () => { resetForm(); modalTitle.textContent = "Add Section"; openModal(); });
  document.getElementById("closeModal").addEventListener("click", closeModal);

  // Sorting
  document.querySelectorAll("#sectionTable thead th[data-column]").forEach(th => {
    th.addEventListener("click", () => toggleSort(th.getAttribute("data-column")));
  });

  window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
});
