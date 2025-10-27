let roomList = [];
let currentSort = { column: "room_id", direction: "desc" };
let currentPage = 1;
const rowsPerPage = 10;
let totalPages = 1;
let totalRecords = 0;


document.addEventListener("DOMContentLoaded", () => {
  loadRooms();

  const searchInput = document.getElementById("search");
  searchInput.addEventListener("keyup", searchRooms);

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "none";

  const paginationControlsContainer = document.querySelector('.pagination-controls');
  const paginationInfoContainer = document.querySelector('.pagination-info');

  document.querySelectorAll("#roomTable thead th[data-column]").forEach((th) => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      toggleSort(column);
    });
  });

  // Save Room
  document.getElementById("saveBtn").addEventListener("click", saveRoom);

  // Update Room
  document.getElementById("updateBtn").addEventListener("click", updateRoom);

  // Cancel edit
  document.getElementById("cancelBtn").addEventListener("click", cancelEdit);
});

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (url.includes('get_room.php') && !url.includes('room_id=')) {
        return data;
    }
    return data;
} catch (err) {
    console.error(`❌ Fetch error for ${url}:`, err);
    if (url.includes('get_room.php') && !url.includes('room_id=')) {
        return { data: [], total_records: 0 };
    }
    return [];
  }
}

async function loadRooms(query = "") {
  const sortBy = currentSort.column || "room_id";
  const order = currentSort.direction || "asc";
  const page = currentPage;
  const limit = rowsPerPage;

  try {
    const url = `php/get_room.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}&page=${page}&limit=${limit}`;
    const response = await fetchJSON(url);

    const data = response.data || [];
    totalRecords = response.total_records || 0;

    roomList = data;
    const tbody = document.querySelector("#roomTable tbody");
    tbody.innerHTML = "";
    totalPages = Math.ceil(totalRecords / rowsPerPage);

    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
      return loadRooms(query);
    }
    if (currentPage === 0 && totalRecords > 0) {
      currentPage = 1;
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="no-data">No rooms found</td></tr>`;
    } else {
      data.forEach((room) => {
        tbody.innerHTML += `
          <tr>
            <td>${room.room_id}</td>
            <td>${room.room_code}</td>
            <td>${room.capacity}</td>
            <td>${room.building}</td>
            <td>
              <button class="action-btn edit-btn" onclick='editRoom(${JSON.stringify(room)})'>Edit</button>
              <button class="action-btn delete-btn" onclick='deleteRoom(${room.room_id})'>🗑 Delete</button>
            </td>
          </tr>
        `;
      });
    }

    updateSortIndicators();
    renderPaginationControls();
  } catch (err) {
      console.error("Error loading rooms:", err);
  }
}

function renderPaginationControls() {
  const paginationControlsContainer = document.querySelector('.pagination-controls');
  const paginationInfoContainer = document.querySelector('.pagination-info');

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
      loadRooms(document.getElementById("search").value.trim());
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
          loadRooms(document.getElementById("search").value.trim());
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
      loadRooms(document.getElementById("search").value.trim());
    }
  };
  paginationControlsContainer.appendChild(nextBtn);
}

function saveRoom() {
  const room_code = document.getElementById("room_code").value.trim();
  const capacity = document.getElementById("capacity").value.trim();
  const building = document.getElementById("building").value.trim();

  if (!room_code || !capacity || !building) {
    alert("Please fill in all fields.");
    return;
  }

  fetch("php/add_room.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code, capacity, building }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      clearForm();
      currentPage = 1;
      loadRooms();
    })
    .catch(err => console.error("Error saving room:", err));
}

function updateRoom() {
  const room_id = document.getElementById("room_id").value;
  const room_code = document.getElementById("room_code").value.trim();
  const capacity = document.getElementById("capacity").value.trim();
  const building = document.getElementById("building").value.trim();

  if (!room_id) {
    alert("No room selected for update.");
    return;
  }

  fetch("php/update_room.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_id, room_code, capacity, building }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      clearForm();
      loadRooms(document.getElementById("search").value.trim());
    })
    .catch(err => console.error("Error updating room:", err));
}

function editRoom(room) {
  document.getElementById("room_id").value = room.room_id;
  document.getElementById("room_code").value = room.room_code;
  document.getElementById("capacity").value = room.capacity;
  document.getElementById("building").value = room.building;

  document.getElementById("updateBtn").style.display = "inline-block";
  document.getElementById("saveBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "inline-block";
}

function deleteRoom(id) {
  if (!confirm("Are you sure you want to delete this room?")) return;

  fetch("php/delete_room.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_id: id }),
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      if (roomList.length === 1 && currentPage > 1) {
        currentPage--;
      }
      loadRooms(document.getElementById("search").value.trim());
    })
    .catch(err => console.error("Error deleting room:", err));
}

function cancelEdit() {
  clearForm();
}

function clearForm() {
  document.getElementById("room_id").value = "";
  document.getElementById("room_code").value = "";
  document.getElementById("capacity").value = "";
  document.getElementById("building").value = "";

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("cancelBtn").style.display = "none";
}

function toggleSort(column) {
  if (currentSort.column === column) {
    currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.direction = "asc";
  }

  currentPage = 1;
  const query = document.getElementById("search").value.trim();
  loadRooms(query);
}

function updateSortIndicators() {
  document.querySelectorAll("#roomTable thead th[data-column]").forEach((th) => {
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

function searchRooms(e) {
  currentPage = 1;
  const query = e.target.value.trim();
  loadRooms(query);
}

// Optional: Export functions
function exportExcel() {
  window.location.href = "php/export_excel.php";
}

function exportPDF() {
  window.location.href = "php/export_pdf.php";
}