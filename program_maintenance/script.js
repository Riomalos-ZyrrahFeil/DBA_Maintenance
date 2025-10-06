document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const search = document.getElementById("search");
  const deptSelect = document.getElementById("dept_id");
  const programTable = document.querySelector("#programTable tbody");

  let programList = [];
  let departmentList = [];

  // Load departments first
  fetchDepartments().then(() => {
    fetchPrograms();
  });

  saveBtn.addEventListener("click", addProgram);
  updateBtn.addEventListener("click", updateProgram);
  cancelBtn.addEventListener("click", resetForm);
  search.addEventListener("input", () => fetchPrograms(search.value.trim()));

  document.getElementById("exportExcel").addEventListener("click", () => {
    window.location.href = "php/export_excel.php";
  });
  document.getElementById("exportPDF").addEventListener("click", () => {
    window.location.href = "php/export_pdf.php";
  });

  // ==================== FETCH DEPARTMENTS ====================
  async function fetchDepartments() {
    try {
      const res = await fetch("../department_maintenance/php/fetch_department.php");
      const data = await res.json();
      departmentList = data;

      deptSelect.innerHTML = '<option value="">Select Department</option>';
      data.forEach(d => {
        deptSelect.innerHTML += `<option value="${d.dept_id}">${d.dept_name}</option>`;
      });
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  }

  // ==================== FETCH PROGRAMS ====================
  async function fetchPrograms(query = "") {
    try {
      const res = await fetch(`php/get_program.php?search=${query}`);
      const data = await res.json();
      programList = data;

      programTable.innerHTML = "";
      data.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${p.program_id}</td>
          <td>${p.program_code}</td>
          <td>${p.program_name}</td>
          <td>${p.dept_name}</td>
          <td>
            <button class="edit-btn">✏️ Edit</button>
            <button class="delete-btn">🗑 Delete</button>
          </td>
        `;
        const editBtn = tr.querySelector(".edit-btn");
        editBtn.addEventListener("click", () => editProgram(p));

        const deleteBtn = tr.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => deleteProgram(p.program_id));

        programTable.appendChild(tr);
      });
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  }

  // ==================== EDIT PROGRAM ====================
  function editProgram(p) {
    document.getElementById("program_id").value = p.program_id;
    document.getElementById("program_code").value = p.program_code;
    document.getElementById("program_name").value = p.program_name;
    document.getElementById("dept_id").value = p.dept_id;

    saveBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
    cancelBtn.style.display = "inline-block";
  }

  // ==================== DELETE PROGRAM ====================
  function deleteProgram(id) {
    if (!confirm("Are you sure you want to delete this program?")) return;

    fetch("php/delete_program.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
      .then(res => res.json())
      .then(res => {
        alert(res.message);
        fetchPrograms();
      })
      .catch(err => console.error("Error deleting program:", err));
  }

  // ==================== ADD PROGRAM ====================
  function addProgram() {
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
      .then(res => {
        alert(res.message);
        fetchPrograms();
        resetForm();
      })
      .catch(err => console.error("Error adding program:", err));
  }

  // ==================== UPDATE PROGRAM ====================
  function updateProgram() {
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
      .then(res => {
        alert(res.message);
        fetchPrograms();
        resetForm();
      })
      .catch(err => console.error("Error updating program:", err));
  }

  // ==================== RESET FORM ====================
  function resetForm() {
    document.getElementById("program_id").value = "";
    document.getElementById("program_code").value = "";
    document.getElementById("program_name").value = "";
    document.getElementById("dept_id").value = "";

    saveBtn.style.display = "inline-block";
    updateBtn.style.display = "none";
    cancelBtn.style.display = "none";
  }

  // ==================== COLLECT FORM DATA ====================
  function collectFormData() {
    return {
      program_id: document.getElementById("program_id").value,
      program_code: document.getElementById("program_code").value.trim(),
      program_name: document.getElementById("program_name").value.trim(),
      dept_id: document.getElementById("dept_id").value
    };
  }

  // ==================== EXPORT ====================
  function exportExcel() {
    window.location.href = "php/export_excel.php";
  }

  function exportPDF() {
    window.location.href = "php/export_pdf.php";
  }
});
