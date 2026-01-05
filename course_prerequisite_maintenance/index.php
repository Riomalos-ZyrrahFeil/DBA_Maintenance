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
  <title>Course Prerequisite Maintenance - PUP</title>
  <link rel="stylesheet" href="../dashboard.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dash-main-wrapper">
    <?php include('../component/sidebar.php'); ?>

    <main class="main-content">
      <div class="container">
        <header class="content-header">
          <h1>Course Prerequisite Maintenance</h1>
          <button id="addBtn" class="primary-btn">+ Add New Prerequisite</button>
        </header>

        <div class="table-header">
          <div class="search-container">
            <input type="text" id="search" placeholder="Search course or prerequisite...">
          </div>
          <div class="export-buttons">
            <button onclick="exportExcel()">Export Excel</button>
            <button onclick="exportPDF()">Export PDF</button>
          </div>
        </div>

        <div class="table-container card">
          <table id="coursePrereqTable">
            <thead>
              <tr>
                <th data-column="prerequisite_id">ID ↕</th>
                <th data-column="course_code">Course Code ↕</th>
                <th data-column="course_title">Course Title ↕</th>
                <th data-column="prerequisite_code">Prerequisite Code ↕</th>
                <th data-column="prerequisite_name">Prerequisite Name ↕</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="coursePrereqTableBody"></tbody>
          </table>
        </div>

        <div id="formModal" class="modal">
          <div class="modal-content card">
            <span class="close-modal">&times;</span>
            <h2 id="modalTitle">Add New Prerequisite</h2>
            <hr>
            <div class="form-grid">
              <input type="hidden" id="original_prereq_id">
              <input type="hidden" id="original_course_id">
              
              <div class="form-row">
                <label for="course_id">Target Course</label>
                <select id="course_id"></select>
              </div>

              <div class="form-row">
                <label for="prereq_course_id">Prerequisite Course</label>
                <select id="prereq_course_id"></select>
              </div>
            </div>
            <div class="form-buttons">
              <button id="saveBtn">Save Prerequisite</button>
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