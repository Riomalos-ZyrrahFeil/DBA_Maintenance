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
    units: document.getElementById("units")
  };

  // Load all courses
  function loadCourses() {
    fetch('php/get_course.php')
      .then(res => res.json())
      .then(data => {
        courseTableBody.innerHTML = '';
        data.forEach(course => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${course.course_id}</td>
            <td>${course.course_code}</td>
            <td>${course.title}</td>
            <td>${course.lecture_hours}</td>
            <td>${course.lab_hours}</td>
            <td>${course.units}</td>
            <td class="actions">
              <button class="editBtn" data-id="${course.course_id}">Edit</button>
              <button class="deleteBtn" data-id="${course.course_id}">Delete</button>
            </td>
          `;
          courseTableBody.appendChild(tr);
        });

        attachRowEvents();
      })
      .catch(err => console.error(err));
  }

  function attachRowEvents() {
    document.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        fetch(`php/get_course.php?id=${id}`)
          .then(res => res.json())
          .then(course => {
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

    document.querySelectorAll(".deleteBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this course?")) {
          fetch(`php/delete_course.php?id=${id}`, { method: "DELETE" })
            .then(res => res.json())
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
      .then(res => res.json())
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
      .then(res => res.json())
      .then(() => {
        clearForm();
        loadCourses();
      });
  });

  cancelBtn.addEventListener("click", clearForm);

  function clearForm() {
    Object.values(courseFormFields).forEach(field => field.value = '');
    saveBtn.style.display = "inline-block";
    updateBtn.style.display = "none";
    cancelBtn.style.display = "none";
  }

  // Search functionality
  searchInput.addEventListener("keyup", () => {
    const filter = searchInput.value.toLowerCase();
    document.querySelectorAll("#courseTable tbody tr").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(filter) ? "" : "none";
    });
  });

  // Load initial data
  loadCourses();
});
