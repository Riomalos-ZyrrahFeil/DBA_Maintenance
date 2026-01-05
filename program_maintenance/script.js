let programList = [];
let currentSort = { column: "program_id", direction: "desc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalRecords = 0;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("formModal");
  const addBtn = document.getElementById("addBtn");
  const closeBtn = document.querySelector(".close-modal");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const modalTitle = document.getElementById("modalTitle");

  loadDepartments();
  loadPrograms();

  const openModal = (title = "Add New Program") => {
    modalTitle.innerText = title;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    clearForm();
  };

  if (addBtn) {
    addBtn.onclick = () => {
      openModal("Add New Program");
      saveBtn.style.display = "inline-block";
      updateBtn.style.display = "none";
    };
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  window.onclick = (e) => { if (e.target === modal) closeModal(); };

  document.getElementById("search").addEventListener("keyup", (e) => {
    currentPage = 1;
    loadPrograms(e.target.value.trim());
  });

  saveBtn.onclick = saveProgram;
  updateBtn.onclick = updateProgram;

  document.querySelectorAll("#programTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => toggleSort(th.getAttribute("data-column")));
  });

  window.editProgram = (id) => {
    const p = programList.find(pr => pr.program_id == id);
    if (!p) return;

    document.getElementById("program_id").value = p.program_id;
    document.getElementById("program_code").value = p.program_code;
    document.getElementById("program_name").value = p.program_name;
    document.getElementById("dept_id").value = p.dept_id;

    saveBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
    openModal("Edit Program");
  };

  window.closeModal = closeModal;
});

async function loadDepartments() {
  try {
    const res = await fetch("../department_maintenance/php/fetch_department.php");
    const data = await res.json();
    const deptSelect = document.getElementById("dept_id");
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    data.forEach(d => {
      deptSelect.innerHTML += `<option value="${d.dept_id}">${d.dept_name}</option>`;
    });
  } catch (err) { console.error("Error loading departments:", err); }
}

async function loadPrograms(query = "") {
  const url = `php/get_program.php?search=${encodeURIComponent(query)}&sort_by=${currentSort.column}&order=${currentSort.direction}&page=${currentPage}&limit=${rowsPerPage}`;
  
  try {
    const res = await fetch(url);
    const response = await res.json();
    const data = response.data || [];
    totalRecords = response.total_records || 0;
    programList = data;

    const tbody = document.querySelector("#programTable tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="no-data">No programs found</td></tr>`;
    } else {
      data.forEach((p) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.program_id}</td>
          <td>${p.program_code}</td>
          <td>${p.program_name}</td>
          <td>${p.dept_name}</td>
          <td>
            <button class="action-btn edit-btn" onclick='editProgram(${p.program_id})'>Edit</button>
            <button class="action-btn delete-btn" onclick='deleteProgram(${p.program_id})'>Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
    updateSortIndicators();
    renderPaginationControls();
  } catch (err) { console.error("Error loading programs:", err); }
}

function saveProgram() {
  const data = collectFormData();
  if (!data.program_code || !data.program_name || !data.dept_id) return alert("Fill all fields");

  fetch("php/add_program.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    window.closeModal();
    loadPrograms();
  });
}

function updateProgram() {
  const data = collectFormData();
  fetch("php/update_program.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    window.closeModal();
    loadPrograms(document.getElementById("search").value.trim());
  });
}

function deleteProgram(id) {
  if (!confirm("Are you sure?")) return;
  fetch("php/delete_program.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program_id: id })
  }).then(() => loadPrograms());
}

function toggleSort(column) {
  currentSort.direction = (currentSort.column === column && currentSort.direction === "asc") ? "desc" : "asc";
  currentSort.column = column;
  loadPrograms(document.getElementById("search").value.trim());
}

function updateSortIndicators() {
  document.querySelectorAll("#programTable thead th[data-column]").forEach((th) => {
    const col = th.getAttribute("data-column");
    const label = th.getAttribute("data-label") || th.textContent.replace(/ ▲| ▼| ↕/g, "").trim();
    th.setAttribute("data-label", label);
    th.innerHTML = `${label} ${col === currentSort.column ? (currentSort.direction === "asc" ? "▲" : "▼") : "↕"}`;
  });
}

function renderPaginationControls() {
  const controls = document.querySelector('.pagination-controls');
  const info = document.querySelector('.pagination-info');
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  controls.innerHTML = '';
  info.textContent = totalRecords ? `Showing ${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(currentPage * rowsPerPage, totalRecords)} of ${totalRecords} records` : "No records found.";
  if (totalPages <= 1) return;

  const createBtn = (text, target, disabled, active = false) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.disabled = disabled;
    btn.classList.add('page-button');
    if (active) btn.classList.add('active');
    btn.onclick = () => { currentPage = target; loadPrograms(document.getElementById("search").value.trim()); };
    controls.appendChild(btn);
  };
  createBtn('« Prev', currentPage - 1, currentPage === 1);
  for (let i = 1; i <= totalPages; i++) createBtn(i, i, i === currentPage, i === currentPage);
  createBtn('Next »', currentPage + 1, currentPage === totalPages);
}

function collectFormData() {
  return {
    program_id: document.getElementById("program_id").value,
    program_code: document.getElementById("program_code").value.trim(),
    program_name: document.getElementById("program_name").value.trim(),
    dept_id: document.getElementById("dept_id").value
  };
}

function clearForm() {
  ["program_id", "program_code", "program_name", "dept_id"].forEach(id => document.getElementById(id).value = "");
}

function exportExcel() { window.location.href = "php/export_excel.php"; }
function exportPDF() { window.location.href = "php/export_pdf.php"; }