document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("saveBtn");
  const updateBtn = document.getElementById("updateBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const searchInput = document.getElementById("search");

  loadRooms();

  saveBtn.style.display = "inline-block";
  updateBtn.style.display = "none";
  cancelBtn.style.display = "none";

  // Save Room
  saveBtn.addEventListener("click", () => {
    const room_code = document.getElementById("room_code").value;
    const capacity = document.getElementById("capacity").value;
    const building = document.getElementById("building").value;

    fetch("php/add_room.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `room_code=${room_code}&capacity=${capacity}&building=${building}`
    }).then(res => res.json())
      .then(data => {
        alert(data.message);
        clearForm();
        loadRooms();
      });
  });

  // Update Room
  updateBtn.addEventListener("click", () => {
    const room_id = document.getElementById("room_id").value;
    const room_code = document.getElementById("room_code").value;
    const capacity = document.getElementById("capacity").value;
    const building = document.getElementById("building").value;

    fetch("php/update_room.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `room_id=${room_id}&room_code=${room_code}&capacity=${capacity}&building=${building}`
    }).then(res => res.json())
      .then(data => {
        alert(data.message);
        clearForm();
        loadRooms();
      });
  });

  cancelBtn.addEventListener("click", clearForm);

  // Search functionality
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#roomTable tbody tr");
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(filter) ? "" : "none";
    });
  });
});

// Load rooms
function loadRooms() {
  fetch("php/get_room.php")
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#roomTable tbody");
      tbody.innerHTML = "";
      data.forEach(room => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${room.room_id}</td>
          <td>${room.room_code}</td>
          <td>${room.capacity}</td>
          <td>${room.building}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editRoom(${room.room_id})">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteRoom(${room.room_id})">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function editRoom(id) {
  fetch(`php/get_room.php?room_id=${id}`)
    .then(res => res.json())
    .then(room => {
      document.getElementById("room_id").value = room.room_id;
      document.getElementById("room_code").value = room.room_code;
      document.getElementById("capacity").value = room.capacity;
      document.getElementById("building").value = room.building;

      document.getElementById("saveBtn").style.display = "none";
      document.getElementById("updateBtn").style.display = "inline-block";
      document.getElementById("cancelBtn").style.display = "inline-block";
    });
}

function deleteRoom(id) {
  if (!confirm("Are you sure you want to delete this room?")) return;

  fetch(`php/delete_room.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `room_id=${id}`
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadRooms();
  });
}

function clearForm() {
  document.getElementById("room_id").value = "";
  document.getElementById("room_code").value = "";
  document.getElementById("capacity").value = "";
  document.getElementById("building").value = "";

  document.getElementById("saveBtn").style.display = "inline-block";
  document.getElementById("updateBtn").style.display = "none";
  document.getElementById("cancelBtn").style.display = "none";
}
