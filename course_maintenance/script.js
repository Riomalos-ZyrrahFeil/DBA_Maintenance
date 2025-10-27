let courseList = [];
let currentSort = { column: "course_id", direction: "asc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalPages = 1;
let totalRecords = 0;

document.addEventListener("DOMContentLoaded", () => {
  const courseTableBody = document.querySelector("#courseTable tbody");
  const searchInput = document.getElementById("search");
  
  const paginationControlsContainer = document.querySelector('.pagination-controls');
  const paginationInfoContainer = document.querySelector('.pagination-info');

  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  const courseFormFields = {
    course_id: document.getElementById("course_id"),
    course_code: document.getElementById("course_code"),
    title: document.getElementById("title"),
    lecture_hours: document.getElementById("lecture_hours"),
    lab_hours: document.getElementById("lab_hours"),
    units: document.getElementById("units"),
  };

  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`❌ Fetch error for ${url}:`, err);
      // Return structured empty response for list fetches
      if (url.includes('get_course.php') && !url.includes('id=')) {
        return { data: [], total_records: 0 };
      }
      return [];
    }
  }

  async function loadCourses(query = "") {
    const sortBy = currentSort.column;
    const order = currentSort.direction;
    const page = currentPage;
    const limit = rowsPerPage;

    try {
      const url = `php/get_course.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}&page=${page}&limit=${limit}`;
      
      const response = await fetchJSON(url);
      const data = response.data || [];
      totalRecords = response.total_records || 0;
      
      courseList = data;
      courseTableBody.innerHTML = "";
      totalPages = Math.ceil(totalRecords / rowsPerPage);
      
      if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
        return loadCourses(query);
      }
      if (currentPage === 0 && totalRecords > 0) {
        currentPage = 1;
      }


      if (!Array.isArray(data) || data.length === 0) {
        courseTableBody.innerHTML = `<tr><td colspan="7" class="no-data">No courses found</td></tr>`;
      } else {
        data.forEach((course) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${course.course_id}</td>
            <td>${course.course_code}</td>
            <td>${course.title}</td>
            <td>${course.lecture_hours}</td>
            <td>${course.lab_hours}</td>
            <td>${course.units}</td>
            <td class="actions">
              <button class="action-btn edit-btn" data-id="${course.course_id}">Edit</button>
              <button class="action-btn delete-btn" data-id="${course.course_id}">Delete</button>
            </td>
          `;
          courseTableBody.appendChild(tr);
        });
      }

      attachRowEvents();
      updateSortIndicators();
      renderPaginationControls();

    } catch (err) {
      console.error("Error loading courses:", err);
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
          loadCourses(searchInput.value.trim());
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
        loadCourses(searchInput.value.trim());
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
        loadCourses(searchInput.value.trim());
      }
    };
    paginationControlsContainer.appendChild(nextBtn);
  }

  function toggleSort(column) {
    if (currentSort.column === column) {
      currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
    } else {
      currentSort.column = column;
      currentSort.direction = "asc";
    }
    currentPage = 1;
    const searchValue = searchInput.value.trim();
    loadCourses(searchValue);
  }

  function updateSortIndicators() {
    document.querySelectorAll("#courseTable thead th[data-column]").forEach((th) => {
      const col = th.getAttribute("data-column");
      const isActive = col === currentSort.column;
      let label = th.getAttribute("data-label") || th.textContent.replace(/ ▲| ▼| ↕/g, "").trim();
      th.setAttribute("data-label", label);

      if (isActive) {
          th.innerHTML = `${label} ${currentSort.direction === "asc" ? "▲" : "▼"}`;
      } else {
          th.innerHTML = `${label} ↕`;
      }
    });
  }

  function attachRowEvents() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        try {
          const course = await fetchJSON(`php/get_course.php?id=${id}`); 
          if (course) {
            courseFormFields.course_id.value = course.course_id;
            courseFormFields.course_code.value = course.course_code;
            courseFormFields.title.value = course.title;
            courseFormFields.lecture_hours.value = course.lecture_hours;
            courseFormFields.lab_hours.value = course.lab_hours;
            courseFormFields.units.value = course.units;

            saveBtn.style.display = "none";
            updateBtn.style.display = "inline-block";
            cancelBtn.style.display = "inline-block";
            }
        } catch (err) {
          console.error("Error fetching course for edit:", err);
        }
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        deleteCourse(id);
      });
    });
  }

  function deleteCourse(id) {
    if (!confirm("Are you sure you want to delete this course?")) return;

    fetch(`php/delete_course.php?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.status === "success") {
          if (courseList.length === 1 && currentPage > 1) {
            currentPage--;
          }
          loadCourses(searchInput.value.trim());
        }
      })
      .catch((err) => {
        alert("❌ Error deleting course: " + err.message);
      });
  }

  saveBtn.addEventListener("click", () => {
    const formData = new FormData();
    formData.append("course_code", courseFormFields.course_code.value);
    formData.append("title", courseFormFields.title.value);
    formData.append("lecture_hours", courseFormFields.lecture_hours.value);
    formData.append("lab_hours", courseFormFields.lab_hours.value);
    formData.append("units", courseFormFields.units.value);

    fetch("php/add_course.php", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.status === "success") {
          clearForm();
          currentPage = 1;
          loadCourses();
        }
      })
      .catch((err) => console.error("Error:", err));
  });

  updateBtn.addEventListener("click", () => {
    const formData = new FormData();
    formData.append("course_id", courseFormFields.course_id.value);
    formData.append("course_code", courseFormFields.course_code.value);
    formData.append("title", courseFormFields.title.value);
    formData.append("lecture_hours", courseFormFields.lecture_hours.value);
    formData.append("lab_hours", courseFormFields.lab_hours.value);
    formData.append("units", courseFormFields.units.value);

    fetch("php/update_course.php", {
      method: "POST",
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.status === "success") {
          loadCourses(searchInput.value.trim()); 
          clearForm();
        }
      })
      .catch((err) => console.error("Error:", err));
  });

  cancelBtn.addEventListener("click", clearForm);

  function clearForm() {
    Object.values(courseFormFields).forEach((field) => (field.value = ""));
    saveBtn.style.display = "inline-block";
    updateBtn.style.display = "none";
    cancelBtn.style.display = "inline-block";
  }

  searchInput.addEventListener("keyup", () => {
    currentPage = 1;
    loadCourses(searchInput.value.trim());
  });

  document.querySelectorAll("#courseTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });

  loadCourses();
});

function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}