// ===== Global Variables =====
let sections = [];
let currentSort = { column: "section_id", direction: "asc" }; // default sort
const MODAL_SECTION_CODES = ["DIT-1-1-TG", "DIT-2-1-TG", "DIT-3-1-TG"];
const modal = document.getElementById("sectionModal");
const modalTitle = document.querySelector(".modal-header h2");

// 🆕 PAGINATION STATE
let currentPage = 1;
const recordsPerPage = 10;
let totalRecords = 0;

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
    let value;
    if (id === "section_code") {
        value = item[field1]; // Use the code itself as the value
    } else {
        const valueKey = Object.keys(item).find(k => k.endsWith("_id"));
        value = item[valueKey];
    }

    select.insertAdjacentHTML(
      "beforeend",
      `<option value="${value}">${text}</option>`
    );
  });
}

// ===== Load Dropdowns =====
function loadDropdowns() {
  fetch("php/fetch_course.php").then(r => r.json()).then(d => populateDropdown("course_id", d, "course_code"));
  fetch("php/fetch_term.php").then(r => r.json()).then(d => populateDropdown("term_id", d, "term_code"));
  fetch("php/fetch_instructor.php").then(r => r.json()).then(d => populateDropdown("instructor_id", d, "instructor_name"));
  fetch("php/fetch_room.php").then(r => r.json()).then(d => populateDropdown("room_id", d, "room_code"));

  const sectionCodeData = MODAL_SECTION_CODES.map(code => ({ section_code_id: code, section_code_name: code }));
  populateDropdown("section_code", sectionCodeData, "section_code_name", "");
}

// ===== Load Sections =====
function loadSections(query = "", page = currentPage, limit = recordsPerPage) {
  const sortBy = currentSort.column;
  const order = currentSort.direction;

  fetch(`php/get_section.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}&page=${page}&limit=${limit}`)
    .then(res => res.json())
    .then(result => {
        // Handle new paginated response structure
        sections = result.data || [];
        totalRecords = result.total_records || 0;
        currentPage = result.current_page || 1;

        displaySections(sections);
        updateSortIndicators();
        renderPagination(); // Render controls after data is loaded
    })
    .catch((err) => {
        console.error("Failed to load sections:", err);
        const tbody = document.querySelector("#sectionTable tbody");
        tbody.innerHTML = `<tr><td class="no-data">⚠️ Failed to load sections. Check console.</td></tr>`;
        document.getElementById('pagination-info').textContent = '';
        document.getElementById('pagination-controls').innerHTML = '';
    });
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
          <button class="editBtn" onclick="editSection(${sec.section_id})">Edit</button>
          <button class="deleteBtn" onclick="deleteSection(${sec.section_id})">Delete</button>
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
        currentPage = 1;
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
  if (!sec) {
        alert("Section data not found in the current list.");
        return;
    }

  document.getElementById("section_id").value = sec.section_id;
  // Use the IDs fetched in the PHP script for dropdowns
  document.getElementById("course_id").value = sec.course_id; 
  document.getElementById("term_id").value = sec.term_id;
  document.getElementById("instructor_id").value = sec.instructor_id;
  document.getElementById("room_id").value = sec.room_id;
  document.getElementById("section_code").value = sec.section_code;
  document.getElementById("year").value = sec.year;
  document.getElementById("day_pattern").value = sec.day_pattern;
  
  // Time parsing is tricky; use raw values if available, or try to format
  document.getElementById("start_time").value = sec.start_time.substring(0, 5);
  document.getElementById("end_time").value = sec.end_time.substring(0, 5);
  
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
        currentPage = 1;
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
  currentPage = 1;
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
  currentPage = 1;
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

// ===== PAGINATION FUNCTIONS (New) =====
function renderPagination() {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const controlsContainer = document.getElementById('pagination-controls');
    const infoContainer = document.getElementById('pagination-info');
    controlsContainer.innerHTML = '';

    if (totalPages <= 1) {
        infoContainer.textContent = totalRecords > 0 ? `Total: ${totalRecords} records` : '';
        return;
    }

    const startRecord = (currentPage - 1) * recordsPerPage + 1;
    const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);
    
    infoContainer.textContent = `Showing ${startRecord} to ${endRecord} of ${totalRecords} records (Page ${currentPage} of ${totalPages})`;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '« Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => goToPage(currentPage - 1);
    controlsContainer.appendChild(prevBtn);

    // Page number links
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
    const query = document.getElementById("searchInput").value.trim();
    loadSections(query, currentPage, recordsPerPage);
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
