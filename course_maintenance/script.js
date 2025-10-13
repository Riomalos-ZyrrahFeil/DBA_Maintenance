let courseList = [];
let currentSort = { column: "course_id", direction: "asc" };

document.addEventListener("DOMContentLoaded", () => {
  const courseTableBody = document.querySelector("#courseTable tbody");
  const searchInput = document.getElementById("search");

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

  // ==========================
  // Load Courses (with sorting)
  // ==========================
  async function loadCourses(query = "") {
    const sortBy = currentSort.column;
    const order = currentSort.direction;

    try {
      const res = await fetch(
        `php/get_course.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}`
      );
      const data = await res.json();
      courseList = data;

      courseTableBody.innerHTML = "";

      if (!Array.isArray(data) || data.length === 0) {
        courseTableBody.innerHTML = `<tr><td colspan="7" class="no-data">No courses found</td></tr>`;
        updateSortIndicators();
        return;
      }

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

      attachRowEvents();
      updateSortIndicators();
    } catch (err) {
      console.error("Error loading courses:", err);
    }
  }

  // ==========================
  // Sorting functions
  // ==========================
  function toggleSort(column) {
    if (currentSort.column === column) {
      currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
    } else {
      currentSort.column = column;
      currentSort.direction = "asc";
    }

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

  // ==========================
  // CRUD + UI Logic
  // ==========================
  function attachRowEvents() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        fetch(`php/get_course.php?id=${id}`)
          .then((res) => res.json())
          .then((course) => {
            courseFormFields.course_id.value = course.course_id;
            courseFormFields.course_code.value = course.course_code;
            courseFormFields.title.value = course.title;
            courseFormFields.lecture_hours.value = course.lecture_hours;
            courseFormFields.lab_hours.value = course.lab_hours;
            courseFormFields.units.value = course.units;

            saveBtn.style.display = "none";
            updateBtn.style.display = "inline-block";
            cancelBtn.style.display = "inline-block";
          });
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this course?")) {
          fetch(`php/delete_course.php?id=${id}`, { method: "DELETE" })
            .then((res) => res.json())
            .then(() => loadCourses());
        }
      });
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
      .then(() => {
        clearForm();
        loadCourses();
      });
  });

  updateBtn.addEventListener("click", () => {
    const formData = new FormData();
    formData.append("course_id", courseFormFields.course_id.value);
    formData.append("course_code", courseFormFields.course_code.value);
    formData.append("title", courseFormFields.title.value);
    formData.append("lecture_hours", courseFormFields.lecture_hours.value);
    formData.append("lab_hours", courseFormFields.lab_hours.value);
    formData.append("units", courseFormFields.units.value);

    fetch("php/update_course.php", { method: "POST", body: formData })
      .then((res) => res.json())
      .then(() => {
        clearForm();
        loadCourses();
      });
  });

  cancelBtn.addEventListener("click", clearForm);

  function clearForm() {
    Object.values(courseFormFields).forEach((field) => (field.value = ""));
    saveBtn.style.display = "inline-block";
    updateBtn.style.display = "none";
    cancelBtn.style.display = "none";
  }

  // ==========================
  // Search functionality (fixed)
  // ==========================
  searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();
    const tbody = document.querySelector("#courseTable tbody");
    const rows = Array.from(tbody.querySelectorAll("tr")).filter(
      (row) => !row.classList.contains("no-data")
    );

    let visibleCount = 0;

    rows.forEach((row) => {
      if (row.textContent.toLowerCase().includes(filter)) {
        row.style.display = "";
        visibleCount++;
      } else {
        row.style.display = "none";
      }
    });

    // Remove old message first
    const existingMsg = tbody.querySelector(".no-data");
    if (existingMsg) existingMsg.remove();

    // Show message if no matches
    if (visibleCount === 0) {
      const msgRow = document.createElement("tr");
      msgRow.classList.add("no-data");
      msgRow.innerHTML = `<td colspan="7">No courses found</td>`;
      tbody.appendChild(msgRow);
    }
  });

  // ==========================
  // Add Sorting Event Listeners
  // ==========================
  document.querySelectorAll("#courseTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });

  // ==========================
  // Initial Load
  // ==========================
  loadCourses();
});
