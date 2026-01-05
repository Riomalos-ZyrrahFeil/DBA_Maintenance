<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'faculty') {
  header("Location: ../index.php");
  exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Department Maintenance - PUP</title>
  <link rel="stylesheet" href="../dashboard.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dash-main-wrapper">
    <?php include('../component/sidebar.php'); ?>

    <main class="main-content">
      <div class="container">
        <header class="content-header">
          <h1>Department Maintenance</h1>
          <button id="addBtn" class="primary-btn">+ Add New Department</button>
        </header>

        <div class="table-header">
          <div class="search-container">
            <input type="text" id="search" placeholder="Search Department...">
          </div>
          <div class="export-buttons">
            <button onclick="exportExcel()">Export Excel</button>
            <button onclick="exportPDF()">Export PDF</button>
          </div>
        </div>

        <div class="table-container card">
          <table id="departmentTable">
            <thead>
              <tr>
                <th data-column="dept_id">ID ↕</th>
                <th data-column="dept_code">Department Code ↕</th>
                <th data-column="dept_name">Department Name ↕</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="termTableBody"></tbody>
          </table>
          <div class="pagination-component">
            <div class="pagination-info"></div>
            <div class="pagination-controls"></div>
          </div>
        </div>

        <div id="formModal" class="modal">
          <div class="modal-content card">
            <span class="close-modal">&times;</span>
            <h2 id="modalTitle">Add New Department</h2>
            <hr>
            <div class="form-grid">
              <input type="hidden" id="department_id">
              <div class="form-row">
                <label for="department_code">Department Code</label>
                <input type="text" id="department_code" placeholder="Enter Department Code">
              </div>
              <div class="form-row">
                <label for="department_name">Department Name</label>
                <input type="text" id="department_name" placeholder="Enter Department Name">
              </div>
            </div>
            <div class="form-buttons">
              <button id="saveBtn">Save Department</button>
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