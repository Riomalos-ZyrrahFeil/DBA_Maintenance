let programList = [];
let departmentList = [];
let currentSort = { column: "program_id", direction: "desc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalPages = 1;
let totalRecords = 0;


document.addEventListener("DOMContentLoaded", () => {
  loadDepartments();
  loadPrograms();

  document.getElementById("search").addEventListener("keyup", searchPrograms);
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "none";

  const paginationControlsContainer = document.querySelector('.pagination-controls');
  const paginationInfoContainer = document.querySelector('.pagination-info');

  document.querySelectorAll("#programTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });

  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (url.includes('get_program.php') && !url.includes('id=')) {
        return data;
      }
      return data;
    } catch (err) {
      console.error(`❌ Fetch error for ${url}:`, err);
      if (url.includes('get_program.php') && !url.includes('id=')) {
        return { data: [], total_records: 0 };
      }
      return [];
    }
  }

  async function loadDepartments() {
    try {
      const data = await fetchJSON("../department_maintenance/php/fetch_department.php");
      departmentList = data;

      const deptSelect = document.getElementById("dept_id");
      deptSelect.innerHTML = '<option value="">Select Department</option>';
      data.forEach(d => {
        deptSelect.innerHTML += `<option value="${d.dept_id}">${d.dept_name}</option>`;
      });
    } catch (err) {
      console.error("Error loading departments:", err);
    }
  }

  async function loadPrograms(query = "") {
    const sortBy = currentSort.column || "program_id";
    const order = currentSort.direction || "desc";
    const page = currentPage;
    const limit = rowsPerPage;

    try {
      const url = `php/get_program.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}&page=${page}&limit=${limit}`;
      const response = await fetchJSON(url);

      const data = response.data || [];
      totalRecords = response.total_records || 0;
      
      programList = data;
      const tbody = document.querySelector("#programTable tbody");
      tbody.innerHTML = "";
      totalPages = Math.ceil(totalRecords / rowsPerPage);

      if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
        return loadPrograms(query);
      }
      if (currentPage === 0 && totalRecords > 0) {
        currentPage = 1;
      }


      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data">No programs found</td></tr>`;
      } else {
        data.forEach((p) => {
          tbody.innerHTML += `
            <tr>
              <td>${p.program_id}</td>
              <td>${p.program_code}</td>
              <td>${p.program_name}</td>
              <td>${p.dept_name}</td>
              <td>
                <button class="action-btn edit-btn" onclick='editProgram(${p.program_id})'>Edit</button>
                <button class="action-btn delete-btn" onclick='deleteProgram(${p.program_id})'>Delete</button>
              </td>
            </tr>
          `;
        });
      }

      updateSortIndicators();
      renderPaginationControls();

    } catch (err) {
      console.error("Error loading programs:", err);
    }
  }
  
  function renderPaginationControls() {
    paginationControlsContainer.innerHTML = '';
    paginationInfoContainer.innerHTML = '';
    
    if (totalRecords === 0) {
      paginationInfoContainer.textContent = "No records found.";
      return;
    }

    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalRecords);
    
    paginationInfoContainer.textContent = `Showing ${start} to ${end} of ${totalRecords} records (Page ${currentPage} of ${totalPages})`;

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '« Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.classList.add('page-button', 'prev-next-btn');
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        loadPrograms(document.getElementById("search").value.trim());
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
      }
      numBtn.onclick = () => {
        currentPage = i;
        loadPrograms(document.getElementById("search").value.trim());
      };
      paginationControlsContainer.appendChild(numBtn);
    }
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next »';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.classList.add('page-button', 'prev-next-btn');
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        loadPrograms(document.getElementById("search").value.trim());
      }
    };
    paginationControlsContainer.appendChild(nextBtn);
  }
  
  function searchPrograms(e) {
    currentPage = 1;
    const query = e.target ? e.target.value.trim() : e;
    loadPrograms(query);
  }

  window.saveProgram = function() {
    const data = collectFormData();
    if (!data.program_code || !data.program_name || !data.dept_id) {
      alert("Please fill out all fields!");
      return;
    }

    fetch("php/add_program.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(msg => {
        alert(msg.message);
        clearForm();
        currentPage = 1;
        loadPrograms();
      })
      .catch(err => console.error("Error saving program:", err));
  }

  window.updateProgram = function() {
    const data = collectFormData();
    if (!data.program_id) {
      alert("No program selected for update.");
      return;
    }

    fetch("php/update_program.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(msg => {
        alert(msg.message);
        clearForm();
        loadPrograms(document.getElementById("search").value.trim()); 
      })
      .catch(err => console.error("Error updating program:", err));
  }

  window.deleteProgram = function(id) {
    if (!confirm("Are you sure you want to delete this program?")) return;

    fetch("php/delete_program.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program_id: id })
    })
      .then(res => res.json())
      .then(msg => {
        alert(msg.message);
        if (programList.length === 1 && currentPage > 1) {
          currentPage--;
        }
        loadPrograms(document.getElementById("search").value.trim());
      })
      .catch(err => console.error("Error deleting program:", err));
  }

  function toggleSort(column) {
    if (currentSort.column === column) {
      currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
    } else {
      currentSort.column = column;
      currentSort.direction = "desc";
    }
    currentPage = 1;
    const searchValue = document.getElementById("search").value.trim();
    loadPrograms(searchValue);
  }
  
  function updateSortIndicators() {
    document.querySelectorAll("#programTable thead th[data-column]").forEach((th) => {
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

  window.editProgram = function(id) {
    const p = programList.find(pr => pr.program_id == id);
    if (!p) return;

    document.getElementById("program_id").value = p.program_id;
    document.getElementById("program_code").value = p.program_code;
    document.getElementById("program_name").value = p.program_name;
    document.getElementById("dept_id").value = p.dept_id;

    document.getElementById("updateBtn").style.display = "inline-block";
    document.getElementById("saveBtn").style.display = "none";
    document.getElementById("cancelBtn").style.display = "inline-block";
  }

  window.collectFormData = function() {
    return {
      program_id: document.getElementById("program_id").value,
      program_code: document.getElementById("program_code").value.trim(),
      program_name: document.getElementById("program_name").value.trim(),
      dept_id: document.getElementById("dept_id").value
    };
  }

  window.clearForm = function() {
    document.getElementById("program_id").value = "";
    document.getElementById("program_code").value = "";
    document.getElementById("program_name").value = "";
    document.getElementById("dept_id").value = "";

    document.getElementById("updateBtn").style.display = "none";
    document.getElementById("saveBtn").style.display = "inline-block";
    document.getElementById("cancelBtn").style.display = "none";
  }

  window.cancelEdit = function() {
    clearForm();
  }

  window.exportExcel = function() {
    window.location.href = "php/export_excel.php";
  }

  window.exportPDF = function() {
    window.location.href = "php/export_pdf.php";
  }
});