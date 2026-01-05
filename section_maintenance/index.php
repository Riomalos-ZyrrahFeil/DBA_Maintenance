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
  <title>Section Maintenance - PUP</title>
  <link rel="stylesheet" href="../dashboard.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dash-main-wrapper">
    <?php include('../component/sidebar.php'); ?>

    <main class="main-content">
      <div class="container">
        <header class="content-header">
          <h1>Section Maintenance</h1>
          <button id="addSectionBtn" class="primary-btn">+ Add New Section</button>
        </header>

        <div class="table-header">
          <div class="search-container">
            <input type="text" id="search" placeholder="Search Sections...">
          </div>
          <div class="export-buttons">
            <button onclick="exportExcel()">Export Excel</button>
            <button onclick="exportPDF()">Export PDF</button>
          </div>
        </div>

        <div class="table-container card">
          <table id="sectionTable">
            <thead>
              <tr>
                <th data-column="section_id">ID ↕</th>
                <th data-column="course_code">Course ↕</th>
                <th data-column="term_code">Term ↕</th>
                <th data-column="instructor_name">Instructor ↕</th>
                <th data-column="room_name">Room ↕</th>
                <th data-column="section_code">Section ↕</th>
                <th data-column="max_capacity">Capacity ↕</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <div class="pagination-component">
            <div class="pagination-info" id="pagination-info"></div>
            <div class="pagination-controls" id="pagination-controls"></div>
          </div>
        </div>

        <div id="formModal" class="modal">
          <div class="modal-content card">
            <span class="close-modal">&times;</span>
            <h2 id="modalTitle">Add New Section</h2>
            <hr>
            <div class="form-grid">
              <input type="hidden" id="section_id">
              <div class="form-row">
                <label for="course_id">Course</label>
                <select id="course_id"></select>
              </div>
              <div class="form-row">
                <label for="term_id">Term</label>
                <select id="term_id"></select>
              </div>
              <div class="form-row">
                <label for="instructor_id">Instructor</label>
                <select id="instructor_id"></select>
              </div>
              <div class="form-row">
                <label for="room_id">Room</label>
                <select id="room_id"></select>
              </div>
              <div class="form-row">
                <label for="section_code">Section Code</label>
                <select id="section_code"></select>
              </div>
              <div class="form-row">
                <label for="year">Year</label>
                <input type="number" id="year" placeholder="Enter Year">
              </div>
              <div class="form-row">
                <label for="day_pattern">Day Pattern</label>
                <input type="text" id="day_pattern" placeholder="e.g. M-W-F">
              </div>
              <div class="form-row">
                <label for="start_time">Start Time</label>
                <input type="time" id="start_time">
              </div>
              <div class="form-row">
                <label for="end_time">End Time</label>
                <input type="time" id="end_time">
              </div>
              <div class="form-row">
                <label for="max_capacity">Max Capacity</label>
                <input type="number" id="max_capacity" placeholder="Enter Capacity">
              </div>
            </div>
            <div class="form-buttons">
              <button id="saveBtn">Save Section</button>
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