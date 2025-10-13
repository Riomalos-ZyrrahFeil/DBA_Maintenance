let roomList = [];
let currentSort = { column: "room_id", direction: "desc" }; // default sorting is descending

document.addEventListener("DOMContentLoaded", () => {
  loadRooms();

  const searchInput = document.getElementById("search");
  searchInput.addEventListener("keyup", searchRooms);

  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("saveBtn").style.display = "inline-block";

  // Sorting headers
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

// Load rooms with optional search
async function loadRooms(query = "") {
  const sortBy = currentSort.column || "room_id";
  const order = currentSort.direction || "asc";

  try {
    const res = await fetch(
      `php/get_room.php?search=${encodeURIComponent(query)}&sort_by=${sortBy}&order=${order}`
    );
    const data = await res.json();

    roomList = data;
    const tbody = document.querySelector("#roomTable tbody");
    tbody.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="no-data">No rooms found</td></tr>`;
      updateSortIndicators();
      return;
    }

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

    updateSortIndicators();
  } catch (err) {
    console.error("Error loading rooms:", err);
  }
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
      loadRooms();
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
      loadRooms();
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
