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
  <title>Student Maintenance - PUP</title>
  <link rel="stylesheet" href="../dashboard.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dash-main-wrapper">
    <?php include('../component/sidebar.php'); ?>

    <main class="main-content">
      <div class="container">
        <header class="content-header">
          <h1>Student Maintenance</h1>
          <button id="addBtn" class="primary-btn">+ Add New Student</button>
        </header>

        <div class="table-header">
          <div class="search-container">
            <input type="text" id="search" placeholder="Search by name or student no...">
          </div>
          <div class="export-buttons">
            <button onclick="exportExcel()">Export Excel</button>
            <button onclick="exportPDF()">Export PDF</button>
          </div>
        </div>

        <div class="table-container card">
          <table id="studentTable">
            <thead>
              <tr>
                <th data-column="student_id">ID ↕</th>
                <th data-column="student_no">Student No ↕</th>
                <th data-column="student_name">Full Name ↕</th>
                <th data-column="email">Email ↕</th>
                <th data-column="gender">Gender ↕</th>
                <th data-column="year_level">Year Level ↕</th>
                <th data-column="program_id">Program ↕</th>
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
            <h2 id="modalTitle">Add Student</h2>
            <hr>
            <div class="form-grid">
              <input type="hidden" id="student_id">
              <div class="form-row">
                <label for="student_no">Student Number</label>
                <input type="text" id="student_no" placeholder="Enter student number">
              </div>
              <div class="form-row">
                <label for="first_name">First Name</label>
                <input type="text" id="first_name" placeholder="Enter first name">
              </div>
              <div class="form-row">
                <label for="middle_name">Middle Name</label>
                <input type="text" id="middle_name" placeholder="Enter middle name">
              </div>
              <div class="form-row">
                <label for="last_name">Last Name</label>
                <input type="text" id="last_name" placeholder="Enter last name">
              </div>
              <div class="form-row">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter email address">
              </div>
              <div class="form-row">
                <label for="gender">Gender</label>
                <select id="gender">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div class="form-row">
                <label for="birthdate">Birthdate</label>
                <input type="date" id="birthdate">
              </div>
              <div class="form-row">
                <label for="year_level">Year Level</label>
                <select id="year_level">
                  <option value="" disabled selected>Select Year Level</option>
                  <option value="1-1">1-1</option>
                  <option value="1-2">1-2</option>
                  <option value="2-1">2-1</option>
                  <option value="2-2">2-2</option>
                  <option value="3-1">3-1</option>
                  <option value="3-2">3-2</option>
                  <option value="4-1">4-1</option>
                  <option value="4-2">4-2</option>
                </select>
              </div>
              <div class="form-row">
                <label for="program_id">Program</label>
                <select id="program_id">
                  <option value="">Loading programs...</option>
                </select>
              </div>
            </div>
            <div class="form-buttons">
              <button id="saveBtn">Save Student</button>
              <button id="updateBtn" style="display:none;">Update Student</button>
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