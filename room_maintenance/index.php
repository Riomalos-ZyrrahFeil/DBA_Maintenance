<?php
session_start();
$allowed_roles = ['faculty', 'super_admin'];

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], $allowed_roles)) {
    header("Location: ../index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Room Maintenance - PUP</title>
  <link rel="stylesheet" href="../dashboard.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dash-main-wrapper">
    <?php include('../component/sidebar.php'); ?>

    <main class="main-content">
      <div class="container">
        <header class="content-header">
          <h1>Room Maintenance</h1>
          <button id="addBtn" class="primary-btn">+ Add New Room</button>
        </header>

        <div class="table-header">
          <div class="search-container">
            <input type="text" id="search" placeholder="Search Room...">
          </div>
          <div class="export-buttons">
            <button onclick="exportExcel()">Export Excel</button>
            <button onclick="exportPDF()">Export PDF</button>
          </div>
        </div>

        <div class="table-container card">
          <table id="roomTable">
            <thead>
              <tr>
                <th data-column="room_id">Room Id ↕</th>
                <th data-column="room_code">Room Code ↕</th>
                <th data-column="capacity">Capacity ↕</th>
                <th data-column="building">Building ↕</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <div class="pagination-component">
            <div class="pagination-info"></div>
            <div class="pagination-controls"></div>
          </div>
        </div>

        <div id="formModal" class="modal">
          <div class="modal-content card">
            <span class="close-modal">&times;</span>
            <h2 id="modalTitle">Add New Room</h2>
            <hr>
            <div class="form-grid">
              <input type="hidden" id="room_id">
              <div class="form-row">
                <label for="room_code">Room Code</label>
                <input type="text" id="room_code" placeholder="Enter Room Code">
              </div>
              <div class="form-row">
                <label for="capacity">Capacity</label>
                <input type="number" id="capacity" placeholder="Enter Capacity">
              </div>
              <div class="form-row">
                <label for="building">Building</label>
                <input type="text" id="building" placeholder="Enter Building">
              </div>
            </div>
            <div class="form-buttons">
              <button id="saveBtn">Save Room</button>
              <button id="updateBtn" style="display:none;">Update Changes</button>
              <button id="cancelBtn" class="secondary-btn">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>