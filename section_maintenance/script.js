let sections = [];
let currentSort = { column: "section_id", direction: "asc" };
let currentPage = 1;
const recordsPerPage = 10;
let totalRecords = 0;
const MODAL_SECTION_CODES = ["DIT-1-1-TG", "DIT-2-1-TG", "DIT-3-1-TG", "BSIT-1-1-TG", "BSIT-2-1-TG", "BSIT-3-1-TG"];

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("formModal");
  const addBtn = document.getElementById("addSectionBtn");
  const closeBtn = document.querySelector(".close-modal");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const modalTitle = document.getElementById("modalTitle");

  loadDropdowns();
  loadSections();

  const openModal = (title = "Add New Section") => {
    modalTitle.innerText = title;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    resetForm();
  };

  if (addBtn) {
    addBtn.onclick = () => {
      openModal("Add New Section");
      saveBtn.style.display = "inline-block";
      updateBtn.style.display = "none";
    };
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  window.onclick = (e) => { if (e.target === modal) closeModal(); };

  document.getElementById("search").addEventListener("input", (e) => {
    currentPage = 1;
    loadSections(e.target.value.trim());
  });

  saveBtn.onclick = saveSection;
  updateBtn.onclick = updateSection;

  document.querySelectorAll("#sectionTable thead th[data-column]").forEach(th => {
    th.addEventListener("click", () => toggleSort(th.getAttribute("data-column")));
  });

  window.editSection = (id) => {
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
    document.getElementById("start_time").value = sec.start_time.substring(0, 5);
    document.getElementById("end_time").value = sec.end_time.substring(0, 5);
    document.getElementById("max_capacity").value = sec.max_capacity;

    saveBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
    openModal("Edit Section");
  };

  window.closeModal = closeModal;
  window.exportExcel = () => {
    window.location.href = "php/export_excel.php";
  };

  window.exportPDF = () => {
    window.location.href = "php/export_pdf.php";
  };
});

function loadDropdowns() {
  const populate = (id, data, f1) => {
    const s = document.getElementById(id);
    s.innerHTML = '<option value="">Select</option>';
    data.forEach(item => {
      const val = item[`${id.replace('_id', '')}_id`] || item[f1];
      s.insertAdjacentHTML("beforeend", `<option value="${val}">${item[f1]}</option>`);
    });
  };

  fetch("php/fetch_course.php").then(r => r.json()).then(d => populate("course_id", d, "course_code"));
  fetch("php/fetch_term.php").then(r => r.json()).then(d => populate("term_id", d, "term_code"));
  fetch("php/fetch_instructor.php").then(r => r.json()).then(d => populate("instructor_id", d, "instructor_name"));
  fetch("php/fetch_room.php").then(r => r.json()).then(d => populate("room_id", d, "room_code"));
  
  const codes = MODAL_SECTION_CODES.map(c => ({ section_code: c }));
  populate("section_code", codes, "section_code");
}

async function loadSections(query = "") {
  const url = `php/get_section.php?search=${encodeURIComponent(query)}&sort_by=${currentSort.column}&order=${currentSort.direction}&page=${currentPage}&limit=${recordsPerPage}`;
  const res = await fetch(url);
  const result = await res.json();
  sections = result.data || [];
  totalRecords = result.total_records || 0;

  const tbody = document.querySelector("#sectionTable tbody");
  tbody.innerHTML = "";

  sections.forEach(sec => {
    tbody.innerHTML += `
      <tr>
        <td>${sec.section_id}</td>
        <td>${sec.course_code}</td>
        <td>${sec.term_code}</td>
        <td>${sec.instructor_name}</td>
        <td>${sec.room_name}</td>
        <td>${sec.section_code}</td>
        <td>${sec.max_capacity}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editSection(${sec.section_id})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteSection(${sec.section_id})">Delete</button>
        </td>
      </tr>`;
  });
  renderPagination();
}

function saveSection() {
  const data = getFormData();
  fetch("php/add_section.php", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })
    .then(r => r.json()).then(resp => {
      if (resp.status === "success") { window.closeModal(); loadSections(); }
    });
}

function updateSection() {
  const data = getFormData();
  fetch("php/update_section.php", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })
    .then(r => r.json()).then(resp => {
      if (resp.status === "success") { window.closeModal(); loadSections(); }
    });
}

function deleteSection(id) {
  if (!confirm("Delete this section?")) return;
  fetch(`php/delete_section.php?id=${id}`).then(() => loadSections());
}

function getFormData() {
  const fields = ["section_id", "course_id", "term_id", "instructor_id", "room_id", "section_code", "year", "day_pattern", "start_time", "end_time", "max_capacity"];
  const data = {};
  fields.forEach(f => data[f] = document.getElementById(f).value);
  return data;
}

function resetForm() {
  document.querySelectorAll("#formModal input, #formModal select").forEach(el => el.value = "");
}

function toggleSort(column) {
  currentSort.direction = (currentSort.column === column && currentSort.direction === "asc") ? "desc" : "asc";
  currentSort.column = column;
  loadSections(document.getElementById("search").value.trim());
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
    btn.onclick = () => { currentPage = target; loadSections(document.getElementById("search").value.trim()); };
    controls.appendChild(btn);
  };
  createBtn('« Prev', currentPage - 1, currentPage === 1);
  for(let i=1; i<=pages; i++) createBtn(i, i, i === currentPage, i === currentPage);
  createBtn('Next »', currentPage + 1, currentPage === pages);
}