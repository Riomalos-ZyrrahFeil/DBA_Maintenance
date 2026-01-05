let departmentList = [];
let currentSort = { column: "dept_id", direction: "asc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalPages = 1;
let totalRecords = 0;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("formModal");
  const addBtn = document.getElementById("addBtn");
  const closeBtn = document.querySelector(".close-modal");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const modalTitle = document.getElementById("modalTitle");

  const deptFields = {
      id: document.getElementById("department_id"),
      code: document.getElementById("department_code"),
      name: document.getElementById("department_name")
  };

  loadDepartments();

  const openModal = (title = "Add New Department") => {
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
          openModal("Add New Department");
          saveBtn.style.display = "inline-block";
          updateBtn.style.display = "none";
      };
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  window.onclick = (e) => { if (e.target === modal) closeModal(); };

  document.getElementById("search").addEventListener("keyup", (e) => {
      currentPage = 1;
      loadDepartments(e.target.value.trim());
  });

  saveBtn.onclick = saveDepartment;
  updateBtn.onclick = updateDepartment;

  document.getElementById("search").addEventListener("keyup", searchDepartments);
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "none";

  // Handle header click for sorting
  document.querySelectorAll("#departmentTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });

  window.editDepartment = (dept) => {
        deptFields.id.value = dept.dept_id;
        deptFields.code.value = dept.dept_code;
        deptFields.name.value = dept.dept_name;

        saveBtn.style.display = "none";
        updateBtn.style.display = "inline-block";
        openModal("Edit Department");
    };

    window.closeModal = closeModal;
});

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (url.includes('get_department.php')) {
      return data;
    }
    return data;
  } catch (err) {
    console.error(`❌ Fetch error for ${url}:`, err);
    if (url.includes('get_department.php')) {
      return { data: [], total_records: 0 };
    }
    return [];
  }
}

async function loadDepartments(query = "") {
  const sortBy = currentSort.column || "dept_id";
  const order = currentSort.direction || "asc";
  const page = currentPage;
  const limit = rowsPerPage;

  try {
    const url = `php/get_department.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}&page=${page}&limit=${limit}`;
    const response = await fetchJSON(url);

    const data = response.data || [];
    totalRecords = response.total_records || 0;

    departmentList = data;
    const tbody = document.querySelector("#departmentTable tbody");
    tbody.innerHTML = "";
    totalPages = Math.ceil(totalRecords / rowsPerPage);

    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
      return loadDepartments(query);
    }
    if (currentPage === 0 && totalRecords > 0) {
      currentPage = 1;
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="no-data">No departments found</td></tr>`;
    } else {
      data.forEach((dept) => {
        tbody.innerHTML += `
          <tr>
            <td>${dept.dept_id}</td>
            <td>${dept.dept_code}</td>
            <td>${dept.dept_name}</td>
            <td>
              <button class="action-btn edit-btn" onclick='editDepartment(${JSON.stringify(dept)})'>Edit</button>
              <button class="action-btn delete-btn" onclick='deleteDepartment(${dept.dept_id})'>🗑 Delete</button>
            </td>
          </tr>
        `;
      });
    }

    updateSortIndicators();
    renderPaginationControls();
  } catch (err) {
    console.error("Error loading departments:", err);
  }
}

function renderPaginationControls() {
  const paginationControlsContainer = document.querySelector('.pagination-controls');
  const paginationInfoContainer = document.querySelector('.pagination-info');
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  paginationControlsContainer.innerHTML = '';
  paginationInfoContainer.innerHTML = '';
  
  if (totalRecords === 0) {
    paginationInfoContainer.textContent = "No records found.";
    return;
  }

  const start = (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, totalRecords);
  
  paginationInfoContainer.textContent = `Showing ${start} to ${end} of ${totalRecords} records (Page ${currentPage} of ${totalPages})`;

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '« Previous';
  prevBtn.disabled = currentPage === 1;
  prevBtn.classList.add('page-button');
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadDepartments(document.getElementById("search").value.trim());
    }
  };
  paginationControlsContainer.appendChild(prevBtn);

  const maxButtonsToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

  if (endPage - startPage + 1 < maxButtonsToShow) {
    startPage = Math.max(1, endPage - maxButtonsToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const numBtn = document.createElement('button');
    numBtn.textContent = i;
    numBtn.classList.add('page-button');
    if (i === currentPage) {
      numBtn.classList.add('active');
      numBtn.disabled = true;
    }
    numBtn.onclick = () => {
      currentPage = i;
      loadDepartments(document.getElementById("search").value.trim());
    };
    paginationControlsContainer.appendChild(numBtn);
  }
  
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next »';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.classList.add('page-button');
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadDepartments(document.getElementById("search").value.trim());
    }
  };
  paginationControlsContainer.appendChild(nextBtn);
}


function saveDepartment() {
  const code = document.getElementById("department_code").value.trim();
  const name = document.getElementById("department_name").value.trim();

  if (!code || !name) {
    alert("Please fill in all fields.");
    return;
  }

  fetch("php/add_department.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dept_code: code, dept_name: name }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      clearForm();
      currentPage = 1;
      loadDepartments();
    })
    .catch(err => console.error("Error saving department:", err));
}

function updateDepartment() {
  const id = document.getElementById("department_id").value;
  const code = document.getElementById("department_code").value.trim();
  const name = document.getElementById("department_name").value.trim();

  if (!id) {
    alert("No department selected for update.");
    return;
  }

  fetch("php/update_department.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dept_id: id, dept_code: code, dept_name: name }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      clearForm();
      loadDepartments(document.getElementById("search").value.trim());
    })
    .catch(err => console.error("Error updating department:", err));
}

function editDepartment(dept) {
  document.getElementById("department_id").value = dept.dept_id;
  document.getElementById("department_code").value = dept.dept_code;
  document.getElementById("department_name").value = dept.dept_name;

  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

function deleteDepartment(id) {
  if (!confirm("Are you sure you want to delete this department?")) return;

  fetch("php/delete_department.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dept_id: id }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      if (departmentList.length === 1 && currentPage > 1) {
          currentPage--;
      }
      loadDepartments(document.getElementById("search").value.trim());
    })
    .catch(err => console.error("Error deleting department:", err));
}

function toggleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }

  currentPage = 1;
  const searchValue = document.getElementById("search").value.trim();
  loadDepartments(searchValue);
}

function updateSortIndicators() {
  document.querySelectorAll("#departmentTable thead th[data-column]").forEach((th) => {
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

function searchDepartments(e) {
  currentPage = 1;
  const query = e.target.value.trim();
  loadDepartments(query);
}

function clearForm() {
  document.getElementById("department_id").value = "";
  document.getElementById("department_code").value = "";
  document.getElementById("department_name").value = "";

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "none";
}

function cancelEdit() {
  clearForm();
}

function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}