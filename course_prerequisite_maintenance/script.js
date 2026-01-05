document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("formModal");
  const addBtn = document.getElementById("addBtn");
  const closeBtn = document.querySelector(".close-modal");
  const cancelBtn = document.getElementById("cancelBtn");
  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const modalTitle = document.getElementById("modalTitle");

  loadCourses();
  loadPrereqList();

  const openModal = (title = "Add New Prerequisite") => {
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
      openModal("Add New Prerequisite");
      saveBtn.style.display = "inline-block";
      updateBtn.style.display = "none";
    };
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  window.onclick = (e) => { if (e.target === modal) closeModal(); };

  document.getElementById("search").addEventListener("input", filterTable);
  saveBtn.onclick = addPrerequisite;
  updateBtn.onclick = updatePrerequisite;

  document.querySelectorAll('#coursePrereqTable th[data-column]').forEach(header => {
    header.addEventListener('click', () => {
      const column = header.getAttribute('data-column');
      const currentDirection = header.getAttribute('data-sort-dir') || 'asc';
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      sortTable(column, newDirection);
      header.setAttribute('data-sort-dir', newDirection);
    });
  });

  window.editPrerequisite = (id, courseId, prereqId) => {
    document.getElementById("original_prereq_id").value = id;
    document.getElementById("original_course_id").value = courseId;
    document.getElementById("course_id").value = courseId;
    document.getElementById("prereq_course_id").value = prereqId;

    saveBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
    openModal("Edit Prerequisite");
  };

  window.closeModal = closeModal;
});

async function loadCourses() {
  const res = await fetch("php/fetch_course.php");
  const data = await res.json();
  const cSel = document.getElementById("course_id");
  const pSel = document.getElementById("prereq_course_id");
  
  cSel.innerHTML = '<option value="">-- Select Course --</option>';
  pSel.innerHTML = '<option value="">-- Select Prerequisite --</option>';

  data.forEach(course => {
    const opt = `<option value="${course.course_id}">${course.course_code} - ${course.title}</option>`;
    cSel.innerHTML += opt;
    pSel.innerHTML += opt;
  });
}

function loadPrereqList() {
  fetch("php/get_prerequisites.php")
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("coursePrereqTableBody");
      tbody.innerHTML = "";
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No prerequisites found</td></tr>';
        return;
      }
      data.forEach(item => {
        tbody.innerHTML += `
          <tr>
            <td>${item.prerequisite_id}</td>
            <td>${item.course_code}</td>
            <td>${item.course_title}</td>
            <td>${item.prerequisite_code}</td>
            <td>${item.prerequisite_title}</td>
            <td class="actions">
              <button class="action-btn edit-btn" onclick="editPrerequisite(${item.prerequisite_id}, ${item.course_id}, ${item.prerequisite_course_id})">Edit</button>
              <button class="action-btn delete-btn" onclick="deletePrerequisite(${item.prerequisite_id})">Delete</button>
            </td>
          </tr>`;
      });
    });
}

function addPrerequisite() {
  const c_id = document.getElementById("course_id").value;
  const p_id = document.getElementById("prereq_course_id").value;
  if (!c_id || !p_id) return alert("Select both courses");
  if (c_id === p_id) return alert("Course cannot be its own prerequisite");

  const fd = new FormData();
  fd.append("course_id", c_id);
  fd.append("prereq_course_id", p_id);

  fetch("php/add_prerequisite.php", { method: "POST", body: fd })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        alert("Added!");
        window.closeModal();
        loadPrereqList();
      }
    });
}

function updatePrerequisite() {
  const fd = new FormData();
  fd.append("original_prereq_id", document.getElementById("original_prereq_id").value);
  fd.append("new_course_id", document.getElementById("course_id").value);
  fd.append("new_prereq_id", document.getElementById("prereq_course_id").value);

  fetch("php/update_prerequisite.php", { method: "POST", body: fd })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        alert("Updated!");
        window.closeModal();
        loadPrereqList();
      }
    });
}

function deletePrerequisite(id) {
  if (!confirm("Are you sure?")) return;
  const fd = new FormData();
  fd.append("prerequisite_id_to_delete", id);
  fetch("php/delete_prerequisite.php", { method: "POST", body: fd }).then(() => loadPrereqList());
}

function resetForm() {
  document.getElementById("course_id").selectedIndex = 0;
  document.getElementById("prereq_course_id").selectedIndex = 0;
  document.getElementById("original_course_id").value = "";
  document.getElementById("original_prereq_id").value = "";
}

function filterTable() {
  const filter = document.getElementById("search").value.toLowerCase();
  const rows = Array.from(document.querySelectorAll("#coursePrereqTableBody tr")).filter(r => !r.classList.contains("no-data"));
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
}

function exportExcel() { window.location.href = "php/export_excel.php"; }
function exportPDF() { window.location.href = "php/export_pdf.php"; }