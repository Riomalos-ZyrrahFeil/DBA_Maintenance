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
  <title>Enrollment Maintenance - PUP</title>
  <link rel="stylesheet" href="../dashboard.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dash-main-wrapper">
    <?php include('../component/sidebar.php'); ?>

    <main class="main-content">
      <div class="container">
        <header class="content-header">
          <h1>Enrollment Maintenance</h1>
          <button id="openModalBtn" class="primary-btn">+ Add Enrollment</button>
        </header>

        <div class="table-header">
          <div class="search-container">
            <input type="text" id="search" placeholder="Search enrollments...">
          </div>
          <div class="export-buttons">
            <button id="exportExcelBtn">Export Excel</button>
            <button id="exportPdfBtn">Export PDF</button>
          </div>
        </div>

        <div class="table-container card">
          <table id="enrollmentTable">
            <thead>
              <tr>
                <th data-column="enrollment_id">ID ↕</th>
                <th data-column="student_name">Student Name ↕</th>
                <th data-column="section_code">Section ↕</th>
                <th data-column="enrollment_type">Type ↕</th> 
                <th data-column="date_enrolled">Date ↕</th>
                <th data-column="status">Status ↕</th>
                <th class="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <div class="pagination-component">
            <div class="pagination-info" id="pagination-info"></div>
            <div class="pagination-controls" id="pagination-controls"></div>
          </div>
        </div>

        <div id="enrollmentModal" class="modal">
          <div class="modal-content card">
            <span class="close-modal" id="closeModalBtn">&times;</span>
            <h2 id="modalTitle">Enrollment Form</h2>
            <hr>
            <div class="form-grid">
              <input type="hidden" id="enrollment_id">
              <div class="form-row">
                <label for="student_id">Student</label>
                <select id="student_id">
                  <option value="">Select Student</option>
                </select>
              </div>
              <div class="form-row">
                <label for="enrollment_type">Type</label>
                <select id="enrollment_type">
                  <option value="Regular">Regular</option>
                  <option value="Irregular">Irregular</option>
                </select>
              </div>
              <div class="form-row">
                <label for="section_id">Section</label>
                <select id="section_id">
                  <option value="">Select Section</option>
                </select>
              </div>
              <div class="form-row">
                <label for="date_enrolled">Date Enrolled</label>
                <input type="date" id="date_enrolled">
              </div>
              <div class="form-row">
                <label for="status">Status</label>
                <select id="status">
                  <option value="">Select Status</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Dropped">Dropped</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div class="form-row">
                <label for="letter_grade">Letter Grade</label>
                <input type="text" id="letter_grade" placeholder="e.g. A">
              </div>
            </div>
            <div class="form-buttons">
              <button id="saveBtn">Save Enrollment</button>
              <button id="updateBtn" style="display:none;">Update Changes</button>
              <button id="cancelBtn" class="secondary-btn">Cancel</button>
            </div>
          </div>
        </div>

        <div id="courseDetailsModal" class="modal">
          <div class="modal-content card">
            <span class="close-modal" id="closeCourseDetailsModalBtn">&times;</span>
            <h2 id="courseDetailsTitle">Currently Enrolled Courses</h2>
            <hr>
            <div id="courseDetailsContent">
              <p>Loading course data...</p>
            </div>
            <div class="form-buttons">
              <button id="closeCourseDetailsBtn" class="primary-btn">Close</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>