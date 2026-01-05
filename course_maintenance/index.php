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
  <title>Course Maintenance - PUP</title>
  <link rel="stylesheet" href="../dashboard.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="main-wrapper">
    <?php include('../component/sidebar.php'); ?>

    <main class="main-content">
      <div class="container">
        <header class="content-header">
            <h1>Course Maintenance</h1>
            <button id="addBtn" class="primary-btn">+ Add New Course</button>
        </header>

        <div class="table-header">
          <input type="text" id="search" placeholder="Search courses...">
          <div class="export-buttons">
              <button onclick="exportExcel()">Export Excel</button>
              <button onclick="exportPDF()">Export PDF</button>
          </div>
        </div>

        <div class="table-container card">
          <table id="courseTable">
            <thead>
              <tr>
                <th style="width: 10%">ID</th>
                <th style="width: 15%">Code</th>
                <th style="width: 30%">Title</th>
                <th style="width: 10%">Lec</th>
                <th style="width: 10%">Lab</th>
                <th style="width: 10%">Units</th>
                <th style="width: 15%">Actions</th>
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
            <h2 id="modalTitle">Add New Course</h2>
            <hr>
            <div class="form-grid">
              <input type="hidden" id="course_id">
              <div class="form-row">
                <label>Course Code</label>
                <input type="text" id="course_code">
              </div>
              <div class="form-row">
                <label>Title</label>
                <input type="text" id="title">
              </div>
              <div class="form-row">
                <label>Lecture Hours</label>
                <input type="number" id="lecture_hours" min="0">
              </div>
              <div class="form-row">
                <label>Lab Hours</label>
                <input type="number" id="lab_hours" min="0">
              </div>
              <div class="form-row">
                <label>Units</label>
                <input type="number" id="units" min="0">
              </div>
            </div>
            <div class="form-buttons">
              <button id="saveBtn">Save</button>
              <button id="updateBtn" style="display:none;">Update</button>
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