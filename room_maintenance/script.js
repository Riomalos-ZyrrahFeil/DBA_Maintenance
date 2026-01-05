let roomList = [];
let currentSort = { column: "room_id", direction: "desc" };
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

  loadRooms();

  // Modal Control Logic
  const openModal = (title = "Add New Room") => {
    modalTitle.innerText = title;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    clearForm();
  };

  // Scoped Event Listeners
  if (addBtn) {
    addBtn.onclick = () => {
      openModal("Add New Room");
      saveBtn.style.display = "inline-block";
      updateBtn.style.display = "none";
    };
  }

  if (closeBtn) closeBtn.onclick = closeModal;
  if (cancelBtn) cancelBtn.onclick = closeModal;
  window.onclick = (e) => { if (e.target === modal) closeModal(); };

  // Core Actions
  document.getElementById("search").addEventListener("keyup", (e) => {
    currentPage = 1;
    loadRooms(e.target.value.trim());
  });

  saveBtn.onclick = saveRoom;
  updateBtn.onclick = updateRoom;

  document.querySelectorAll("#roomTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => toggleSort(th.getAttribute("data-column")));
  });

  // Export Logic
  window.exportExcel = () => window.location.href = "php/export_excel.php";
  window.exportPDF = () => window.location.href = "php/export_pdf.php";

  // Global access for dynamic table buttons
  window.editRoom = (room) => {
    document.getElementById("room_id").value = room.room_id;
    document.getElementById("room_code").value = room.room_code;
    document.getElementById("capacity").value = room.capacity;
    document.getElementById("building").value = room.building;

    saveBtn.style.display = "none";
    updateBtn.style.display = "inline-block";
    openModal("Edit Room");
  };

  window.closeModal = closeModal;
});

async function loadRooms(query = "") {
  const url = `php/get_room.php?search=${encodeURIComponent(query)}&sort_by=${currentSort.column}&order=${currentSort.direction}&page=${currentPage}&limit=${rowsPerPage}`;
  
  try {
    const res = await fetch(url);
    const response = await res.json();
    const data = response.data || [];
    totalRecords = response.total_records || 0;

    const tbody = document.querySelector("#roomTable tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="no-data">No rooms found</td></tr>`;
    } else {
      data.forEach((room) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${room.room_id}</td>
          <td>${room.room_code}</td>
          <td>${room.capacity}</td>
          <td>${room.building}</td>
          <td>
            <button class="action-btn edit-btn" onclick='editRoom(${JSON.stringify(room)})'>Edit</button>
            <button class="action-btn delete-btn" onclick='deleteRoom(${room.room_id})'>Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
    updateSortIndicators();
    renderPaginationControls();
  } catch (err) { console.error("Error loading rooms:", err); }
}

function saveRoom() {
  const room_code = document.getElementById("room_code").value.trim();
  const capacity = document.getElementById("capacity").value.trim();
  const building = document.getElementById("building").value.trim();

  if (!room_code || !capacity || !building) return alert("Fill all fields");

  fetch("php/add_room.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code, capacity, building }),
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    window.closeModal();
    loadRooms();
  });
}

function updateRoom() {
  const payload = {
    room_id: document.getElementById("room_id").value,
    room_code: document.getElementById("room_code").value.trim(),
    capacity: document.getElementById("capacity").value.trim(),
    building: document.getElementById("building").value.trim()
  };

  fetch("php/update_room.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  .then(res => res.json())
  .then(msg => {
    alert(msg.message);
    window.closeModal();
    loadRooms(document.getElementById("search").value.trim());
  });
}

function deleteRoom(id) {
  if (!confirm("Delete this room?")) return;
  fetch("php/delete_room.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_id: id }),
  }).then(() => loadRooms());
}

function clearForm() {
  ["room_id", "room_code", "capacity", "building"].forEach(id => document.getElementById(id).value = "");
}

function toggleSort(column) {
  currentSort.direction = (currentSort.column === column && currentSort.direction === "asc") ? "desc" : "asc";
  currentSort.column = column;
  loadRooms(document.getElementById("search").value.trim());
}

function updateSortIndicators() {
  document.querySelectorAll("#roomTable thead th[data-column]").forEach((th) => {
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
    btn.onclick = () => { currentPage = target; loadRooms(document.getElementById("search").value.trim()); };
    controls.appendChild(btn);
  };

  createBtn('« Prev', currentPage - 1, currentPage === 1);
  for (let i = 1; i <= totalPages; i++) createBtn(i, i, i === currentPage, i === currentPage);
  createBtn('Next »', currentPage + 1, currentPage === totalPages);
}